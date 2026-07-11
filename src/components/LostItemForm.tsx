import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors, DateStyles, globalStyles, Suggestions } from "../styles/globalStyles";

//Importing of Firebase tools and firebaseConfig file.
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
//file directly sourced from NUSMods public Github Repository. Refer to README for full reference.
import venuesData from "../constants/venues.json";

//navigation functions
export default function LostItemForm() {
    const router = useRouter();
    // state variables for the form fields
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [locationLost, setLocationLost] = useState("");
    const [filteredVenues, setFilteredVenues] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [dateLost, setDateLost] = useState<Date | null>(null); // initialise with null to force user to select a date, preventing possible user error.
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
            setDateLost(selectedDate);
        }
    };

    const handleLocationSelect = (text: string) => {
        setLocationLost(text);

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
        setLocationLost(venue);
        setFilteredVenues([]);
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    // function to handle form submission
    const handleSubmit = async () => {
        //validation for non-empty fields
        if (!itemName || !category || !description || !dateLost || !email || !phoneNumber) {
            Alert.alert("Error\n", "Please fill in all required fields.");
            return;
        }

        // send data to Firestore
        try {
            await addDoc(collection(db, "lostItems"), {
                itemName,
                category,
                description,
                locationLost,
                dateLost: formatDateLabel(dateLost), // convert date to string format
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
            setLocationLost("");
            setDateLost(null);
            setEmail("");
            setPhoneNumber("");
            setImageUrl("");

            // navigate to listings page in case user wants to view their report immediately after submission
            // router.push("/listings");
        
        // general error handling for issues during submission process.
        } catch (error) {
            console.error("Error adding document: ", error);
            Alert.alert("Error\n", "Something went wrong. Please try again.");
        }
    };

    return (
        <View style={globalStyles.formContainer}>
            <Text style={globalStyles.pageTitle}>Item Details</Text>
            <Text style={globalStyles.pageSubtitle}>Tell us what you lost so we can help you find it.</Text>
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
            // multiline input to allow for more detailed descriptions of lost items.
                style={[globalStyles.input, globalStyles.multilineInput]}
                placeholder="Description"
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={(text) => {
                    const lines = text.split('\n');
                    if (lines.length <= 3) {
                        setDescription(text);
                    }
                }}
                multiline
                numberOfLines={3}
                onFocus={() => setShowSuggestions(false)}
            />
            <View style={Suggestions.searchContainer}>
                {showSuggestions && filteredVenues.length > 0 && (
                    <View style={[
                        Suggestions.dropdownPopover,
                        {
                            backgroundColor: colors.background,
                            position: 'absolute',
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
                    style={globalStyles.input}
                    placeholder="Location Lost (e.g. LT17, The Deck)"
                    placeholderTextColor={colors.placeholder}
                    value={locationLost}

                    onChangeText={handleLocationSelect}
                    onFocus={() => { if(locationLost) setShowSuggestions(true); }}
                    onSubmitEditing={() => setShowSuggestions(false)}
                    returnKeyType="done"
                />
            </View>

            <Pressable
            style={DateStyles.datePickerBox}
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
                    {color: dateLost ? colors.textInput : colors.placeholder} 
                ]}>
                    {/* Made sure to implement placeholder similar to other input fields. */}
                    {dateLost ? `Date Lost: ${formatDateLabel(dateLost)}` : "Date Lost (select date)"}
                </Text>

                {/* implement the raw HTML date input if the platform is web. 
                Date Picker does not work on web, so maintained <Text> tag to easily transfer styles over, 
                with raw HTML date input remaining invisible by intentionally setting opacity to 0 */}
                {Platform.OS === "web" && (
                    <input
                        type="date"
                        onChange={(e) => {
                            const val = e.target.value;
                            setDateLost(val ? new Date(val) : null);
                        }}
                        max = {new Date().toISOString().split("T")[0]}
                        style={{
                            position: "absolute",
                            opacity: 0, // makes HTML raw field invisible
                            top: 0, // extends the field to cover the entire visible Pressable container, so users can click anywhere to use. 
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                            height: '100%',
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
                    value={dateLost || new Date()}
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
                keyboardType="email-address"
                onFocus={() => setShowSuggestions(false)}
            />
            <TextInput
                style={globalStyles.input}
                placeholder="Contact Phone Number"
                placeholderTextColor={colors.placeholder}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
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
        </View>
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