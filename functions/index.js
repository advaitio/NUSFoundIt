const {setGlobalOptions} = require("firebase-functions/v2");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const venuesData = require("./venuesCopy.json");

admin.initializeApp();

setGlobalOptions({maxInstances: 1, timeoutSeconds: 15, memory: "256MiB"});
const telegramBotToken = "8652620881:AAGJEkITPOYiQSJI0C3RiE6s3BOYFFGZw8s"

// the directly replicated matching system from matching.ts that has also been converted to javascript for compatibility. all of the exact same matching functions were directly imported and changed to javascript. 
const IGNORED_WORDS = new Set([
    "the", "and", "for", "with", "from", "that", "this", "these", "those", "a", "an", "of", "in", "on", "at",
    "item", "items", "lost", "found", "near", "around",
]);

function normalize(text) {
    if (!text) return "";
    return text.toLowerCase().trim();
}

function getWords(text) {
    return normalize(text).split(/\s+/).filter((word) => word.length >= 3 && !IGNORED_WORDS.has(word));
}

function countSharedWords(textA, textB) {
    const wordsA = new Set(getWords(textA));
    const wordsB = new Set(getWords(textB));
    return wordsA.size + wordsB.size - new Set([...wordsA, ...wordsB]).size;
}

function parseDate(dateString) {
    if (!dateString) return null;
    const parts = dateString.split("/");
    if (parts.length !== 3) return null;
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getDateDifferenceInDays(lostDateStr, foundDateStr) {
    const lostDate = parseDate(lostDateStr);
    const foundDate = parseDate(foundDateStr);
    if (!lostDate || !foundDate) return null;
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Math.round((foundDate.getTime() - lostDate.getTime()) / oneDayMs);
}

function isMatchableStatus(status) {
    const normalizedStatus = (status || "active").toLowerCase();
    return normalizedStatus === "active" || normalizedStatus === "claimed";
}

function getVenueCategory(location) {
    if (location && venuesData[location]) {
        return venuesData[location].category || null;
    }
    return null;
}

function scoreCategory(foundItem, lostItem) {
    if (foundItem.category && lostItem.category && foundItem.category === lostItem.category) return 3;
    return 0;
}

function scoreLocation(foundItem, lostItem) {
    const lostLocation = normalize(lostItem.locationLost);
    const foundLocation = normalize(foundItem.locationFound);
    if (!lostLocation || !foundLocation) return 0;
    
    if (lostLocation.includes(foundLocation) || foundLocation.includes(lostLocation)) return 2;
    
    const lostVenueCategory = getVenueCategory(lostLocation);
    const foundVenueCategory = getVenueCategory(foundLocation);
    if (lostVenueCategory && foundVenueCategory && lostVenueCategory === foundVenueCategory) return 1;
    
    return 0;
}

function scoreDate(foundItem, lostItem) {
    const diffDays = getDateDifferenceInDays(lostItem.dateLost, foundItem.dateFound);
    if (diffDays === null) return 0;
    
    if (diffDays < 0) return -2;
    if (diffDays <= 1) return 3;
    if (diffDays <= 3) return 2;
    if (diffDays <= 7) return 1;
    if (diffDays > 14) return -1;
    return 0;
}

function scoreItemName(foundItem, lostItem) {
    const sharedWords = countSharedWords(foundItem.itemName, lostItem.itemName);
    return sharedWords > 0 ? sharedWords * 2 : 0;
}

function scoreDescription(foundItem, lostItem) {
    const sharedWords = countSharedWords(foundItem.description, lostItem.description);
    return sharedWords > 0 ? sharedWords : 0;
}

function getMatchScore(foundItem, lostItem) {
    let score = 0;
    score += scoreCategory(foundItem, lostItem);
    score += scoreLocation(foundItem, lostItem);
    score += scoreDate(foundItem, lostItem);
    score += scoreItemName(foundItem, lostItem);
    score += scoreDescription(foundItem, lostItem);
    return score;
}

exports.notifyFoundItem = onDocumentCreated("foundItems/{itemId}", async (event) => {
    const instance = event.data;
    if (!instance) {
        return;
    }

    const newFoundItem = instance.data();

    try {
        const lostItemsInstance = await admin.firestore().collection("lostItems").get();
        for (const document of lostItemsInstance.docs) {
            const lostItem = document.data();
            const alertsMap = lostItem.telegramAlerts || {};
            const subscriberIds = Object.keys(alertsMap);
            
            if (subscriberIds.length === 0 || !isMatchableStatus(lostItem.status)) {
                continue;
            }

            const score = getMatchScore(newFoundItem, lostItem);
            for (const chatId of subscriberIds) {
                const threshold = Number(alertsMap[chatId]);
                if (score >= threshold) {
                    const message =
`<b>🔴 NUSFoundIt Match Alert! 🔴</b>

A newly reported found item <i>"${newFoundItem.itemName || "Item"}"</i> matches your lost item report with a <b>Match Score of ${score}</b>!

• <b>Category:</b> ${newFoundItem.category || "N/A"}
• <b>Location:</b> ${newFoundItem.locationFound || "N/A"}
• <b>Date:</b> ${newFoundItem.dateFound || "N/A"}

Open the NUSFoundIt app to view more details and contact the finder! <i>(If you wish to opt out of Match Alerts, go back to the same item report and disable Match Alerts.)</i>`;

                    fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({chat_id: chatId, text: message, parse_mode: "HTML"})
                    }).then(async (response) => {
                        if (response.ok) {
                            logger.info(`Notified Chat ID: ${chatId} (Score: ${score}`);
                        } else {
                            logger.error(`Telegram delivery failed for ${chatId}`);
                        }
                    }).catch(error => logger.error(`Error sending to ${chatId}`));
                }
            }
        }
    } catch (error) {
        logger.error("Error processing Telegram notifications:", error);
    }
});

exports.notifyLostItem = onDocumentCreated("lostItems/{itemId}", async (event) => {
    const instance = event.data;
    if (!instance) {
        return;
    }

    const newLostItem = instance.data();

    try {
        const foundItemsInstance = await admin.firestore().collection("foundItems").get();
        for (const document of foundItemsInstance.docs) {
            const foundItem = document.data();
            const alertsMap = foundItem.telegramAlerts || {};
            const subscriberIds = Object.keys(alertsMap);
            
            if (subscriberIds.length === 0 || !isMatchableStatus(foundItem.status)) {
                continue;
            }

            const score = getMatchScore(foundItem, newLostItem);
            for (const chatId of subscriberIds) {
                const threshold = Number(alertsMap[chatId]);
                if (score >= threshold) {
                    const message =
`<b>🔴 NUSFoundIt Match Alert! 🔴</b>

A newly reported lost item <i>"${newLostItem.itemName || "Item"}"</i> matches your found item report with a <b>Match Score of ${score}</b>!

• <b>Category:</b> ${newLostItem.category || "N/A"}
• <b>Location:</b> ${newLostItem.locationLost || "N/A"}
• <b>Date:</b> ${newLostItem.dateLost || "N/A"}

Open the NUSFoundIt app to view more details and contact the owner! <i>(If you wish to opt out of Match Alerts, go back to the same item report and disable Match Alerts.)</i>`;

                    fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({chat_id: chatId, text: message, parse_mode: "HTML"})
                    }).then(async (response) => {
                        if (response.ok) {
                            logger.info(`Notified Chat ID: ${chatId} (Score: ${score}`);
                        } else {
                            logger.error(`Telegram delivery failed for ${chatId}`);
                        }
                    }).catch(error => logger.error(`Error sending to ${chatId}`));
                }
            }
        }
    } catch (error) {
        logger.error("Error processing Telegram notifications:", error);
    }
});