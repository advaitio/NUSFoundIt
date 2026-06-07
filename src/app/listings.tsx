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
import { colors, globalStyles } from "../styles/globalStyles";
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
            <View style={globalStyles.centeredScreen}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading listings...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.screen}>
            <Text style={globalStyles.pageTitle}>Found Items</Text>
            <Text style={globalStyles.pageSubtitle}>Browse recently reported items.</Text>

            {errorMessage ? (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
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
                        <View style={globalStyles.card}>
                            <Text style={styles.itemName}>{item.itemName}</Text>

                            <View style={styles.detailsContainer}>
                                <DetailRow label="Category" value={item.category} />
                                <DetailRow label="Location" value={item.locationFound} />
                                <DetailRow label="Date found" value={item.dateFound} />
                                <DetailRow label="Description" value={item.description} />
                                {(item.imageUrl) ? (
                                    <DetailRow label="Image URL" value={item.imageUrl} />
                                ) : null}
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
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: colors.textMuted,
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
        color: colors.textPrimary,
    },
    emptyText: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 21,
    },
    itemName: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 14,
        color: colors.textPrimary,
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
        color: colors.textPrimary,
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    contactBox: {
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    contactLabel: {
        fontWeight: "700",
        color: "#4b5563",
        marginBottom: 6,
        fontSize: 14,
    },
    contactValue: {
        color: colors.textPrimary,
        fontSize: 14,
        lineHeight: 22,
    },
});