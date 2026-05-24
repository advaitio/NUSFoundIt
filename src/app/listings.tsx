import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet, 
    Text, 
    View 
} from "react-native";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// create found item typep for better type safety
type FoundItem = {
    id: string;
    itemName: string;
    category: string;
    description: string;
    locationFound: string;
    dateFound: string;
    contactInfo: string;
    imageUrl?: string; // Optional field for future use
    createdAt: any; // Firestore timestamp
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: "center",
        color: "#666",
    },
});

export default function ListingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Public Listings</Text>
            <Text style={styles.subtitle}>This screen will display the submitted reports for the found item.</Text>
        </View>
    )
}