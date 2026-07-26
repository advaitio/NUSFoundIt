import {initializeTestEnvironment, type RulesTestEnvironment} from "@firebase/rules-unit-testing"
import {doc, getDoc, type Firestore} from "firebase/firestore";
import { createFoundItem, createLostItem, fetchFoundItems, fetchLostItems } from "@/services/itemsService";
import { getPossibleFoundMatches } from "@/utils/matching";

const TEST_PROJECT_ID = "demo-nusfoundit-integration";

let testEnvironment: RulesTestEnvironment;

// return firestore instance connected to local emulator
function getTestDatabase(): Firestore {
    return testEnvironment.unauthenticatedContext().firestore() as unknown as Firestore;
}

beforeAll(async () => {
    testEnvironment = await initializeTestEnvironment({
        projectId: TEST_PROJECT_ID,
        firestore: {
            host: "127.0.0.1",
            port: 8080,
        }
    });
});

beforeEach(async () => {await testEnvironment.clearFirestore();});
afterAll(async () => {await testEnvironment.cleanup();});

describe("Firestore integration", () => {
    test("creates and retreives a found-item report", async () => {
        const database = getTestDatabase();

        const documentId = await createFoundItem(database, {
            itemName: "Integration Test Laptop Charger",
            category: "electronics",
            description: "White Apple laptop charger",
            locationFound: "COM3",
            dateFound: "21/07/2026",
            contactEmail: "integration@example.com",
            contactPhoneNumber: "00000000",
            imageUrl: "",
            expireAt: new Date("2026-08-20T00:00:00Z"),
            telegramAlerts: {
                "123456789": 8,
            },
        });

        const documentSnapshot = await getDoc(doc(database, "foundItems", documentId));

        expect(documentSnapshot.exists()).toBe(true);
        
        expect(documentSnapshot.data()).toMatchObject({
            itemName: "Integration Test Laptop Charger",
            category: "electronics",
            description: "White Apple laptop charger",
            locationFound: "COM3",
            dateFound: "21/07/2026",
            contactEmail: "integration@example.com",
            contactPhoneNumber: "00000000",
            imageUrl: "",
            telegramAlerts: {
                "123456789": 8,
            },
        });

        expect(documentSnapshot.data()?.createdAt).toBeDefined();
        expect(documentSnapshot.data()?.expireAt).toBeDefined;
        const fetchedItems = await fetchFoundItems(database);
        expect(fetchedItems).toHaveLength(1);

        expect(fetchedItems[0]).toMatchObject({
            id: documentId,
            itemName: "Integration Test Laptop Charger",
            category: "electronics",
            description: "White Apple laptop charger",
            locationFound: "COM3",
            dateFound: "21/07/2026",
            contactEmail: "integration@example.com",
            contactPhoneNumber: "00000000",
            imageUrl: "",
        });

        expect(fetchedItems[0].createdAt).toBeDefined();
    });
    test("creates and retreives a lost item report using dateLost", async () => {
        const database = getTestDatabase();

        const documentId = await createLostItem(database, {
            itemName: "Integration Test Laptop Charger",
            category: "electronics",
            description: "White Apple laptop charger",
            locationLost: "COM3",
            dateLost: "20/07/2026",
            contactEmail: "integration@example.com",
            contactPhoneNumber: "00000000",
            imageUrl: "",
            expireAt: new Date("2026-08-20T00:00:00Z"),
        });

        const documentSnapshot = await getDoc(doc(database, "lostItems", documentId));
        expect(documentSnapshot.exists()).toBe(true);
        const storedData = documentSnapshot.data();
        
        expect(storedData).toMatchObject({
            itemName: "Integration Test Laptop Charger",
            locationLost: "COM3",
            dateLost: "20/07/2026",
        });

        expect(documentSnapshot.data()?.dateFound).toBeUndefined();
        expect(documentSnapshot.data()?.createdAt).toBeDefined();
        const fetchedItems = await fetchLostItems(database);
        expect(fetchedItems).toHaveLength(1);
        expect(fetchedItems[0].id).toBe(documentId);
        expect(fetchedItems[0].dateLost).toBe("20/07/2026");
    });
})