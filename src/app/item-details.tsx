import { Link, useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { colors, globalStyles, spacing } from "../styles/globalStyles";
import { FoundItem, LostItem, MatchedFoundItem } from "../types/items";
import { getPossibleMatches } from "../utils/matching";

export default function ItemDetails() {
    // Get the type and id parameters from the URL using useLocalSearchParams
    const { type, id } = useLocalSearchParams<{ type: string; id: string }>();

    // State variables for the item details, possible matches, loading state, and error message
    const [item, setItem] = useState<FoundItem | LostItem | null>(null);
    const [matches, setMatches] = useState<MatchedFoundItem[]>([]);
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
                        createdAt: data.createdAt,
                    };

                    setItem(lostItem);

                    const foundItemsQuery = query(collection(db, "foundItems"), orderBy("createdAt", "desc"));
                    const foundSnapshot = await getDocs(foundItemsQuery);

                    const foundItems: FoundItem[] = foundSnapshot.docs.map((doc) => {
                        const foundData = doc.data() as FoundItem;
                        return {
                            ...foundData,
                            id: doc.id,
                        };
                    });

                    setMatches(getPossibleMatches(lostItem, foundItems));
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
                        createdAt: data.createdAt,
                    };
                    setItem(foundItem);
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
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading item details...</Text>
            </View>
        );
    }

    // Render error message if there's an error or if the item is not found
    if (errorMessage || !item) {
        return (
            <View style={globalStyles.centeredScreen}>
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
        <ScrollView style={globalStyles.screen} contentContainerStyle={styles.content}>
            <View style={globalStyles.card}>
                <Text style={styles.heading}>{item.itemName}</Text>

                <DetailRow label="Category" value={item.category} />
                <DetailRow label={isLostItem ? "Location Lost" : "Location Found"} value={location} />
                <DetailRow label={isLostItem ? "Date Lost" : "Date Found"} value={date} />
                <DetailRow label="Description" value={item.description} />
                <DetailRow label="Contact Email" value={item.contactEmail} />
                <DetailRow label="Phone Number" value={item.contactPhoneNumber} />
                <LinkDetailRow label="Image" url={item.imageUrl} />
            </View>

            {/* If it's a lost item, render the possible matches section */}
            {isLostItem ? (
                <View style={globalStyles.card}>
                    <Text style={styles.heading}>Possible Matches</Text>
                    {matches.length === 0 ? (
                        <Text style={globalStyles.placeholderText}>No matches found. Try updating the item details or check back later!</Text>
                    ) : (
                        matches.map((match) => (
                            <Link
                                key={match.id}
                                push
                                href={{
                                    pathname: "/item-details",
                                    params: { type: "found", id: match.id },
                                }}
                                asChild
                            >
                                <Pressable style={styles.matchCard}>
                                    <Text style={styles.matchName}>{match.itemName}</Text>
                                    <Text style={styles.matchText}>Category: {match.category}</Text>
                                    <Text style={styles.matchText}>Location Found: {match.locationFound}</Text>
                                    <Text style={styles.matchText}>Date Found: {match.dateFound}</Text>
                                    <Text style={styles.matchText}>
                                        Match Score: <Text style={styles.matchScore}>{match.matchScore}</Text>
                                    </Text>
                                </Pressable>
                            </Link>
                        ))
                    )}
                </View>
            ) : null}
        </ScrollView>
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
    matchName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: spacing.xs,
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
    linkValue: {
        color: colors.logoSecondary,
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        textDecorationLine: "underline",
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 14,
        color: colors.textPrimary,
        alignSelf: "center",
    },
})