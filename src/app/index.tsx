import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
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
  button: {
    backgroundColor: "#007AFF",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    width: "100%",
    marginBottom: 12,
  }
});

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NUSFoundIt</Text>
      <Text style={styles.subtitle}>A student-friendly lost-and-found app for the NUS community.</Text>
      <Link href="/submit-found-item" style={styles.button}>Submit Found Item</Link>
      <Link href="/listings" style={styles.button}>View Public Listings</Link>
    </View>
  )
}