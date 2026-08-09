import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Button, Image, Keyboard, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors, DateStyles, globalStyles, ImageStyles, Suggestions } from "../styles/globalStyles";

import { createFoundItem } from "@/services/itemsService";
import { getDownloadURL, ref, uploadBytes, uploadString } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
//taken directly from NUSMods public Github Repository (see README)
import venuesData from "../constants/venues.json";

export default function FoundItemForm() {
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [locationFound, setLocationFound] = useState("");
    const [filteredVenues, setFilteredVenues] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    // so users don't accidentally submit today's date
    const [dateFound, setDateFound] = useState<Date | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // helps to control hidden dropdown
    const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
    const [telegramId, setTelegramId] = useState("");
    const [threshold, setThreshold] = useState("");

    const categoryData = [
        { label: "ID Card / Matric Card", value: "ID card" },
        { label: "Wallet / Purse", value: "wallet" },
        { label: "Water Bottle", value: "bottle" },
        { label: "Phone", value: "phone" },
        { label: "Laptop", value: "laptop" },
        { label: "Keys", value: "keys" },
        { label: "Electronics", value: "electronics" },
        { label: "Clothing / Accessories", value: "clothing" },
        { label: "Other", value: "other" },
    ];

    const formatDateLabel = (date: Date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const pickDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        // android closes straightaway, but ios stays open
        if (Platform.OS === "android") {
            setShowCalendar(false);
        }

        if (selectedDate) {
            setDateFound(selectedDate);
        }
        setFocusedField(null);
    };

    const handleLocationSelect = (text: string) => {
        setLocationFound(text);
        if (text.trim().length > 0) {
            const query = text.toUpperCase();

            const venueKeys = Object.keys(venuesData);

            const matches = venueKeys.filter((venue: string) =>
                venue.toUpperCase().includes(query)
            );

            setFilteredVenues(matches.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setFilteredVenues([]);
            setShowSuggestions(false);
        }
    };

    const selectVenue = (venue: string) => {
        setLocationFound(venue);
        setFilteredVenues([]);
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            // important for saving bandwidth and avoiding costs
            quality: 0.3,
            base64: Platform.OS === "web",
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            if (Platform.OS === "web") {
            setImageBase64(result.assets[0].base64 || null);
            }
        }
    };

    const handleSubmit = async () => {
        if (loading) {
            return;
        }
        // all below fields will be mandatory
        if (!itemName.trim() || !category || !description.trim() || !locationFound.trim() || !dateFound || !email.trim() || !phoneNumber) {
            // react native alert doesn't work for web, have to use original browser version
            if (Platform.OS === "web") {
                alert("Error\nPlease fill in all required fields.");
            } else {
                Alert.alert("Error\n", "Please fill in all required fields.");
            }
            return;
        }

        if (telegramId || threshold) {
            if (!telegramId) {
                const message = "Please enter your Telegram Chat ID to receive alerts.";
                if (Platform.OS === "web") {
                    alert("Error\n" + message);
                } else {
                    Alert.alert("Error\n", message);
                }
                return;
            }

            if (!threshold) {
                const message = "Please enter a Minimum Match Score for the alerts.";
                if (Platform.OS === "web") {
                    alert("Error\n" + message);
                } else {
                    Alert.alert("Error\n", message);
                }
                return;
            }
        }
        try {
            setLoading(true);
            let uploadLink = "";

            if (image) {
                try {
                    let extension = "jpg";
                    if (Platform.OS !== "web" && image.includes(".")) {
                        extension = image.split(".").pop() as string;
                    }
                    const imageName = "item_" + Date.now() + "." + extension;
                    const imageRef = ref(storage, "images/" + imageName)

                    if (Platform.OS === "web") {
                        const metadata = { contentType: "image/jpeg" };
                        await uploadString(imageRef, imageBase64 as string, "base64", metadata);
                    } else {
                        const transform = await fetch(image);
                        const blob = await transform.blob();
                        const metadata = {contentType: blob.type || 'image/jpeg'};
                        await uploadBytes(imageRef, blob, metadata);
                    }

                    uploadLink = await getDownloadURL(imageRef);
                } catch (error) {
                    console.error("Error uploading image: ", error);
                    const debugError = JSON.stringify(error) || "Unknown error";
                    const errorMessage = "Failed to upload the image to the server."
                    if (Platform.OS === "web") {
                        alert("Upload Error\n" + errorMessage);
                    } else {
                        Alert.alert("Upload Error", errorMessage);
                    }
                    setLoading(false);
                    return;
                }
            }

            // to improve data integrity and stop database cluttering
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            await createFoundItem(db, {
                itemName,
                category,
                description,
                locationFound,
                dateFound: formatDateLabel(dateFound),
                contactEmail: email,
                contactPhoneNumber: phoneNumber,
                imageUrl: uploadLink,
                expireAt: expirationDate,
                ...(telegramId && threshold
                    ? {
                        telegramAlerts: {
                            [telegramId]: parseInt(threshold, 10),
                        },
                    } : {}),
            });

            // send user the success alert
            if (Platform.OS === "web") {
                // had to use the native alert() for web deployment to work
                alert("Success\nYour report has been submitted successfully.");
            } else {
                Alert.alert("Success\n", "Your report has been submitted successfully.");
            }

            //clear for next report
            setItemName("");
            setCategory(null);
            setDescription("");
            setLocationFound("");
            setDateFound(null);
            setEmail("");
            setPhoneNumber("");
            setImage(null);
            setTelegramId("");
            setThreshold("");
            setShowAlertsDropdown(false);
            setImageBase64(null);

        } catch (error) {
            console.error("Error adding document: ", error);
            Alert.alert("Error\n", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={globalStyles.formContainer}>
            <Text style={[globalStyles.pageTitle, { color: colors.primary }]}>Item Details</Text>
            <Text style={[globalStyles.pageSubtitle, { color: colors.logoAccent }]}>Tell us what you found so the owner can find it.</Text>
            <TextInput
                style={[globalStyles.input, focusedField === "itemName" && { borderColor: colors.primary }]}
                placeholder="Item Name (Max 30 char.)"
                placeholderTextColor={colors.placeholder}
                value={itemName}
                onChangeText={setItemName}
                maxLength={30} // stops long names breaking UI
                onFocus={() => { setShowSuggestions(false); setFocusedField("itemName"); }}
                onBlur={() => setFocusedField(null)}/>
            <Dropdown
                style={[globalStyles.dropdown, focusedField === "category" && { borderColor: colors.primary }]}
                placeholderStyle={globalStyles.placeholderText}
                selectedTextStyle={[
                    globalStyles.inputText,
                    { color: category ? colors.textInput : colors.placeholder } // mimics text input to get same styling
                ]}
                containerStyle={{ backgroundColor: colors.logoCream }}
                activeColor={colors.logoAccent}
                itemTextStyle={globalStyles.inputText}
                data={categoryData}
                labelField="label"
                valueField="value"
                placeholder="Category (select)"
                value={category}
                onChange={item => {
                    setCategory(item.value);
                    setShowSuggestions(false);
                }}
                onFocus={() => setFocusedField("category")}
                onBlur={() => setFocusedField(null)}/>
            <TextInput
                style={[globalStyles.input, globalStyles.multilineInput, focusedField === "description" && { borderColor: colors.primary }]}
                placeholder="Description"
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={(text) => {
                    const lines = text.split("\n");
                    if (lines.length <= 3) {
                        setDescription(text);
                    }
                }}
                multiline
                numberOfLines={3}
                onFocus={() => { setShowSuggestions(false); setFocusedField("description"); }}
                onBlur={() => setFocusedField(null)}/>
            <View style={Suggestions.searchContainer}>
                {showSuggestions && filteredVenues.length > 0 && (
                    <View style={[
                        Suggestions.dropdownPopover,
                        {
                            backgroundColor: colors.background,
                            position: "absolute",
                            bottom: 70,
                            marginTop: 0,
                            marginBottom: 0,
                            zIndex: 20
                        }
                    ]}>
                        {filteredVenues.map((item) => (
                            <Pressable
                                key={item}
                                style={Suggestions.suggestionRow}
                                onPress={() => selectVenue(item)}
                            >
                                <Text style={Suggestions.suggestionText}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                <TextInput
                    style={[globalStyles.input, focusedField === "location" && { borderColor: colors.primary }]}
                    placeholder="Location Found (e.g. LT17, The Deck)"
                    placeholderTextColor={colors.placeholder}
                    value={locationFound}

                    onChangeText={handleLocationSelect}
                    onFocus={() => { if (locationFound) setShowSuggestions(true); setFocusedField("location"); }}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => setShowSuggestions(false)}
                    returnKeyType="done"/>
            </View>

            <Pressable
                style={[DateStyles.datePickerBox, focusedField === "date" && { borderColor: colors.primary }]}
                onPress={() => {
                    // to prevent crashing on web
                    if (Platform.OS !== "web") {
                        setShowCalendar(true);
                        setShowSuggestions(false);
                    }
                }}
            >
                <Text style={[
                    globalStyles.inputText,
                    { color: dateFound ? colors.textInput : colors.placeholder }
                ]}>
                    {/* maintains uniformity even though not text input */}
                    {dateFound ? `Date Found: ${formatDateLabel(dateFound)}` : "Date Found (select date)"}
                </Text>

                {/* react native date picker doesn't work on web, had to place invisible date field*/}
                {Platform.OS === "web" && (
                    <input
                        type="date"
                        onFocus={() => setFocusedField("date")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                            const val = e.target.value;
                            setDateFound(val ? new Date(val) : null);
                        }}
                        max={new Date().toISOString().split("T")[0]}
                        style={{
                            position: "absolute",
                            opacity: 0,
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: "100%",
                            height: "100%",
                            padding: 0,
                            margin: 0,
                        }}
                    />
                )}
            </Pressable>
            {/* will only show on native to prevent breaking web */}
            {showCalendar && Platform.OS !== "web" && (
                <DateTimePicker
                    value={dateFound || new Date()}
                    mode="date"
                    display="default"
                    onChange={pickDate}
                    maximumDate={new Date()}
                />
            )}

            {showCalendar && Platform.OS === "ios" && (
                <Button title="Confirm Date" onPress={() => setShowCalendar(false)} />
            )}
            <TextInput
                style={[globalStyles.input, focusedField === "email" && { borderColor: colors.primary }]}
                placeholder="Contact Email"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                onFocus={() => { setShowSuggestions(false); setFocusedField("email"); }}
                onBlur={() => setFocusedField(null)}/>
            <TextInput
                style={[globalStyles.input, focusedField === "phone" && { borderColor: colors.primary }]}
                placeholder="Contact Phone Number"
                placeholderTextColor={colors.placeholder}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                keyboardType="phone-pad"
                maxLength={8}
                onFocus={() => { setShowSuggestions(false); setFocusedField("phone"); }}
                onBlur={() => setFocusedField(null)}/>

            <View style={styles.alertsDropdown}>
                <Pressable style={styles.alertsHeader} onPress={() => setShowAlertsDropdown(!showAlertsDropdown)}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Image
                            source={require("../../assets/images/telegram.png")}
                            style={{ width: 25, height: 25 }}
                            tintColor={colors.logoMain} />
                        <Text style={styles.alertsTitle}>Match Alerts (Optional)</Text>
                    </View>

                    <Image
                        source={require("../../assets/images/right-arrow.png")}
                        style={{ width: 25, height: 25, transform: [{ rotate: showAlertsDropdown ? "-90deg" : "90deg" }] }}
                        tintColor={colors.logoMain} />
                </Pressable>
                {/* hiding improves visual appeal and declutters */}
                {showAlertsDropdown && (
                    <View style={styles.alertsBody}>
                        <Text style={[styles.contactLabel, { fontStyle: "italic", marginBottom: 10 }]}>Get notified when new reports match this item.</Text>
                        <Text style={styles.contactLabel}>1. Start our Telegram bot: <Text style={{ color: colors.logoAccent, fontWeight: "bold", textDecorationLine: "underline" }} onPress={() => Linking.openURL("https://t.me/NUSFoundIt_Bot")}>@NUSFoundIt_Alerts</Text></Text>
                        <Text style={styles.contactLabel}>2. Get your Telegram Chat ID from <Text style={{ color: colors.logoAccent, fontWeight: "bold", textDecorationLine: "underline" }} onPress={() => Linking.openURL("https://t.me/userinfobot")}>@userinfobot</Text>.</Text>
                        <Text style={[styles.contactLabel, { marginBottom: 15 }]}>3. Enter your desired minimum match score.</Text>

                        <TextInput
                            style={[globalStyles.input, focusedField === "telegramId" && { borderColor: colors.logoMain }]}
                            placeholder="Telegram Chat ID"
                            placeholderTextColor={colors.placeholder}
                            value={telegramId}
                            onChangeText={setTelegramId}
                            keyboardType="number-pad"
                            onFocus={() => { setShowSuggestions(false); setFocusedField("telegramId"); }}
                            onBlur={() => setFocusedField(null)} />

                        <TextInput
                            style={[globalStyles.input, focusedField === "threshold" && { borderColor: colors.logoMain }]}
                            placeholder="Minimum Match Score (e.g. 8)"
                            placeholderTextColor={colors.placeholder}
                            value={threshold}
                            onChangeText={setThreshold}
                            keyboardType="number-pad"
                            maxLength={3}
                            onFocus={() => { setShowSuggestions(false); setFocusedField("threshold"); }}
                            onBlur={() => setFocusedField(null)} />
                    </View>
                )}
            </View>

            {!image && (
                <Pressable style={globalStyles.input} onPress={pickImage}>
                    <Text style={[globalStyles.inputText, { color: image ? colors.textInput : colors.placeholder }]}>
                        {image ? "Change Image..." : "Upload Image (optional)"}
                    </Text>
                </Pressable>
            )}
            {image && (
                <View style={ImageStyles.imageBox}>
                    <Image source={{ uri: image }} style={ImageStyles.image} />
                    <Pressable
                        style={ImageStyles.deleteImage}
                        onPress={() => setImage(null)}
                    >
                        <Text style={ImageStyles.deleteImageText}>Remove</Text>
                    </Pressable>
                </View>
            )}

            <Pressable style={[globalStyles.buttonContainer, loading && { opacity: 0.5 }]} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Sending..." : "Submit"}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
    alertsDropdown: {
        backgroundColor: colors.surfaceSoft,
        width: "100%",
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
    contactLabel: {
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 5,
    }
});