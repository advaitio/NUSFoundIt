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

type TelegramAlerts = Record<string, number>;

type NewItemBase = {
    itemName: string;
    category: string;
    description: string;
    contactEmail: string;
    contactPhoneNumber: string;
    imageUrl?: string;
    expierAt: Date;
    telegramAlerts?: TelegramAlerts;
};

export type NewFoundItem = NewItemBase & {
    locationFound: string;
    dateFound: string;
}

export type NewLostItem = NewItemBase & {
    locationLost: string;
    dateLost: string;
}

// creates found item report and returns its firestore doc id
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

// creates lost item report and returns its firestore doc id
export async function createLostItem(
    database: Firestore,
    item: NewLostItem,
): Promise<string> {
    const documentReference = await addDoc(
        collection(database, "lostItems"),
        {
            ...item,
            imageUrl: item.imageUrl ?? "",
            createdAt: serverTimestamp(),
        }
    );
    return documentReference.id;
}

// retreives all found item reports with newest first
export async function fetchFoundItems(
    database: Firestore,
): Promise<FoundItem[]> {
    const snapshot = await getDocs(
        query(collection(database, "foundItems"), orderBy("createdAt", "desc"))
    );
    
    return snapshot.docs.map((documentSnapshot) => {
        const data = documentSnapshot.data();
        return {
            id: documentSnapshot.id,
            itemName: data.itemName ?? "",
            category: data.category ?? "",
            description: data.description ?? "",
            locationFound: data.locationFound ?? "",
            dateFound: data.dateFound ?? "",
            contactEmail: data.contactEmail ?? "",
            contactPhoneNumber: data.contactPhoneNumber ?? "",
            imageUrl: data.imageUrl ?? "",
            status: data.status ?? "active",
            createdAt: data.createdAt,
        };
    });
}

// retreives all lost item reports with newest first
export async function fetchLostItems(
    database: Firestore,
): Promise<LostItem[]> {
    const snapshot = await getDocs(
        query(collection(database, "lostItems"), orderBy("createdAt", "desc"))
    );
    
    return snapshot.docs.map((documentSnapshot) => {
        const data = documentSnapshot.data();
        return {
            id: documentSnapshot.id,
            itemName: data.itemName ?? "",
            category: data.category ?? "",
            description: data.description ?? "",
            locationLost: data.locationLost ?? "",
            dateLost: data.dateLost ?? "",
            contactEmail: data.contactEmail ?? "",
            contactPhoneNumber: data.contactPhoneNumber ?? "",
            imageUrl: data.imageUrl ?? "",
            status: data.status ?? "active",
            createdAt: data.createdAt,
        };
    });
}