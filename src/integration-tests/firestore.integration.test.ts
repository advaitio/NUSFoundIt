import { createFoundItem, createLostItem, fetchFoundItems, fetchLostItems } from "@/services/itemsService";
import { getPossibleFoundMatches } from "@/utils/matching";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, type Firestore } from "firebase/firestore";

// keep away from app's real firebase project
const TEST_PROJECT_ID = "demo-nusfoundit-integration"; 

let testEnvironment: RulesTestEnvironment;

function getTestDatabase(): Firestore {
    // casting to unknown because firebase type mismatch in test runner
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
        expect(documentSnapshot.data()?.expireAt).toBeDefined();
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

        // manually creating test report
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

        const documentSnapshot = await getDoc(doc(database, "lostItems", documentId)); // retreive exact doc from emulator
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
    test("matches reports retreived from firestore", async () => {
        const database = getTestDatabase();

        // intentionally strongly related report
        const foundDocumentId = await createFoundItem(database, {
            itemName: "Laptop Charger",
            category: "electronics",
            description: "White Apple laptop charger",
            locationFound: "COM3",
            dateFound: "20/07/2026",
            contactEmail: "integration@example.com",
            contactPhoneNumber: "00000000",
            imageUrl: "",
            expireAt: new Date("2026-08-20T00:00:00Z"),
        });

        // exact matching details to ensure match
        await createLostItem(database, {
            itemName: "Laptop Charger",
            category: "electronics",
            description: "White Apple laptop charger",
            locationLost: "COM3",
            dateLost: "20/07/2026",
            contactEmail: "integration@example.com",
            contactPhoneNumber: "00000000",
            imageUrl: "",
            expireAt: new Date("2026-08-20T00:00:00Z"),
        })

        const [foundItems, lostItems] = await Promise.all([fetchFoundItems(database), fetchLostItems(database)]);
        expect(foundItems).toHaveLength(1);
        expect(lostItems).toHaveLength(1);

        const matches = getPossibleFoundMatches(lostItems[0], foundItems);

        expect(matches.length).toBeGreaterThan(0);
        expect(matches[0].id).toBe(foundDocumentId);
        // hardcoded score cutoff from matching logic
        expect(matches[0].matchScore).toBeGreaterThanOrEqual(4);
        expect(matches[0].matchReasons.length).toBeGreaterThan(0);
    });
})