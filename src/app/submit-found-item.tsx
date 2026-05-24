import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
});

export default function SubmitFoundItemScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Submit Found Item</Text>
            <Text style={styles.subtitle}>This screen will contain report submission form for the found item.</Text>
        </View>
    )
}