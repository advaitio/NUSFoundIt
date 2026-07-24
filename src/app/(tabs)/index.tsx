import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, globalStyles, spacing } from "../../styles/globalStyles";


export default function HomeScreen() {
  const [activePopup, setActivePopup] = useState<"howItWorks" | "quickTips" | null>(null); //popup state

  return (
    <SafeAreaView edges={["top"]} style={globalStyles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>stop<Text style={{color:colors.logoSecondary}}> searching. </Text>start <Text style={{color:colors.logoAccent}}>finding. </Text></Text>
          <Text style={styles.headerSubtitle}>Report items, browse listings, and view possible matches all in one place.</Text>
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
            <Pressable style={StyleSheet.flatten([styles.actionCard, styles.reportCard1])}>
              <View style={styles.actionIconBox}>
                <Image
                  source={require("../../../assets/images/add-outline.png")}
                  style={styles.actionIcon}
                  tintColor={colors.logoSecondary}
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Report an Item</Text>
              </View>

              <Image
                source={require("../../../assets/images/right-arrow.png")}
                style={styles.arrowIcon}
                tintColor="#ffffff"
              />
            </Pressable>
          </Link>

          <Link href="/listings" asChild>
            <Pressable style={StyleSheet.flatten([styles.actionCard, styles.reportCard2])}>
              <View style={styles.actionIconBox}>
                <Image
                  source={require("../../../assets/images/list-outline.png")}
                  style={styles.actionIcon}
                  tintColor={colors.logoSecondary}
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Browse Listings</Text>
              </View>

              <Image
                source={require("../../../assets/images/right-arrow.png")}
                style={styles.arrowIcon}
                tintColor="#ffffff"
              />
            </Pressable>
          </Link>
        </View>

        {/* info cards */}
        <View style={styles.infoCardsContainer}>
          <Pressable style={styles.infoCard} onPress={() => setActivePopup("howItWorks")}>
            <View style={styles.infoIconCircleBlue}>
              <Image
                  source={require("../../../assets/images/help-outline.png")}
                  style={styles.infoIcon}
                  tintColor={colors.logoMain}
                />
            </View>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>Report or browse items posted by the NUS community.</Text>
            <Text style={styles.infoLink}>Learn more</Text>
          </Pressable>

          <Pressable style={styles.infoCard} onPress={() => setActivePopup("quickTips")}>
            <View style={styles.infoIconCircleOrange}>
              <Image
                  source={require("../../../assets/images/bulb-outline.png")}
                  style={styles.infoIcon}
                  tintColor={colors.logoAccent}
                />
            </View>
            <Text style={[styles.infoTitle, {color: colors.logoAccent}]}>Quick tips</Text>
            <Text style={[styles.infoText, {color: colors.logoAccent}]}>Add clear photos and details to improve matching chances.</Text>
            <Text style={styles.infoLink}>Learn more</Text>
          </Pressable>
        </View>
        
      </ScrollView>

      <Modal
        visible={activePopup !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePopup(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {activePopup === "howItWorks" && (
              <>
                <Text style={styles.modalTitle}>How NUSFoundIt works</Text>
                <Text style={styles.modalBody}>1. Submit a lost or found item report with useful details such as item name, location, date, category, description, image, and contact information.</Text>
                <Text style={styles.modalBody}>2. Browse all the public listings from the NUS community and click on a listing card to view full item details.</Text>
                <Text style={styles.modalBody}>3. Use the search and filter options to narrow down relevant items.</Text>
                <Text style={styles.modalBody}>4. Check the generated possible matches and contact the listed person.</Text>
              </>
            )}
            {activePopup === "quickTips" && (
              <>
                <Text style={[styles.modalTitle, {color: colors.logoAccent}]}>Quick reporting tips</Text>
                <Text style={[styles.modalBody, {color: colors.logoAccent}]}>- Add a clear photo where possible.</Text>
                <Text style={[styles.modalBody, {color: colors.logoAccent}]}>{'- Use specific locations, such as "COM1 Level 2" instead of just "NUS".'}</Text>
                <Text style={[styles.modalBody, {color: colors.logoAccent}]}>- Include useful keywords like brand, color, size, and unique markings.</Text>
                <Text style={[styles.modalBody, {color: colors.logoAccent}]}>- Provide a reliable way to contact you (email & phone number).</Text>
              </>
            )}

            <Pressable style={[styles.modalButton, {backgroundColor: activePopup === "howItWorks" ? colors.logoMain : colors.logoAccent}]} onPress={() => setActivePopup(null)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
    fontSize: 24,
    fontWeight: "800",
    color: colors.logoMain,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.logoMain,
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
    minHeight: 50,
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
  reportCard1: {
    backgroundColor: colors.logoMain,
  },
  reportCard2: {
    backgroundColor: colors.logoSecondary,
  },
  actionIconBox: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    width: 35,
    height: 35,
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
  infoCardsContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  infoCard: {
    flex: 1,
    minHeight: 190,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#f1e2c8",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  infoIconCircleBlue: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#add8e6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  infoIconCircleOrange: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffd580",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  infoIcon: {
    width: 30,
    height: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.logoMain,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 13,
    color: colors.logoMain,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  infoLink: {
    marginTop: "auto",
    fontSize: 13,
    fontWeight: "800",
    color: colors.logoSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "#f1e2c8",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.logoMain,
    marginBottom: spacing.md,
  },
  modalBody: {
    fontSize: 16,
    color: colors.logoMain,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  modalButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.logoMain,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  }
})