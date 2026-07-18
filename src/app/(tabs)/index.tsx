import { Link } from "expo-router";
import { Text, View, Pressable, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, globalStyles, spacing } from "../../styles/globalStyles";


export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* logo and app name */}
      <Image source={require("../../../assets/images/NUSFoundIt logo 1 no text no bg.png")} style={globalStyles.logo} />
      <Text style={globalStyles.title}>
        <Text style={{ color: colors.logoMain }}>NUS</Text>
        <Text style={{ color: colors.logoSecondary }}>Found</Text>
        <Text style={{ color: colors.logoAccent }}>It</Text>
      </Text>
      <Text style={globalStyles.subtitle}>A student-friendly lost-and-found app for the NUS community.</Text>

      {/* navigation links to main pages */}
      <Link href="/report" style={globalStyles.primaryButton}>Report an Item</Link>
      <Link href="/listings" style={globalStyles.primaryButton}>View Item Listings</Link>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.logoCream,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
})