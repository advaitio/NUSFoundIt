import { Link, Stack, useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { colors, globalStyles, spacing } from "../styles/globalStyles";
import { FoundItem, LostItem, MatchedFoundItem, MatchedLostItem } from "../types/items";
import { getPossibleFoundMatches, getPossibleLostMatches } from "../utils/matching";

export default function ItemDetails() {
    // Get the type and id parameters from the URL using useLocalSearchParams
    const { type, id } = useLocalSearchParams<{ type: string; id: string }>();

    // State variables for the item details, possible matches, loading state, and error message
    const [item, setItem] = useState<FoundItem | LostItem | null>(null);
    const [matches, setMatches] = useState<(MatchedFoundItem | MatchedLostItem)[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch item details and possible matches (if it's a lost item) when the component mounts
    useEffect(() => {
        // Function to fetch item details from Firestore
        async function fetchItemDetails() {
            try {
                if (!id || !type) {
                    setErrorMessage("Missing item information.");
                    return;
                }

                const collectionName = type === "lost" ? "lostItems" : "foundItems";
                const itemRef = doc(db, collectionName, id);
                const itemSnapshot = await getDoc(itemRef);

                if (!itemSnapshot.exists()) {
                    setErrorMessage("Item not found.");
                    return;
                }

                const data = itemSnapshot.data();

                if (type === "lost") {
                    const lostItem: LostItem = {
                        id: itemSnapshot.id,
                        itemName: data.itemName ?? "",
                        category: data.category ?? "",
                        description: data.description ?? "",
                        locationLost: data.locationLost ?? "",
                        dateLost: data.dateLost ?? "",
                        contactEmail: data.contactEmail ?? "",
                        contactPhoneNumber: data.contactPhoneNumber ?? "",
                        imageUrl: data.imageUrl || undefined,
                        status: data.status ?? "active",
                        createdAt: data.createdAt,
                    };

                    setItem(lostItem);

                    const foundItemsQuery = query(collection(db, "foundItems"), orderBy("createdAt", "desc"));
                    const foundSnapshot = await getDocs(foundItemsQuery);

                    const foundItems: FoundItem[] = foundSnapshot.docs.map((doc) => {
                        const foundData = doc.data();
                        return {
                            id: doc.id,
                            itemName: foundData.itemName ?? "",
                            category: foundData.category ?? "",
                            description: foundData.description ?? "",
                            locationFound: foundData.locationFound ?? "",
                            dateFound: foundData.dateFound ?? "",
                            contactEmail: foundData.contactEmail ?? "",
                            contactPhoneNumber: foundData.contactPhoneNumber ?? "",
                            imageUrl: foundData.imageUrl || undefined,
                            status: foundData.status ?? "active",
                            createdAt: foundData.createdAt,
                        };
                    });

                    setMatches(getPossibleFoundMatches(lostItem, foundItems));
                } else {
                    const foundItem: FoundItem = {
                        id: itemSnapshot.id,
                        itemName: data.itemName ?? "",
                        category: data.category ?? "",
                        description: data.description ?? "",
                        locationFound: data.locationFound ?? "",
                        dateFound: data.dateFound ?? "",
                        contactEmail: data.contactEmail ?? "",
                        contactPhoneNumber: data.contactPhoneNumber ?? "",
                        imageUrl: data.imageUrl || undefined,
                        status: data.status ?? "active",
                        createdAt: data.createdAt,
                    };
                    setItem(foundItem);
                    const lostItemsQuery = query(collection(db, "lostItems"), orderBy("createdAt", "desc"));
                    const lostSnapshot = await getDocs(lostItemsQuery);

                    const lostItems: LostItem[] = lostSnapshot.docs.map((doc) => {
                        const lostData = doc.data();
                        return {
                            id: doc.id,
                            itemName: lostData.itemName ?? "",
                            category: lostData.category ?? "",
                            description: lostData.description ?? "",
                            locationLost: lostData.locationLost ?? "",
                            dateLost: lostData.dateLost ?? "",
                            contactEmail: lostData.contactEmail ?? "",
                            contactPhoneNumber: lostData.contactPhoneNumber ?? "",
                            imageUrl: lostData.imageUrl || undefined,
                            status: lostData.status ?? "active",
                            createdAt: lostData.createdAt,
                        };
                    });
                    setMatches(getPossibleLostMatches(foundItem, lostItems));
                }
            } catch (error) {
                console.error("Error fetching item details:", error);
                setErrorMessage("Failed to load item details.");
            } finally {
                setLoading(false);
            }
        }
        fetchItemDetails();
    }, [id, type]);

    // Render loading state, error state, or item details with possible matches
    if (loading) {
        return (
            <View style={globalStyles.centeredScreen}>
                <Stack.Screen options={{title: "Loading"}}/>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading item details...</Text>
            </View>
        );
    }

    // Render error message if there's an error or if the item is not found
    if (errorMessage || !item) {
        return (
            <View style={globalStyles.centeredScreen}>
                <Stack.Screen options={{title: "Not Found"}}/>
                <Text style={globalStyles.errorText}>{errorMessage || "Item not found."}</Text>
            </View>
        )
    }

    // Determine if the item is a lost item or a found item based on the type parameter
    const isLostItem = type === "lost";
    const location = isLostItem ? (item as LostItem).locationLost : (item as FoundItem).locationFound;
    const date = isLostItem ? (item as LostItem).dateLost : (item as FoundItem).dateFound;

    // Render the item details and possible matches if it's a lost item
    return (
        <>
            <Stack.Screen
                options={{
                    title: isLostItem ? "Lost Item Details" : "Found Item Details",
                }}
            />

            <ScrollView style={globalStyles.screen} contentContainerStyle={styles.content}>
                <View style={globalStyles.card}>
                    <Text style={styles.heading}>{item.itemName}</Text>

                    <DetailRow label="Category" value={item.category} />
                    <DetailRow label={isLostItem ? "Location Lost" : "Location Found"} value={location} />
                    <DetailRow label={isLostItem ? "Date Lost" : "Date Found"} value={date} />
                    <DetailRow label="Description" value={item.description} />
                    <DetailRow label="Contact Email" value={item.contactEmail} />
                    <DetailRow label="Phone Number" value={item.contactPhoneNumber} />
                    {item.imageUrl ? (
                        <View style={styles.imageBox}>
                            <Image source={{uri: item.imageUrl}} style={styles.imageDetails}/>
                        </View>
                    ) : null}
                </View>

                {/* render possible matches for lost/found items */}
                <View style={globalStyles.card}>
                    <Text style={styles.heading}>{isLostItem ? "Possible Found Item Matches" : "Possible Lost Item Matches"}</Text>
                    {matches.length === 0 ? (
                        <Text style={globalStyles.placeholderText}>
                            {isLostItem
                                ? "No matching found items yet. Check back later!"
                                : "No matching lost item reports yet. Check back later!"}
                        </Text>
                    ) : (
                        matches.map((match) => {
                            const matchType = isLostItem ? "found" : "lost";
                            const matchLocation = isLostItem ? (match as FoundItem).locationFound : (match as LostItem).locationLost;
                            const matchDate = isLostItem ? (match as FoundItem).dateFound : (match as LostItem).dateLost;

                            return (
                                <Link
                                    key={match.id}
                                    push
                                    href={{
                                        pathname: "/item-details",
                                        params: { type: matchType, id: match.id },
                                    }}
                                    asChild
                                >
                                    <Pressable style={styles.matchCard}>
                                        <View style={styles.matchHeader}>
                                            <Text style={styles.matchName}>{match.itemName}</Text>

                                            <View style={styles.scorePill}>
                                                <Text style={styles.scorePillText}>Score {match.matchScore}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.matchReasonsContainer}>
                                            <Text style={styles.matchReasonsTitle}>Why this matched:</Text>
                                            {match.matchReasons.map((reason, index) => (
                                                <Text key={index} style={styles.matchReasonText}>
                                                    - {reason.label} ({reason.points > 0 ? "+" : ""}{reason.points}) {/* Display the reason and its points */}
                                                </Text>
                                            ))}
                                        </View>

                                        <Text style={styles.viewDetailsText}>Tap to view full item details.</Text>
                                    </Pressable>
                                </Link>
                            )
                        })
                    )}
                </View>

            </ScrollView>
        </>
    )
}

// Reusable component to display a label and value for item details
function DetailRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <View style={globalStyles.detailRow}>
            <Text style={globalStyles.detailLabel}>{label}:</Text>
            <Text style={globalStyles.detailValue}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    loadingText: {
        marginTop: spacing.md,
        color: colors.textMuted,
    },
    content: {
        paddingBottom: spacing.xxxl,
    },
    matchCard: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 4,
        borderLeftColor: colors.logoAccent,
    },
    matchHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    matchName: {
        flex: 1,
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    matchText: {
        lineHeight: 20,
        color: colors.textSecondary,
    },
    matchScore: {
        color: colors.logoAccent,
        fontWeight: "700",
    },
    heading: {
        fontSize: 23,
        fontWeight: "bold",
        marginBottom: 14,
        color: colors.textPrimary,
        alignSelf: "center",
    },
    matchReasonsContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    matchReasonsTitle: {
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    matchReasonText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
    scorePill: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: colors.logoAccent,
        backgroundColor: colors.surface,
    },
    scorePillText: {
        fontSize: 14,
        color: colors.logoAccent,
        fontWeight: "800",
    },
    viewDetailsText: {
        marginTop: spacing.md,
        color: colors.logoSecondary,
        fontSize: 13,
        fontWeight: "700",
    },
    imageBox: {
        width: "100%",
        alignItems: "center",
    },
    imageDetails: {
        width: "100%",
        resizeMode: "cover",
        height: 500,
        borderRadius: 8,
    }
})