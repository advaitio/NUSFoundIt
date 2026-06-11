import { Pressable, View, ScrollView, StyleSheet, Text } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import FoundItemForm from "../../components/FoundItemForm";
import LostItemForm from "../../components/LostItemForm";
import { colors, spacing, globalStyles } from "../../styles/globalStyles";

export default function ReportScreen() {
    // state variable to track which tab is currently selected (found or lost)
    const [selectedTab, setSelectedTab] = useState<"found" | "lost">("found");

    return (
        <ScrollView
            style={ styles.container }
            contentContainerStyle={ styles.content }
            keyboardShouldPersistTaps="handled"
        >
            {/* page title and subtitle */}
            <Text style={globalStyles.pageTitle}>Report an Item</Text>
            <Text style={globalStyles.pageSubtitle}>Submit a report for an item you found or lost.</Text>

            {/* tab buttons to switch between found and lost item forms */}
            <View style={styles.tabContainer}>
                {/* tab button for found item form */}
                <Pressable
                    style={[styles.tabButton, selectedTab === "found" && styles.activeTabButton]}
                    onPress={() => setSelectedTab("found")}
                >
                    <Text style={[styles.tabText, selectedTab === "found" && styles.activeTabText]}>Found Item</Text>
                </Pressable>
                {/* tab button for lost item form */}
                <Pressable
                    style={[styles.tabButton, selectedTab === "lost" && styles.activeTabButton]}
                    onPress={() => setSelectedTab("lost")}
                >
                    <Text style={[styles.tabText, selectedTab === "lost" && styles.activeTabText]}>Lost Item</Text>
                </Pressable>
            </View>

            {/* render the appropriate form based on which tab is selected */}
            {selectedTab === "found" ? <FoundItemForm /> : <LostItemForm />}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.xl,
        paddingBottom: 80,
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.sm,
    },
    tabButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: colors.surface,
    },
    activeTabButton: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    activeTabText: {
        color: colors.background,
    },
})