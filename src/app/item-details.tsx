import { Link, Stack, useLocalSearchParams } from "expo-router";
import { collection, deleteField, doc, getDoc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { colors, globalStyles, spacing } from "../styles/globalStyles";
import { FoundItem, LostItem, MatchedFoundItem, MatchedLostItem } from "../types/items";
import { getPossibleFoundMatches, getPossibleLostMatches } from "../utils/matching";

// import {updateDoc} from "firebase/firestore"

const getPlaceholderImage = (category: string) => {
    switch (category.toLowerCase()) {
        case "id card": 
            return require("../../assets/images/placeholder-id.png");
        case "wallet": 
            return require("../../assets/images/placeholder-wallet.png");
        case "bottle": 
            return require("../../assets/images/placeholder-bottle.png");
        case "phone": 
            return require("../../assets/images/placeholder-phone.png");
        case "laptop": 
            return require("../../assets/images/placeholder-laptop.png");
        case "keys": 
            return require("../../assets/images/placeholder-keys.png");
        case "electronics": 
            return require("../../assets/images/placeholder-electronics.png");
        case "clothing": 
            return require("../../assets/images/placeholder-clothing.png");
        default: 
            return require("../../assets/images/placeholder-other.png"); 
    }
};

export default function ItemDetails() {
    // Get the type and id parameters from the URL using useLocalSearchParams
    const { type, id } = useLocalSearchParams<{ type: string; id: string }>();

    // State variables for the item details, possible matches, loading state, and error message
    const [item, setItem] = useState<FoundItem | LostItem | null>(null);
    const [matches, setMatches] = useState<(MatchedFoundItem | MatchedLostItem)[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [imageRatio, setImageRatio] = useState(1);

    const [telegramId, setTelegramId] = useState("");
    const [threshold, setThreshold] = useState("");
    const [isSavingAlert, setIsSavingAlert] = useState(false);
    const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

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

    useEffect(() => {
        if (item && item.imageUrl) {
            Image.getSize(item.imageUrl, (width, height) => {
                setImageRatio(width / height);
            });
        }
    }, [item]);

    const saveAlertSettings = async () => {
        if (!telegramId) {
            const message = "Please enter your Telegram account ID.";
            if (Platform.OS === "web") {
                alert("Error\n" + message);
            } else {
                Alert.alert("Error\n", message);
            }
            return;
        }

        if (!telegramId) {
            const message = "Please enter your minimum Match Score.";
            if (Platform.OS === "web") {
                alert("Error\n" + message);
            } else {
                Alert.alert("Error\n", message);
            }
            return;
        }

        setIsSavingAlert(true);
        try {
            const collectionName = type === "lost" ? "lostItems" : "foundItems";
            await updateDoc(doc(db, collectionName, id), {[`telegramAlerts.${telegramId}`]: parseInt(threshold)});
            if (Platform.OS === "web") {
                // Alert does not work on web interface, had to use the native alert() to implement deployment
                alert("Success\nTelegram alerts enabled!");
            } else {
                Alert.alert("Success\n", "Telegram alerts enabled!");
            }
        } catch (error) {
            console.error("Error saving alerts:", error);
            Alert.alert("Error", "Could not save alert settings");
        } finally {
            setIsSavingAlert(false);
        }
        
        setTelegramId("");
        setThreshold("");
    };

    const disableAlerts = async () => {
        if (!telegramId) {
            const message = "Please enter your Telegram account ID.";
            if (Platform.OS === "web") {
                alert("Error\n" + message);
            } else {
                Alert.alert("Error\n", message);
            }
            return;
        }

        setIsSavingAlert(true);
        try {
            const collectionName = type === "lost" ? "lostItems" : "foundItems";
            await updateDoc(doc(db, collectionName, id), {[`telegramAlerts.${telegramId}`]: deleteField()});
            setTelegramId("");
            setThreshold("");
            if (Platform.OS === "web") {
                // Alert does not work on web interface, had to use the native alert() to implement deployment
                alert("Success\nMatch Alerts have been successfully disabled for this item.");
            } else {
                Alert.alert("Success\n", "Match Alerts have been successfully disabled for this item.");
            }
        } catch {
            console.error("Error", "could not disable Match Alerts.")
        } finally {
            setIsSavingAlert(false);
        }

        setTelegramId("");
        setThreshold("");
        setShowAlertsDropdown(false);
    };

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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={focusedField ? 100 : 0}
                style={{ flex: 1, backgroundColor: colors.background }}>
                <ScrollView style={[globalStyles.screen, {paddingHorizontal: spacing.xxl}]} contentContainerStyle={styles.content}>
                    <View style={styles.imageBox}>
                        <Image source={item.imageUrl ? {uri: item.imageUrl} : getPlaceholderImage(item.category)} style={[styles.imageDetails, item.imageUrl ? {aspectRatio: imageRatio} : {height: 400, resizeMode: "contain", opacity: 0.4}]}/>
                        {!item.imageUrl && (
                            <View style={styles.placeholderBadge}>
                                <Text style={styles.placeholderBadgeText}>NO PHOTO</Text>
                            </View>
                        )}
                    </View>

                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, marginTop: 10}}>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5}}>
                            <Image
                                source={require("../../assets/images/location.png")} 
                                style={{width: 25, height: 25}}
                                tintColor={colors.textPrimary}/>
                            <Text style={{fontSize: 16, fontWeight: "bold", color: colors.textPrimary}}>{location}</Text>
                        </View>

                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5}}>
                            <Image
                                source={require("../../assets/images/calendar.png")} 
                                style={{width: 25, height: 25}}
                                tintColor={colors.textPrimary}/>
                            <Text style={{fontSize: 16, fontWeight: "bold", color: colors.textPrimary}}>{date}</Text>
                        </View>
                    </View>

                    <View style={{flexDirection: "row", alignItems: "center", paddingHorizontal: 8, gap: 10}}>
                        <Text style={[styles.heading, {fontSize: 30}]}>{item.itemName}</Text>

                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 5, marginBottom: 5}}>
                            <Image
                                source={require("../../assets/images/pricetag.png")} 
                                style={{width: 25, height: 25}}
                                tintColor={colors.logoAccent}/>
                            <Text style={{fontSize: 16, fontWeight: "bold", color: colors.logoAccent, marginBottom: 5}}>{item.category}</Text>
                        </View>
                    </View>

                    <DetailRow label={isLostItem ? "Location Lost" : "Location Found"} value={location} />
                    <DetailRow label={isLostItem ? "Date Lost" : "Date Found"} value={date} />
                    <DetailRow label="Description" value={item.description} />
                    <DetailRow label="Contact Email" value={item.contactEmail} />
                    <DetailRow label="Phone Number" value={item.contactPhoneNumber} />

                    <View style={[styles.alertsDropdown, {paddingBottom: 0}]}>
                        <Pressable style={[styles.alertsHeader, showAlertsDropdown && {marginBottom: 0}]} onPress={() => {setShowAlertsDropdown(!showAlertsDropdown); setFocusedField(null)}}>
                            <View style={{flexDirection: "row", alignItems: "center", gap: 15}}>
                                <Image
                                    source={require("../../assets/images/telegram.png")} 
                                    style={{width: 30, height: 30}}/>
                                <Text style={[styles.heading, {marginTop: 10}]}>Match Alerts</Text>
                            </View>
        
                            <Image 
                                source={require("../../assets/images/right-arrow.png")} 
                                style={{width: 30, height: 30, transform: [{rotate: showAlertsDropdown ? "-90deg" : "90deg"}]}}/>
                        </Pressable>

                        {showAlertsDropdown && (
                            <View style={styles.alertsBody}>
                                <Text style={[styles.contactLabel, {fontStyle: "italic", marginBottom: 10, color: colors.textSecondary}]}>Get notified when new reports match this item.</Text>
                                <Text style={styles.contactLabel}>1. Start our Telegram bot: <Text style={{color: colors.logoAccent, fontWeight: "bold", textDecorationLine: "underline"}} onPress={() => Linking.openURL("https://t.me/NUSFoundIt_Bot")}>@NUSFoundIt_Alerts</Text></Text>
                                <Text style={styles.contactLabel}>2. Get your Telegram Chat ID from <Text style={{color: colors.logoAccent, fontWeight: "bold", textDecorationLine: "underline"}} onPress={() => Linking.openURL("https://t.me/userinfobot")}>@userinfobot</Text>.</Text>
                                <Text style={[styles.contactLabel, {marginBottom: 15}]}>3. Enter your desired minimum match score.</Text>

                                <TextInput
                                    style={[globalStyles.input, focusedField === "telegramId" && {borderColor: colors.textPrimary}]}
                                    placeholder="Telegram Chat ID"
                                    placeholderTextColor={colors.placeholder}
                                    value={telegramId}
                                    onChangeText={setTelegramId}
                                    keyboardType="number-pad"
                                    onFocus={() => {setFocusedField("telegramId");}}
                                    onBlur={() => setFocusedField(null)}/>
                                
                                <TextInput
                                    style={[globalStyles.input, {marginBottom: 10}, focusedField === "threshold" && {borderColor: colors.textPrimary}]}
                                    placeholder="Minimum Match Score (e.g. 8)"
                                    placeholderTextColor={colors.placeholder}
                                    value={threshold}
                                    onChangeText={setThreshold}
                                    keyboardType="number-pad"
                                    maxLength={3}
                                    onFocus={() => {setFocusedField("threshold");}}
                                    onBlur={() => setFocusedField(null)}/>
                                
                                <View style={{flexDirection: "row", gap: 10, marginBottom: 15}}>
                                    <Pressable
                                        style={[globalStyles.buttonContainer, {flex: 1, backgroundColor: colors.textPrimary}]}
                                        onPress={saveAlertSettings}>
                                        <Text style={[styles.buttonText, isSavingAlert && {opacity: 0.4}]}>{isSavingAlert ? "Saving..." : "Enable"}</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[globalStyles.buttonContainer, {flex: 1, backgroundColor: colors.textPrimary}]}
                                        onPress={disableAlerts}>
                                        <Text style={[styles.buttonText, isSavingAlert && {opacity: 0.4}]}>{isSavingAlert ? "Saving..." : "Disable"}</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* render possible matches for lost/found items */}
                    <View style={{paddingHorizontal: 8}}>
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
            </KeyboardAvoidingView>
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
        alignSelf: "flex-start",
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
        marginTop: 10,
        width: "100%",
        alignItems: "center",
        position: "relative",
    },
    imageDetails: {
        width: "100%",
        borderRadius: 16,
        backgroundColor: colors.surfaceSoft,
    },
    placeholderBadge: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingVertical: 8,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        alignItems: "center",
    },
    placeholderBadgeText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    contactLabel: {
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 6,
        fontSize: 15,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
    alertsDropdown: {
        backgroundColor: colors.surfaceSoft,
        width: "100%",
        paddingHorizontal: 6,
    },
    alertsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    alertsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.logoMain,
    },
    alertsBody: {
        paddingTop: 0,
    },
})