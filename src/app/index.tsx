import { Link } from "expo-router";
import { Image, Text, View } from "react-native";
import { colors, globalStyles } from "../styles/globalStyles";


export default function HomeScreen() {
  return (
    <View style={globalStyles.centeredScreen}>
      <Image source={require("../../assets/images/NUSFoundIt logo 1 no text no bg.png")} style={globalStyles.logo} />
      <Text style={globalStyles.title}>
        <Text style={{ color: colors.logoMain }}>NUS</Text>
        <Text style={{ color: colors.logoSecondary }}>Found</Text>
        <Text style={{ color: colors.logoAccent }}>It</Text>
      </Text>
      <Text style={globalStyles.subtitle}>A student-friendly lost-and-found app for the NUS community.</Text>
      <Link href="/submit-found-item" style={globalStyles.primaryButton}>Submit Found Item</Link>
      <Link href="/submit-lost-item" style={globalStyles.primaryButton}>Submit Lost Item</Link>
      <Link href="/listings" style={globalStyles.primaryButton}>View Public Listings</Link>
    </View>
  )
}