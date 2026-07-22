import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Button, Image, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors, DateStyles, globalStyles, ImageStyles, Suggestions } from "../styles/globalStyles";

import { useRouter } from "expo-router";

//Importing of Firebase tools and firebaseConfig file.
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
//file directly sourced from NUSMods public Github Repository. Refer to README for full reference.
import venuesData from "../constants/venues.json";
//navigation functions
export default function FoundItemForm() {
    const router = useRouter();
    // state variables for the form fields
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [locationFound, setLocationFound] = useState("");
    const [filteredVenues, setFilteredVenues] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [dateFound, setDateFound] = useState<Date | null>(null); // initialise with null to force user to select a date, preventing possible user error.
    const [showCalendar, setShowCalendar] = useState(false); // control of calendar popup visibility
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [image, setImage] = useState<string | null>(null); //Optional field, might not implement yet.
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

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

    // helper function to format date into dd/mm/yyyy format in input field. 
    const formatDateLabel = (date: Date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // helper function for date selection. 
    const pickDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
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
            quality: 0.3,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // function to handle form submission
    const handleSubmit = async () => {
        if (loading) {
            return;
        }
        //validation for non-empty fields
        if (!itemName || !category || !description || !locationFound || !dateFound || !email || !phoneNumber) {
            // Alert does not on web interface, had to use native alert() for deployment to work. 
            if (Platform.OS === "web") {
                alert("Error\nPlease fill in all required fields.");
            } else {
                Alert.alert("Error\n", "Please fill in all required fields.");
            }
            return;
        }

        // send data to Firestore
        try {
            setLoading(true);
            let uploadLink = "";

            if (image) {
                try {
                    const transform = await fetch(image);
                    const blob = await transform.blob();
                    const imageName = "item_" + Date.now() + "." + image.split(".").pop();
                    const imageRef = ref(storage, "images/" + imageName)

                    await uploadBytes(imageRef, blob)
                    uploadLink = await getDownloadURL(imageRef);
                } catch (imageError) {
                    Alert.alert("Upload Error", "Failed to upload the image to the server.");
                    setLoading(false);
                    return;
                }
            }

            await addDoc(collection(db, "foundItems"), {
                itemName,
                category,
                description,
                locationFound,
                dateFound: formatDateLabel(dateFound), // convert date to string format
                contactEmail: email,
                contactPhoneNumber: phoneNumber,
                imageUrl: uploadLink,
                createdAt: serverTimestamp(),
            });

            // send user the success alert
            if (Platform.OS === "web") {
                // Alert does not work on web interface, had to use the native alert() to implement deployment
                alert("Success\nYour report has been submitted successfully.");
            } else {
                Alert.alert("Success\n", "Your report has been submitted successfully.");
            }

            // reset form fields
            setItemName("");
            setCategory(null);
            setDescription("");
            setLocationFound("");
            setDateFound(null);
            setEmail("");
            setPhoneNumber("");
            setImage(null);
        
        // general error handling for issues during submission process.
        } catch (error) {
            console.error("Error adding document: ", error);
            Alert.alert("Error\n", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={globalStyles.formContainer}>
            <Text style={[globalStyles.pageTitle, {color: colors.primary}]}>Item Details</Text>
            <Text style={[globalStyles.pageSubtitle, {color: colors.logoAccent}]}>Tell us what you found so the owner can find it.</Text>
            <TextInput
                style={[globalStyles.input, focusedField === "itemName" && {borderColor: colors.primary}]}
                placeholder="Item Name (Max 30 char.)"
                placeholderTextColor={colors.placeholder}
                value={itemName}
                onChangeText={setItemName}
                maxLength={30} // limit item name to 30 characters to prevent excessively long entries.
                onFocus={() => {setShowSuggestions(false); setFocusedField("itemName");}}
                onBlur={() => setFocusedField(null)}
            />
            <Dropdown
                style={[globalStyles.dropdown, focusedField === "category" && {borderColor: colors.primary}]}
                placeholderStyle={globalStyles.placeholderText}
                selectedTextStyle={[
                    globalStyles.inputText,
                    { color: category ? colors.textInput : colors.placeholder} // implement placeholder similar to other input fields.
                ]}
                containerStyle={{backgroundColor: colors.logoCream}}
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
                onBlur={() => setFocusedField(null)}
            />
            <TextInput
            // multiline input to allow for more detailed descriptions of found items.
                style={[globalStyles.input, globalStyles.multilineInput, focusedField === "description" && {borderColor: colors.primary}]}
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
                onFocus={() => {setShowSuggestions(false); setFocusedField("description");}}
                onBlur={() => setFocusedField(null)}
            />
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
                    style={[globalStyles.input, focusedField === "location" && {borderColor: colors.primary}]}
                    placeholder="Location Found (e.g. LT17, The Deck)"
                    placeholderTextColor={colors.placeholder}
                    value={locationFound}

                    onChangeText={handleLocationSelect}
                    onFocus={() => { if(locationFound) setShowSuggestions(true); setFocusedField("location");}}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => setShowSuggestions(false)}
                    returnKeyType="done"
                />
            </View>

            <Pressable
                style={[DateStyles.datePickerBox, focusedField === "date" && {borderColor: colors.primary}]}
                onPress={() => {
                    // separate condition handling for mobile to ensure its continuity. 
                    if (Platform.OS !== "web") {
                        setShowCalendar(true);
                        setShowSuggestions(false);
                    }
                }}
            >
                <Text style={[
                    globalStyles.inputText,
                    {color: dateFound ? colors.textInput : colors.placeholder}
                ]}>
                    {/* Made sure to implement placeholder similar to other input fields. */}
                    {dateFound ? `Date Found: ${formatDateLabel(dateFound)}` : "Date Found (select date)"}
                </Text>

                {/* implement the raw HTML date input if the platform is web. 
                Date Picker does not work on web, so maintained <Text> tag to easily transfer styles over, 
                with raw HTML date input remaining invisible by intentionally setting opacity to 0 */}
                {Platform.OS === "web" && (
                    <input
                        type="date"
                        onFocus={() => setFocusedField("date")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                            const val = e.target.value;
                            setDateFound(val ? new Date(val) : null);
                        }}
                        max = {new Date().toISOString().split("T")[0]}
                        style={{
                            position: "absolute",
                            opacity: 0, // makes HTML raw field invisible
                            top: 0, // extends the field to cover the entire visible Pressable container, so users can click anywhere to use. 
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
            {/* differentiate web to ensure popup only appears on mobile */}
            {showCalendar && Platform.OS !== "web" && (
                <DateTimePicker
                    // default to current date as placeholder.
                    value={dateFound || new Date()}
                    mode="date"
                    display="default"
                    onChange={pickDate}
                    maximumDate={new Date()} // prevent selection of future dates
                />
            )}

            {showCalendar && Platform.OS === "ios" && (
                <Button title="Confirm Date" onPress={() => setShowCalendar(false)} />
            )}
            <TextInput
                style={[globalStyles.input, focusedField === "email" && {borderColor: colors.primary}]}
                placeholder="Contact Email"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                onFocus={() => {setShowSuggestions(false); setFocusedField("email");}}
                onBlur={() => setFocusedField(null)}
            />
            <TextInput
                style={[globalStyles.input, focusedField === "phone" && {borderColor: colors.primary}]}
                placeholder="Contact Phone Number"
                placeholderTextColor={colors.placeholder}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                keyboardType="phone-pad"
                maxLength={8}
                onFocus={() => {setShowSuggestions(false); setFocusedField("phone");}}
                onBlur={() => setFocusedField(null)}
            />
            {!image && (
                <Pressable style={globalStyles.input} onPress={pickImage}>
                    <Text style={[globalStyles.inputText, {color: image ? colors.textInput : colors.placeholder}]}>
                        {image ? "Change Image..." : "Upload Image (optional)"}
                    </Text>
                </Pressable>
                )}
            {image && (
                <View style={ImageStyles.imageBox}>
                    <Image source={{uri: image}} style={ImageStyles.image} />
                    <Pressable
                        style={ImageStyles.deleteImage}
                        onPress={() => setImage(null)}
                    >
                        <Text style={ImageStyles.deleteImageText}>Remove</Text>
                    </Pressable>
                </View>
            )}

            <Pressable style={[globalStyles.buttonContainer, loading && {opacity: 0.5}]} onPress={handleSubmit} disabled={loading}>
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
});