import venuesData from "../constants/venues.json";
import { FoundItem, LostItem, MatchedFoundItem, MatchedLostItem, MatchReason } from "../types/items";

const MIN_MATCH_SCORE = 4;

const IGNORED_WORDS = new Set([
    "the", "and", "for", "with", "from", "that", "this", "these", "those", "a", "an", "of", "in", "on", "at",
    "item", "items", "lost", "found", "near", "around",
])

function normalize(text: string): string {
    return text.toLowerCase().trim();
}

// splitting str into useful words
function getWords(text: string): string[] {
    return normalize(text).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((word) => word.length >= 3 && !IGNORED_WORDS.has(word));
}

function countSharedWords(textA: string, textB: string): number {
    // need two sets for both texts
    const wordsA = new Set(getWords(textA));
    const wordsB = new Set(getWords(textB));
    // num shared words is total unique words minus the unique words in each set (using the set formula)
    return wordsA.size + wordsB.size - new Set([...wordsA, ...wordsB]).size; 
}

function parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    const parts = dateString.split("/");
    if (parts.length !== 3) return null; //invalid
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (!day || !month || !year) return null; //invalid
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getDateDifferenceInDays(lostDateStr: string, foundDateStr: string): number | null {
    const lostDate = parseDate(lostDateStr);
    const foundDate = parseDate(foundDateStr);

    if (!lostDate || !foundDate) return null; //invalid

    const oneDayMs = 24 * 60 * 60 * 1000;
    return Math.round((foundDate.getTime() - lostDate.getTime()) / oneDayMs); // negative means found before lost
}

// checks if item status is matchable (active/claimed)
function isMatchableStatus(status?: string): boolean {
    const normalizedStatus = status?.toLowerCase() ?? "active"; // if status is undefined
    return normalizedStatus === "active" || normalizedStatus === "claimed";
}

//case insensitive lookup from venue name to venue category
const venueCategoryByName = new Map<string, string | null>(
    Object.entries(venuesData).map(([name, venue]) => [
        normalize(name),
        venue.category ?? null,
    ])
);

// search for venue category
function getVenueCategory(location: string): string | null {
    return venueCategoryByName.get(normalize(location)) ?? null;
}

function scoreCategory(foundItem: FoundItem, lostItem: LostItem): MatchReason | null {
    if (foundItem.category && lostItem.category && foundItem.category === lostItem.category) {
        return { label: "Same category", points: 3 };
    }
    return null;
}

function scoreLocation(foundItem: FoundItem, lostItem: LostItem): MatchReason | null {
    const lostLocation = normalize(lostItem.locationLost);
    const foundLocation = normalize(foundItem.locationFound);

    if (!lostLocation || !foundLocation) return null;

    if (lostLocation.includes(foundLocation) || foundLocation.includes(lostLocation)) {
        return { label: "Similar location", points: 2 };
    }

    const lostVenueCategory = getVenueCategory(lostLocation);
    const foundVenueCategory = getVenueCategory(foundLocation);

    if (lostVenueCategory && foundVenueCategory && lostVenueCategory === foundVenueCategory) {
        return { label: "Same general location group", points: 1 };
    }

    return null;
}

// depending on date proximity, award or penalise
function scoreDate(foundItem: FoundItem, lostItem: LostItem): MatchReason | null {
    const diffDays = getDateDifferenceInDays(lostItem.dateLost, foundItem.dateFound);
    if (diffDays === null) return null; //invalid dates

    if (diffDays < 0) {
        return { label: "Found date is before lost date", points: -2 };
    }

    if (diffDays <= 1) {
        return { label: "Found within 1 day of lost date", points: 3 };
    }

    if (diffDays <= 3) {
        return { label: "Found within 3 days of lost date", points: 2 };
    }

    if (diffDays <= 7) {
        return { label: "Found within 1 week of lost date", points: 1 };
    }

    if (diffDays > 14) {
        return { label: "Found more than 2 weeks after lost date", points: -1 };
    }

    return null; //no bonus/penalty for 1-2wks
}

function scoreItemName(foundItem: FoundItem, lostItem: LostItem): MatchReason | null {
    const sharedWords = countSharedWords(foundItem.itemName, lostItem.itemName);
    if (sharedWords > 0) {
        return { label: "Shared item name keywords", points: sharedWords * 2 };
    }
    return null;
}

function scoreDescription(foundItem: FoundItem, lostItem: LostItem): MatchReason | null {
    const sharedWords = countSharedWords(foundItem.description, lostItem.description);
    if (sharedWords > 0) {
        return { label: "Shared item description keywords", points: sharedWords };
    }
    return null;
}

export function getMatchDetails(foundItem: FoundItem, lostItem: LostItem): { score: number; reasons: MatchReason[]; } {
    const possibleReasons = [
        scoreCategory(foundItem, lostItem),
        scoreLocation(foundItem, lostItem),
        scoreDate(foundItem, lostItem),
        scoreItemName(foundItem, lostItem),
        scoreDescription(foundItem, lostItem),
    ];
    const reasons = possibleReasons.filter((reason): reason is MatchReason => reason !== null); //filter out nulls
    const score = reasons.reduce((acc, reason) => acc + reason.points, 0); //sum of pts
    return { score, reasons };
}

export function getMatchScore(foundItem: FoundItem, lostItem: LostItem): number {
    return getMatchDetails(foundItem, lostItem).score;
}

export function getPossibleFoundMatches(lostItem: LostItem, foundItems: FoundItem[]): MatchedFoundItem[] {
    return foundItems
        .filter((foundItem) => isMatchableStatus(foundItem.status))
        .map((foundItem) => {
            const matchDetails = getMatchDetails(foundItem, lostItem);
            return {
                ...foundItem,
                matchScore: matchDetails.score,
                matchReasons: matchDetails.reasons,
            };
        })
        .filter((item) => item.matchScore >= MIN_MATCH_SCORE)
        .sort((a, b) => b.matchScore - a.matchScore);
}

export function getPossibleLostMatches(foundItem: FoundItem, lostItems: LostItem[]): MatchedLostItem[] {
    return lostItems
        .filter((lostItem) => isMatchableStatus(lostItem.status))
        .map((lostItem) => {
            const matchDetails = getMatchDetails(foundItem, lostItem);
            return {
                ...lostItem,
                matchScore: matchDetails.score,
                matchReasons: matchDetails.reasons,
            };
        })
        .filter((item) => item.matchScore >= MIN_MATCH_SCORE)
        .sort((a, b) => b.matchScore - a.matchScore);
}