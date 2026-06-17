export type FoundItem = {
    id: string;
    itemName: string;
    category: string;
    description: string;
    locationFound: string;
    dateFound: string;
    contactEmail: string;
    contactPhoneNumber: string;
    imageUrl?: string; // Optional field for future use
    createdAt: any; // Firestore timestamp
};

export type LostItem = {
    id: string;
    itemName: string;
    category: string;
    description: string;
    locationLost: string;
    dateLost: string;
    contactEmail: string;
    contactPhoneNumber: string;
    imageUrl?: string; // Optional field for future use
    createdAt: any; // Firestore timestamp
};