import { Link } from "expo-router";
import { Text, View, Pressable, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, globalStyles, spacing } from "../../styles/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomeScreen() {
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome to NUSFoundIt!
          </Text>
          <Text style={styles.headerSubtitle}>Stop searching. Start finding.</Text>
        </View>

        {/* logo and app name */}
        <View style={styles.logoContainer}>
          <Image source={require("../../../assets/images/NUSFoundIt logo 1 no text no bg.png")} style={globalStyles.logo} contentFit="contain"/>
          <Text style={globalStyles.title}>
            <Text style={{ color: colors.logoMain }}>NUS</Text>
            <Text style={{ color: colors.logoSecondary }}>Found</Text>
            <Text style={{ color: colors.logoAccent }}>It</Text>
          </Text>
          <Text style={globalStyles.subtitle}>A student-friendly lost-and-found app for the NUS community.</Text>
        </View>

        {/* actions container */}
        <View style={styles.actionsContainer}>
          <Link href="/report" asChild>
            <Pressable style={StyleSheet.flatten([styles.actionCard, styles.reportCard])}>
              <View style={styles.actionIconBox}>
                <Image
                  source={require("../../../assets/images/add-circle-outline.png")}
                  style={styles.actionIcon}
                  tintColor={colors.logoSecondary}
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Report an Item</Text>
                <Text style={styles.actionSubtitle}>Submit a lost or found item report.</Text>
              </View>

              <Image
                source={require("../../../assets/images/right-arrow.png")}
                style={styles.arrowIcon}
                tintColor="#ffffff"
              />
            </Pressable>
          </Link>
        </View>

        {/* navigation links to main pages */}
        <Link href="/report" style={globalStyles.primaryButton}>Report an Item</Link>
        <Link href="/listings" style={globalStyles.primaryButton}>View Item Listings</Link>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.logoMain,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  logoContainer: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 28,
    paddingVertical: 34,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1e2c8",
    marginBottom: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  actionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    minHeight: 92,
    borderRadius: 22,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  reportCard: {
    backgroundColor: colors.logoMain,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    width: 30,
    height: 30,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 4
  },
  actionSubtitle: {
    color: "#ffffff",
    opacity: 0.85,
    fontSize: 13,
    lineHeight: 18,
  },
  arrowIcon: {
    width: 22,
    height: 22,
  },
})