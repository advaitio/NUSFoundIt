import {
    getMatchDetails,
    getMatchScore,
    getPossibleFoundMatches,
} from "../matching"

import type { FoundItem, LostItem } from "@/types/items";

const lostItem: LostItem = {
    id: "lost-1",
    itemName: "laptop charger",
    category: "Electronics",
    description: "white apple laptop charger",
    locationLost: "COM3",
    dateLost: "20/07/2026",
    contactEmail: "test@email.com",
    contactPhoneNumber: "12345678",
    createdAt: null,
};

const foundItem: FoundItem = {
    id: "found-1",
    itemName: "laptop charger",
    category: "Electronics",
    description: "white laptop charger",
    locationFound: "COM3",
    dateFound: "21/07/2026",
    contactEmail: "testing@email.com",
    contactPhoneNumber: "12345098",
    createdAt: null,
};

describe("matching utilities", () => {
    test("awards points for the same category", () => {
        const result = getMatchDetails(foundItem, lostItem);

        expect(result.reasons).toContainEqual({
            label: "Same category",
            points: 3,
        });
    });
    test("awards points for similar location", () => {
        const result = getMatchDetails(foundItem, lostItem);

        expect(result.reasons).toContainEqual({
            label: "Similar location",
            points: 2,
        });
    });
    test("awards points for items found within 1 day", () => {
        const result = getMatchDetails(foundItem, lostItem);

        expect(result.reasons).toContainEqual({
            label: "Found within 1 day of lost date",
            points: 3,
        });
    });
    test("getMatchScore returns the same calculated score", () => {
        expect(getMatchScore(foundItem, lostItem)).toBe(getMatchDetails(foundItem, lostItem).score);
    });
    test("sorts matches from highest to lowest", () => {
        const weakerMatch: FoundItem = {
            ...foundItem,
            id: "found-2",
            itemName: "adapter",
            description: "small electronic adapter",
            locationFound: "UTown",
            dateFound: "25/07/2026",
        };

        const matches = getPossibleFoundMatches(lostItem, [weakerMatch, foundItem]);

        // both reports pass threshold, stronger comes first, descending scores
        expect(matches).toHaveLength(2);
        expect(matches[0].id).toBe("found-1");
        expect(matches[0].matchScore).toBeGreaterThanOrEqual(matches[1].matchScore);
    });
    test("recognises different venues in the same general location group", () => {
        const lostAtLT17: LostItem = {
            ...lostItem,
            itemName: "wallet",
            description: "leather wallet",
            locationLost: "LT17",
        };

        const foundAtLT16: FoundItem = {
            ...foundItem,
            itemName: "keys",
            description: "metal keys",
            locationFound: "LT16",
        };

        const result = getMatchDetails(foundAtLT16, lostAtLT17);

        expect(result.reasons).toContainEqual({
            label: "Same general location group",
            points: 1,
        });
    });
    test("penalises an item found before the lost date", () => {
        const earlyFoundItem: FoundItem = {
            ...foundItem,
            dateFound: "19/07/2026",
        };

        const result = getMatchDetails(earlyFoundItem, lostItem);

        expect(result.reasons).toContainEqual({
            label: "Found date is before lost date",
            points: -2,
        })
    });
    test("excludes matches below the minimum score", () => {
        const weakMatch: FoundItem = {
            ...foundItem,
            id: "weak-match",
            itemName: "unbrella",
            category: "Electronics",
            description: "blue folding umbrella",
            locationFound: "UTown",
            dateFound: "30/07/2026",
        };

        const matches = getPossibleFoundMatches(lostItem, [weakMatch]);

        expect(matches).toHaveLength(0);
    });
    test("awards 2pts for each shared item-name keyword", () => {
        const keywordFoundItem: FoundItem = {
            ...foundItem,
            itemName: "white laptop charger",
            category: "Other",
            description: "unrelated description",
            locationFound: "UTown",
            dateFound: "30/07/2026",
        };

        const keywordLostItem: LostItem = {
            ...lostItem,
            itemName: "laptop charger",
            category: "Electronics",
            description: "different words",
            locationLost: "COM3",
            dateLost: "20/07/2026",
        };

        const result = getMatchDetails(keywordFoundItem, keywordLostItem);

        expect(result.reasons).toContainEqual({
            label: "Shared item name keywords",
            points: 4,
        });
    });
    test("counts repeated keywords only one", () => {
        const repeatedFoundItem: FoundItem = {
            ...foundItem,
            itemName: "charger charger charger",
            category: "Other",
            description: "unrelated description",
            locationFound: "UTown",
            dateFound: "30/07/2026",
        };

        const repeatedLostItem: LostItem = {
            ...lostItem,
            itemName: "charger",
            category: "Electronics",
            description: "different words",
            locationLost: "COM3",
            dateLost: "20/07/2026",
        };

        const result = getMatchDetails(repeatedFoundItem, repeatedLostItem);

        expect(result.reasons).toContainEqual({
            label: "Shared item name keywords",
            points: 2,
        });
    });
    test("ignores punctuation beside keywords", () => {
        const punctuationFoundItem: FoundItem = {
            ...foundItem,
            itemName: "laptop charger."
        };

        const punctuationLostItem: LostItem = {
            ...lostItem,
            itemName: "laptop charger"
        };

        const result = getMatchDetails(punctuationFoundItem, punctuationLostItem);

        expect(result.reasons).toContainEqual({
            label: "Shared item name keywords",
            points: 4,
        });
    });
});