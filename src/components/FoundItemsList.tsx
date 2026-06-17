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

import venuesData from "../constants/venues.json";

import { FoundItem } from "../types/items";

// screen component for listings page
export default function FoundItemsList({
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
    // state variables for found items, loading state, refreshing state and error message
    const [items, setItems] = useState<FoundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // function to fetch found items from Firestore
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

    // useEffect to fetch items on component mount
    useEffect(() => {
        fetchFoundItems();
    }, []);

    // function to handle pull-to-refresh action
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFoundItems();
    }, []);

    const parseDate = (dateStr: string): Date => {
        const parts = dateStr.split("/");
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            item.locationFound.toLowerCase().includes(searchQuery.toLowerCase().trim());

        const matchesCategory = !categoryFilter || item.category === categoryFilter;

        const targetVenueObj = venuesData[item.locationFound as keyof typeof venuesData];
        const venueCategory = targetVenueObj ? (targetVenueObj as any).category : "Others";
        const matchesLocation = !locationFilter || venueCategory === locationFilter;
        let matchesDate = true;
        if (item.dateFound) {
            const itemDate = parseDate(item.dateFound);
            
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

    // main render for listings page with FlatList to display found items
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
                                    : "It seems there are no found items reported yet. Check back later!"}
                            </Text>

                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={globalStyles.card}>
                            <Text style={styles.itemName}>{item.itemName}</Text>

                            <View style={globalStyles.detailsContainer}>
                                <DetailRow label="Category" value={item.category} />
                                <DetailRow label="Location Found" value={item.locationFound} />
                                <DetailRow label="Date Found" value={item.dateFound} />
                                <DetailRow label="Description" value={item.description} />
                                <LinkDetailRow label="Image" url={item.imageUrl} />
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
});