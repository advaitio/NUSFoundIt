import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from "react-native";
import { db } from "../firebase/firebaseConfig";

// create found item type for better type safety
type FoundItem = {
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

export default function ListingsScreen() {
    const [items, setItems] = useState<FoundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function fetchFoundItems() {
        try {
            setErrorMessage("");

            const foundItemsQuery = query(collection(db, "foundItems"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(foundItemsQuery);
            const fetchedItems: FoundItem[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                    id: doc.id,
                    itemName: data.itemName ?? "",
                    category: data.category ?? "",
                    description: data.description ?? "",
                    locationFound: data.locationFound ?? "",
                    dateFound: data.dateFound ?? "",
                    contactEmail: data.contactEmail ?? "",
                    contactPhoneNumber: data.contactPhoneNumber ?? "",
                    imageUrl: data.imageUrl ?? "",
                    createdAt: data.createdAt,
                };
            });

            setItems(fetchedItems);
        } catch (error) {
            console.error("Error fetching found items: ", error);
            setErrorMessage("Failed to load listings. Please try again later.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchFoundItems();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFoundItems();
    }, []);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading listings...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Public Listings</Text>
            <Text style={styles.subtitle}>Browse recently found items reported by the NUS community.</Text>

            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, items.length === 0 && styles.emptyListContent]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No listings found</Text>
                            <Text style={styles.emptyText}>It seems there are no found items reported yet. Check back later or submit a report if you've found something!</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.itemName}>{item.itemName}</Text>
                            <Text style={styles.label}>Category:</Text>
                            <Text style={styles.value}>{item.category}</Text>
                            <Text style={styles.label}>Location Found:</Text>
                            <Text style={styles.value}>{item.locationFound}</Text>
                            <Text style={styles.label}>Date Found:</Text>
                            <Text style={styles.value}>{item.dateFound}</Text>
                            {item.description ? (
                                <>
                                    <Text style={styles.label}>Description:</Text>
                                    <Text style={styles.description}>{item.description}</Text>
                                </>
                            ) : null}
                            {item.contactEmail || item.contactPhoneNumber ? (
                                <View style={styles.contactContainer}>
                                    <Text style={styles.label}>Contact:</Text>

                                    {item.contactEmail ? (
                                        <Text style={styles.contactText}>{item.contactEmail}</Text>
                                    ) : null}

                                    {item.contactPhoneNumber ? (
                                        <Text style={styles.contactText}>{item.contactPhoneNumber}</Text>
                                    ) : null}
                                </View>
                            ) : null}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    centerContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: "#666",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        marginBottom: 16,
    },
    errorText: {
        color: "#d32f2f",
        marginBottom: 12,
        fontSize: 14,
        fontWeight: "600",
    },
    listContent: {
        paddingBottom: 24,
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    emptyContainer: {
        alignItems: "center",
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
    },
    card: {
        backgroundColor: "#f8f9fb",
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    itemName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    value: {
        fontWeight: "400",
        color: "#333",
    },
    description: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
    },
    contactContainer: {
        marginTop: 10,
    },
    contactText: {
        fontSize: 14,
        color: "#007AFF",
        fontWeight: "600",
        marginTop: 2,
    },
});