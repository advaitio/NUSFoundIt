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

    function DetailRow({
        label,
        value,
    }: {
        label: string;
        value?: string;
    }) {
        if (!value) return null;

        return (
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        );
    }

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

                            <View style={styles.detailsContainer}>
                                <DetailRow label="Category" value={item.category} />
                                <DetailRow label="Location" value={item.locationFound} />
                                <DetailRow label="Date found" value={item.dateFound} />
                                <DetailRow label="Description" value={item.description} />
                            </View>

                            {(item.contactEmail || item.contactPhoneNumber) ? (
                                <View style={styles.contactBox}>
                                    <Text style={styles.contactLabel}>Contact</Text>

                                    {item.contactEmail ? (
                                        <Text style={styles.contactValue}>{item.contactEmail}</Text>
                                    ) : null}

                                    {item.contactPhoneNumber ? (
                                        <Text style={styles.contactValue}>{item.contactPhoneNumber}</Text>
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
        color: "#111827",
    },
    subtitle: {
        fontSize: 15,
        color: "#6b7280",
        marginBottom: 16,
        lineHeight: 21,
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
        color: "#111827",
    },
    emptyText: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 21,
    },
    card: {
        backgroundColor: "#f9fafb",
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    itemName: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 14,
        color: "#111827",
    },
    detailsContainer: {
        gap: 10,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    detailLabel: {
        fontWeight: "700",
        color: "#4b5563",
        width: 95,
        fontSize: 14,
    },
    detailValue: {
        color: "#111827",
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    contactBox: {
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    contactLabel: {
        fontWeight: "700",
        color: "#4b5563",
        marginBottom: 6,
        fontSize: 14,
    },
    contactValue: {
        color: "#111827",
        fontSize: 14,
        lineHeight: 22,
    },
});