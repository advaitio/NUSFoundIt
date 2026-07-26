import {
    addDoc,
    collection,
    Firestore,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";

import type { FoundItem, LostItem } from "@/types/items";

export type NewFoundItem = Omit<FoundItem, "id" | "createdAt">;
export type NewLostItem = Omit<LostItem, "id" | "createdAt">;

export async function createFoundItem(
    database: Firestore,
    item: NewFoundItem,
): Promise<string> {
    const documentReference = await addDoc(
        collection(database, "foundItems"),
        {
            ...item,
            imageUrl: item.imageUrl ?? "",
            createdAt: serverTimestamp(),
        }
    );
    return documentReference.id;
}

export async function fetchFoundItems(
    database: Firestore,
): Promise<FoundItem[]> {
    const snapshot = await getDocs(
        query(collection(database, "foundItems"), orderBy("createdAt", "desc"))
    );
    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
    })) as FoundItem[];
}

export async function fetchLostItems(
    database: Firestore,
): Promise<LostItem[]> {
    const snapshot = await getDocs(
        query(collection(database, "lostItems"), orderBy("createdAt", "desc"))
    );
    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
    })) as LostItem[];
}