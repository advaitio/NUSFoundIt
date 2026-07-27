import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FoundItemForm from "../../components/FoundItemForm";
import LostItemForm from "../../components/LostItemForm";
import { colors, globalStyles, spacing } from "../../styles/globalStyles";

export default function ReportScreen() {
    const [selectedTab, setSelectedTab] = useState<"found" | "lost">("found");
    // force clear fields if switching out
    const [resetKey, setResetKey] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    useFocusEffect(
        useCallback(() => {
            // moves back to top when switching out
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: false });
            }
            return () => {
                setResetKey((prevKey) => prevKey + 1);
                setSelectedTab("found");
            };
        }, [])
    );
    return (
        <SafeAreaView edges={["top"]} style={globalStyles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
                style={{ flex: 1, backgroundColor: colors.background }}
            >
                <View style={styles.customHeader}>
                    <Text style={[styles.customHeaderTitle, {color: selectedTab === "found" ? colors.logoMain : colors.logoSecondary}]}>Report</Text>
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    style={ [styles.container, { flex: 1 }] }
                    contentContainerStyle={ styles.content }
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.tabContainer}>
                        <Pressable
                            style={[styles.tabButton, selectedTab === "found" && styles.activeTabButton]}
                            onPress={() => setSelectedTab("found")}
                        >
                            <Text style={[styles.tabText, selectedTab === "found" && styles.activeTabText]}>Found Item</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tabButton, selectedTab === "lost" && {...styles.activeTabButton, backgroundColor: colors.logoSecondary}]}
                            onPress={() => setSelectedTab("lost")}
                        >
                            <Text style={[styles.tabText, selectedTab === "lost" && styles.activeTabText]}>Lost Item</Text>
                        </Pressable>
                    </View>

                    {/* changes form when switching tabs */}
                    {selectedTab === "found" ? (
                        <FoundItemForm key={`found-${resetKey}`} />
                    ) : (
                        <LostItemForm key={`lost-${resetKey}`} />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.xl,
        paddingTop: spacing.xs,
        paddingBottom: 10,
    },
    tabContainer: {
        marginTop: "auto",
        flexDirection: "row",
        marginBottom: spacing.sm,
        backgroundColor: colors.surfaceSoft,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#f1e2c8",
        padding: spacing.xs,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center"
    },
    activeTabButton: {
        backgroundColor: colors.logoMain,
        shadowColor: colors.logoMain,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.16,
        shadowRadius: 6,
        elevation: 2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    activeTabText: {
        color: colors.background,
    },
    customHeader: {
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    customHeaderTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: colors.logoMain,
    },
})