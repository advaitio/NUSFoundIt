import { Link } from "expo-router";
import { Text, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";


export default function HomeScreen() {
  return (
    <View style={globalStyles.centeredScreen}>
      <Text style={globalStyles.title}>NUSFoundIt</Text>
      <Text style={globalStyles.subtitle}>A student-friendly lost-and-found app for the NUS community.</Text>
      <Link href="/submit-found-item" style={globalStyles.primaryButton}>Submit Found Item</Link>
      <Link href="/listings" style={globalStyles.primaryButton}>View Public Listings</Link>
    </View>
  )
}