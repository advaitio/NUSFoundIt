import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors, globalStyles, Layout } from "../styles/globalStyles";

//Importing of Firebase tools and firebaseConfig file.
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import venuesData from "../constants/venues.json";

//navigation functions
export default function SubmitFoundItemScreen() {
    // initialise the router for navigation
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
    const [imageUrl, setImageUrl] = useState(""); //Optional field, might not implement yet.

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

    // function to handle form submission
    const handleSubmit = async () => {
        //validation for non-empty fields
        if (!itemName || !category || !description || !locationFound || !dateFound || !email || !phoneNumber) {
            Alert.alert("Error\n", "Please fill in all required fields.");
            return;
        }

        // send data to Firestore
        try {
            await addDoc(collection(db, "foundItems"), {
                itemName,
                category,
                description,
                locationFound,
                dateFound: formatDateLabel(dateFound), // convert date to string format
                contactEmail: email,
                contactPhoneNumber: phoneNumber,
                imageUrl,  
                createdAt: serverTimestamp(),
            });

            // show success message
            Alert.alert("Success\n", "Your report has been submitted successfully.");

            // reset form fields
            setItemName("");
            setCategory(null);
            setDescription("");
            setLocationFound("");
            setDateFound(null);
            setEmail("");
            setPhoneNumber("");
            setImageUrl("");

            // navigate to listings page in case user wants to view their report immediately after submission
            router.push("/listings");
        
        // general error handling for issues during submission process.
        } catch (error) {
            console.error("Error adding document: ", error);
            Alert.alert("Error\n", "Something went wrong. Please try again.");
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} 
        >
            {/* form layout uses ScrollView instead of normal Viewto ensure accessibility when using keyboard. */}
            <ScrollView contentContainerStyle={globalStyles.formContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={globalStyles.pageTitle}>Item Details</Text>
                <Text style={globalStyles.pageSubtitle}>Tell us what you found so the owner can identify it.</Text>
                <TextInput
                    style={globalStyles.input}
                    placeholder="Item Name (Max 30 char.)"
                    placeholderTextColor={colors.placeholder}
                    value={itemName}
                    onChangeText={setItemName}
                    maxLength={30} // limit item name to 30 characters to prevent excessively long entries.
                    onFocus={() => setShowSuggestions(false)}
                />
                <Dropdown
                    style={globalStyles.dropdown}
                    placeholderStyle={globalStyles.placeholderText}
                    selectedTextStyle={[
                        globalStyles.inputText,
                        { color: category ? colors.textInput : colors.placeholder} // implement placeholder similar to other input fields.
                    ]}
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
                />
                <TextInput
                // multiline input to allow for more detailed descriptions of found items.
                    style={[globalStyles.input, globalStyles.multilineInput]}
                    placeholder="Description"
                    placeholderTextColor={colors.placeholder}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    onFocus={() => setShowSuggestions(false)}
                />
                <View style={Layout.searchContainer}>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="Location Found (e.g. LT17, COM1)"
                        placeholderTextColor={colors.placeholder}
                        value={locationFound}

                        onChangeText={handleLocationSelect}
                        onFocus={() => { if(locationFound) setShowSuggestions(true); }}
                        onSubmitEditing={() => setShowSuggestions(false)}
                        returnKeyType="done"
                    />

                    {showSuggestions && filteredVenues.length > 0 && (
                        <View style={[Layout.dropdownPopover, { backgroundColor: colors.background }]}>
                            {filteredVenues.map((item) => (
                                <Pressable
                                    key={item}
                                    style={styles.suggestionRow}
                                    onPress={() => selectVenue(item)}
                                >
                                    <Text style={styles.suggestionText}>{item}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                <Pressable
                    style={styles.datePickerBox}
                    onPress={() => {
                        setShowCalendar(true);
                        setShowSuggestions(false);
                    }}
                >
                    <Text style={[
                        globalStyles.inputText,
                        {color: dateFound ? colors.textInput : colors.placeholder} // implement placeholder similar to other input fields. 
                    ]}>
                        {dateFound ? `Date Found: ${formatDateLabel(dateFound)}` : "Date Found (select date)"}
                    </Text>
                </Pressable>
                {showCalendar && (
                    <DateTimePicker
                        // default to current date as placeholder.
                        value={dateFound || new Date()}
                        mode="date"
                        display="default"
                        onChange={pickDate}
                        maximumDate={new Date()} // prevent selection of future dates
                    />
                )}

                {showCalendar && Platform.OS === 'ios' && (
                    <Button title="Confirm Date" onPress={() => setShowCalendar(false)} />
                )}
                <TextInput
                    style={globalStyles.input}
                    placeholder="Contact Email"
                    placeholderTextColor={colors.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    multiline
                    keyboardType="email-address"
                    onFocus={() => setShowSuggestions(false)}
                />
                <TextInput
                    style={globalStyles.input}
                    placeholder="Contact Phone Number"
                    placeholderTextColor={colors.placeholder}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={8}
                    onFocus={() => setShowSuggestions(false)}
                />
                <TextInput
                    style={globalStyles.input}
                    placeholder="Image URL (optional)"
                    placeholderTextColor={colors.placeholder}
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    multiline
                    onFocus={() => setShowSuggestions(false)}
                />

                <Pressable style={styles.buttonContainer} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    datePickerBox: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        backgroundColor: "#f9f9f9",
        justifyContent: "center",
    },
    suggestionRow: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    suggestionText: {
        fontSize: 16,
        color: colors.textInput,
    },
    buttonContainer: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 16,
        width: "30%",
        marginTop: 10,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
});