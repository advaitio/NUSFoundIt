import { Label } from "expo-router";
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

        for (let i = 1; i < matches.length; i++) {
            expect(matches[i-1].matchScore).toBeGreaterThanOrEqual(matches[i].matchScore);
        }
    });
});