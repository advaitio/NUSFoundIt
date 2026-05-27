import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

//Importing of Firebase tools and firebaseConfig file.
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

//navigation functions
export default function SubmitFoundItemScreen() {
    // initialise the router for navigation
    const router = useRouter();

    // state variables for the form fields
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState(null);
    const [description, setDescription] = useState("");
    const [locationFound, setLocationFound] = useState("");
    const [dateFound, setDateFound] = useState(null); // initialise with null to force user to select a date, preventing possible user error.
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
    const formatDateLabel = (date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // helper function for date selection. 
    const pickDate = (event, selectedDate) => {
        if (Platform.OS === "android") {
            setShowCalendar(false);
        }

        if (selectedDate) {
            setDateFound(selectedDate);
        }
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
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Submit Found Item</Text>
                <Text style={styles.subtitle}>Please fill in the details of the item you found.</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Item Name (Max 30 char.)"
                    placeholderTextColor="#999"
                    value={itemName}
                    onChangeText={setItemName}
                    maxLength={30} // limit item name to 30 characters to prevent excessively long entries.
                />
                <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={[
                        styles.selectedTextStyle,
                        { color: category ? "#333" : "#999"} // implement placeholder similar to other input fields.
                    ]}
                    itemTextStyle={styles.itemTextStyle}
                    data={categoryData}
                    labelField="label"
                    valueField="value"
                    placeholder="Category (select)"
                    value={category}
                    onChange={item => {
                        setCategory(item.value);
                    }}
                />
                <TextInput
                // multiline input to allow for more detailed descriptions of found items.
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
                <TextInput
                    style={styles.input}
                    placeholder="Location Found"
                    placeholderTextColor="#999"
                    value={locationFound}
                    onChangeText={setLocationFound}
                    multiline
                />

                <Pressable style={styles.datePickerBox} onPress={() => setShowCalendar(true)}>
                    <Text style={[
                        styles.datePickerText,
                        {color: dateFound ? "#333" : "#999"} // implement placeholder similar to other input fields. 
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
                    style={styles.input}
                    placeholder="Contact Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    multiline
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contact Phone Number"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Image URL (optional)"
                    placeholderTextColor="#999"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    multiline
                />

                <View style={styles.buttonContainer}>
                    <Button title="Submit" onPress={handleSubmit} color="#007BFF" />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flexGrow: 1,
        padding: 24,
        paddingBottom: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: "center",
        color: "#666",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
        color: "#333",
    },
    multilineInput: {
        height: 80,
        textAlignVertical: "top",
        color: "#333",
    },
    dropdown: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: "#f9f9f9",
    },
    placeholderStyle: {
        fontSize: 16,
        color: "#999",
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
    datePickerText: {
        fontSize: 16,
        color: "#333",
    },
    buttonContainer: {
        width: "100%",
        marginTop: 8,
        borderRadius: 8,
        overflow: "hidden",
    },
});