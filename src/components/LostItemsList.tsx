import { Link } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from "react-native";
import { db } from "../firebase/firebaseConfig";
import { colors, globalStyles } from "../styles/globalStyles";

import venuesData from "../constants/venues.json"; //file directly sourced from NUSMods public Github Repository. 

import { LostItem } from "../types/items";

// screen component for listings page
export default function LostItemsList({
    searchQuery,
    categoryFilter,
    locationFilter,
    startDateFilter,
    endDateFilter
}: { searchQuery: string; 
    categoryFilter: string | null;
    locationFilter: string | null;
    startDateFilter: Date | null;
    endDateFilter: Date | null;
}) {
    // state variables for lost items, loading state, refreshing state and error message
    const [items, setItems] = useState<LostItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // function to fetch lost items from Firestore
    async function fetchLostItems() {
        try {
            setErrorMessage("");

            const lostItemsQuery = query(collection(db, "lostItems"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(lostItemsQuery);
            const fetchedItems: LostItem[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                    id: doc.id,
                    itemName: data.itemName ?? "",
                    category: data.category ?? "",
                    description: data.description ?? "",
                    locationLost: data.locationLost ?? "",
                    dateLost: data.dateLost ?? "",
                    contactEmail: data.contactEmail ?? "",
                    contactPhoneNumber: data.contactPhoneNumber ?? "",
                    imageUrl: data.imageUrl ?? "",
                    createdAt: data.createdAt,
                };
            });

            setItems(fetchedItems);
        } catch (error) {
            console.error("Error fetching lost items: ", error);
            setErrorMessage("Failed to load listings. Please try again later.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    // useEffect to fetch items on component mount
    useEffect(() => {
        fetchLostItems();
    }, []);

    // function to handle pull-to-refresh action
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchLostItems();
    }, []);

    const parseDate = (dateStr: string): Date => {
        const parts = dateStr.split("/");
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            item.locationLost.toLowerCase().includes(searchQuery.toLowerCase().trim());

        const matchesCategory = !categoryFilter || item.category === categoryFilter;

        const targetVenueObj = venuesData[item.locationLost as keyof typeof venuesData];
        const venueCategory = targetVenueObj ? (targetVenueObj as any).category : "Others";
        const matchesLocation = !locationFilter || venueCategory === locationFilter;

        let matchesDate = true;
        if (item.dateLost) {
            const itemDate = parseDate(item.dateLost);
            
            if (startDateFilter) {
                const start = new Date(startDateFilter);
                start.setHours(0, 0, 0, 0);
                if (itemDate < start) matchesDate = false;
            }
            if (endDateFilter) {
                const end = new Date(endDateFilter);
                end.setHours(23, 59, 59, 999);
                if (itemDate > end) matchesDate = false;
            }
        }

        return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });

    // sub-component for displaying individual detail rows in the listing cards
    function DetailRow({
        label,
        value,
    }: {
        label: string;
        value?: string;
    }) {
        if (!value) return null;

        return (
            <View style={globalStyles.detailRow}>
                <Text style={globalStyles.detailLabel}>{label}</Text>
                <Text style={globalStyles.detailValue}>{value}</Text>
            </View>
        );
    }

    // sub-component for displaying link rows (e.g. image URL) in the listing cards
    function LinkDetailRow({
        label,
        url,
    }: {
        label: string;
        url?: string
    }) {
        if (!url) return null;

        const validURL = url;

        // helper function to open the URL in the device's default browser
        async function openLink() {
            try {
                if (!validURL.startsWith("http://") && !validURL.startsWith("https://")) {
                    Alert.alert("Invalid URL");
                    return;
                }

                const supported = await Linking.canOpenURL(validURL);

                if (supported) {
                    await Linking.openURL(validURL);
                } else {
                    Alert.alert("Cannot open image", "This image URL could not be opened.");
                }
            } catch (error) {
                console.error("Error opening image URL:", error);
                Alert.alert("Error", "Something went wrong while opening the image URL.");
            }
        }

        return (
            <View style={globalStyles.detailRow}>
                <Text style={globalStyles.detailLabel}>{label}</Text>
                <Pressable onPress={openLink} style={{ flex: 1 }}>
                    <Text style={styles.linkValue}>Open image</Text>
                </Pressable>
            </View>
        )
    }

    // conditional rendering based on loading state, error state and data availability
    if (loading) {
        return (
            <View style={globalStyles.centeredScreen}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading listings...</Text>
            </View>
        );
    }

    // main render for listings page with FlatList to display lost items
    return (
        <View style={globalStyles.screen}>
            {errorMessage ? (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, filteredItems.length === 0 && styles.emptyListContent]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No listings found</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery.trim().length > 0 
                                    ? "We couldn't find anything matching your keywords. Check spelling or try a broader search phrase!" 
                                    : "It seems there are no lost items reported yet. Check back later or submit a report if you've lost something!"}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Link href={{
                            pathname: "/item-details",
                            params: { id: item.id, type: "lost" },
                        }} asChild>
                            <Pressable style={StyleSheet.flatten([globalStyles.card, styles.itemCard])}>
                                <Text style={styles.itemName}>{item.itemName}</Text>

                                <View style={globalStyles.detailsContainer}>
                                    <DetailRow label="Location Lost" value={item.locationLost} />
                                    <DetailRow label="Date Lost" value={item.dateLost} />
                                    <LinkDetailRow label="Image" url={item.imageUrl} />
                                </View>

                                <Text style={styles.viewDetailsText}>View details</Text>
                            </Pressable>
                        </Link>
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
    linkValue: {
        color: colors.primary,
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        textDecorationLine: "underline",
    },
    viewDetailsText: {
        color: colors.logoSecondary,
        fontWeight: "600",
        marginTop: 12,
        textDecorationLine: "underline"
    },
    itemCard: {
        width: "100%",
        alignSelf: "stretch",
    },
});