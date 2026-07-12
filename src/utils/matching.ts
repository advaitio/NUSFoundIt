import { FoundItem, LostItem, MatchedFoundItem, MatchedLostItem, MatchReason } from "../types/items";
import venuesData from "../constants/venues.json";

const MIN_MATCH_SCORE = 4;

// This function normalizes a string by converting it to lowercase and trimming whitespace.
function normalize(text: string): string {
    return text.toLowerCase().trim();
}

// This function takes a string and returns an array of normalized words,
// filtering out words that are shorter than 4 characters.
function getWords(text: string): string[] {
    return normalize(text).split(/\s+/).filter((word) => word.length >= 3);
}

// This function counts the number of shared words between two strings.
function countSharedWords(textA: string, textB: string): number {
    // Create sets of words for both texts
    const wordsA = new Set(getWords(textA));
    const wordsB = new Set(getWords(textB));
    // The number of shared words is the total unique words minus the unique words in each set
    return wordsA.size + wordsB.size - new Set([...wordsA, ...wordsB]).size;
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