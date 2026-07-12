import { FoundItem, LostItem, MatchedFoundItem, MatchedLostItem, MatchReason } from "../types/items";
import venuesData from "../constants/venues.json";

const MIN_MATCH_SCORE = 4;

const IGNORED_WORDS = new Set([
    "the", "and", "for", "with", "from", "that", "this", "these", "those", "a", "an", "of", "in", "on", "at",
    "item", "items", "lost", "found", "near", "around",
])

// normalizes a string before comparison
function normalize(text: string): string {
    return text.toLowerCase().trim();
}

// takes a string and splits it into useful words
function getWords(text: string): string[] {
    return normalize(text).split(/\s+/).filter((word) => word.length >= 3 && !IGNORED_WORDS.has(word));
}

// counts shared words between two strings.
function countSharedWords(textA: string, textB: string): number {
    // create sets of words for both texts
    const wordsA = new Set(getWords(textA));
    const wordsB = new Set(getWords(textB));
    // num shared words is total unique words minus the unique words in each set
    return wordsA.size + wordsB.size - new Set([...wordsA, ...wordsB]).size;
}


// parse date str in dd/mm//yyyy format to date object
function parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    const parts = dateString.split("/");
    if (parts.length !== 3) return null; //invalid
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (!day || !month || !year) return null; //invalid
    const date = new Date(year, month - 1, day); // javascript months are 0-indexed
    date.setHours(0, 0, 0, 0); //normalize to midnight
    return date;
}

// calculates the diff in days (+ve means found after lost)
function getDateDifferenceInDays(lostDateStr: string, foundDateStr: string): number | null {
    const lostDate = parseDate(lostDateStr);
    const foundDate = parseDate(foundDateStr);

    if (!lostDate || !foundDate) return null; //invalid

    const oneDayMs = 24 * 60 * 60 * 1000; // hrs*mins*secs*millisecs
    return Math.round((foundDate.getTime() - lostDate.getTime()) / oneDayMs); // returns diff in days
}

// checks if item status is matchable (active/claimed)
function isMatchableStatus(status?: string): boolean {
    const normalizedStatus = status?.toLowerCase() ?? "active"; // default to active if status is undefined/null
    return normalizedStatus === "active" || normalizedStatus === "claimed";
}

// gets category of venue based on location
function getVenueCategory(location: string): string | null {
    if (location in venuesData) {
        const venue = venuesData[location as keyof typeof venuesData];
        return venue.category ?? null;
    }
    return null; // location not found
}

// 3pts for matching categories
function scoreCategory(foundItem: FoundItem, lostItem: LostItem): MatchReason | null {
    if (foundItem.category && lostItem.category && foundItem.category === lostItem.category) {
        return { label: "Same category", points: 3 };
    }
    return null;
}

// 2pts for matching locations
function scoreLocation(foundItem: FoundItem, lostItem: LostItem): MatchReason | null {
    const lostLocation = normalize(lostItem.locationLost);
    const foundLocation = normalize(foundItem.locationFound);

    if (!lostLocation || !foundLocation) return null; //no score if either empty

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

// scores depend on date proximity
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
        return { label: "Found within 3 day of lost date", points: 2 };
    }

    if (diffDays <= 7) {
        return { label: "Found within 1 week of lost date", points: 1 };
    }

    if (diffDays > 14) {
        return { label: "Found more than 2 weeks after lost date", points: -1 };
    }

    return null; //no score for 1-2wks
}

// This function calculates a match score between a found item and a lost item 
// based on category, location, and shared words in the name and description.
export function getMatchScore(foundItem: FoundItem, lostItem: LostItem): number {
    let score = 0;

    // 3 pts for matching categories
    if (lostItem.category === foundItem.category) {
        score += 3;
    }

    // 2 pts for matching locations (case insensitive)
    const lostLocation = normalize(lostItem.locationLost);
    const foundLocation = normalize(foundItem.locationFound);
    if (lostLocation && 
        foundLocation && 
        (lostLocation.includes(foundLocation) || foundLocation.includes(lostLocation))) {
            score += 2;
    }

    // 2 pts for each shared word in the item name
    score += countSharedWords(lostItem.itemName, foundItem.itemName) * 2;
    // 1 pt for each shared word in the description
    score += countSharedWords(lostItem.description, foundItem.description);

    return score;
}

// This functiontakes a lost item and a list of found items, 
// calculates the match score for each found item, 
// filters out those with a score less than 3, 
// and sorts the remaining items by their match score in descending order.
export function getPossibleMatches(lostItem: LostItem, foundItems: FoundItem[]): MatchedFoundItem[] {
    return foundItems
        .map((foundItem) => ({
            ...foundItem,
            matchScore: getMatchScore(foundItem, lostItem),
        }))
        .filter((item) => item.matchScore >= MIN_MATCH_SCORE)
        .sort((a, b) => b.matchScore - a.matchScore);
}