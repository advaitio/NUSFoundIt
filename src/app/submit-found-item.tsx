import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

//Importing of Firebase tools and firebaseConfig file.
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

//navigation functions
export default function SubmitFoundItemScreen() {
    // initialise the router for navigation
    const router = useRouter();

    // state variables for the form fields
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [locationFound, setLocationFound] = useState("");
    const [dateFound, setDateFound] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [imageUrl, setImageUrl] = useState(""); //Optional field, might not implement yet. 

    // function to handle form submission
    const handleSubmit = async () => {
        //validation for non-empty fields
        if (!itemName || !category || !description || !locationFound || !dateFound || !contactInfo) {
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
                dateFound,
                contactInfo,
                imageUrl,  
                createdAt: serverTimestamp(),
            });

            // show success message
            Alert.alert("Success\n", "Your report has been submitted successfully.");

            // reset form fields
            setItemName("");
            setCategory("");
            setDescription("");
            setLocationFound("");
            setDateFound("");
            setContactInfo("");
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
        // form layout uses ScrollView instead of normal Viewto ensure accessibility when using keyboard.
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Submit Found Item</Text>
            <Text style={styles.subtitle}>Please fill in the details of the item you found.</Text>
            <TextInput
                style={styles.input}
                placeholder="Item Name"
                value={itemName}
                onChangeText={setItemName}
            />
            <TextInput
                style={styles.input}
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
            />
            <TextInput
            // multiline input to allow for more detailed descriptions of found items.
                style={[styles.input, styles.multilineInput]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <TextInput
                style={styles.input}
                placeholder="Location Found"
                value={locationFound}
                onChangeText={setLocationFound}
            />
            <TextInput
                style={styles.input}
                placeholder="Date Found"
                value={dateFound}
                onChangeText={setDateFound}
            />
            <TextInput
                style={styles.input}
                placeholder="Contact Information"
                value={contactInfo}
                onChangeText={setContactInfo}
            />
            <TextInput
                style={styles.input}
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChangeText={setImageUrl}
            />

            <View style={styles.buttonContainer}>
                <Button title="Submit" onPress={handleSubmit} color="#007BFF" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
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
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    multilineInput: {
        height: 80,
        textAlignVertical: "top",
    },
    buttonContainer: {
        marginTop: 8,
        borderRadius: 8,
        overflow: "hidden",
    },
});