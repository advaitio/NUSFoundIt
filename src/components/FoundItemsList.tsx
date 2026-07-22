import { Link } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from "react-native";
import { db } from "../firebase/firebaseConfig";
import { colors, globalStyles } from "../styles/globalStyles";

import venuesData from "../constants/venues.json"; //file directly sourced from NUSMods public Github Repository. 

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
                    status: data.status ?? "active",
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
                        <Link href={{
                            pathname: "/item-details",
                            params: { id: item.id, type: "found" },
                        }} asChild>
                            <Pressable style={StyleSheet.flatten([globalStyles.card, styles.itemCard])}>
                                <View style={styles.cardRow}>
                                    {item.imageUrl ? (
                                        <Image
                                            source={{uri: item.imageUrl}}
                                            style={styles.thumbnail}/>
                                    ) : null}

                                    <View style={styles.textBox}>
                                        <View style={styles.titleRow}>
                                            <Text style={styles.itemName}>{item.itemName}</Text>
                                            <Image 
                                                source={require("../../assets/images/right-arrow.png")} 
                                                style={{width: 25, height: 25}}
                                                tintColor={colors.logoMain}/>
                                        </View>
                                        <View style={styles.detailsContainer}>
                                            <View style={globalStyles.detailRow}>
                                                <Image 
                                                    source={require("../../assets/images/location.png")} 
                                                    style={{width: 25, height: 25}}
                                                    tintColor={colors.logoMain}/>
                                                <Text style={globalStyles.detailLabel}>{item.locationFound}</Text>
                                            </View>
                                            <View style={globalStyles.detailRow}>
                                                <Image 
                                                    source={require("../../assets/images/calendar.png")} 
                                                    style={{width: 25, height: 25}}
                                                    tintColor={colors.logoMain}/>
                                                <Text style={globalStyles.detailLabel}>{item.dateFound}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
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
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textPrimary,
        flex: 1,
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
    itemCard: {
        alignSelf: "stretch",
        marginHorizontal: 4,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 14,
    },
    textBox: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    }
});