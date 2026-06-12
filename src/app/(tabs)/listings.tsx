import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import FoundItemsList from "../../components/FoundItemsList";
import LostItemsList from "../../components/LostItemsList";
import { colors, globalStyles, spacing } from "../../styles/globalStyles";

export default function ListingsScreen() {
    // state variable to track which tab is currently selected (found or lost)
    const [selectedTab, setSelectedTab] = useState<"found" | "lost">("found");
    const [resetKey, setResetKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    useFocusEffect(
        useCallback(() => {
            return () => {
                setResetKey(prev => prev + 1);
                setSelectedTab("found");
                setSearchQuery("");
            };
        }, [])
    );
    return (
        <View style={ styles.container }>
            <View style={ styles.content }>
                {/* tab buttons to switch between found and lost item forms */}
                <View style={styles.tabContainer}>
                    {/* tab button for found item form */}
                    <Pressable
                        style={[styles.tabButton, selectedTab === "found" && styles.activeTabButton]}
                        onPress={() => {
                            setSelectedTab("found");
                            setSearchQuery("");
                        }}
                    >
                        <Text style={[styles.tabText, selectedTab === "found" && styles.activeTabText]}>Found Items</Text>
                    </Pressable>
                    {/* tab button for lost item form */}
                    <Pressable
                        style={[styles.tabButton, selectedTab === "lost" && styles.activeTabButton]}
                        onPress={() => {
                            setSelectedTab("lost");
                            setSearchQuery("");
                        }}
                    >
                        <Text style={[styles.tabText, selectedTab === "lost" && styles.activeTabText]}>Lost Items</Text>
                    </Pressable>
                </View>

                {/* page subtitle */}
                <Text style={globalStyles.pageSubtitle}>Browse recently reported items.</Text>

                <View style={styles.searchBarContainer}>
                    <TextInput
                        style={globalStyles.input}
                        placeholder={selectedTab === "found" ? "Search found items..." : "Search lost items..."}
                        placeholderTextColor={colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        returnKeyType="search"
                    />
                </View>
                
                {/* render the appropriate form based on which tab is selected */}
                {selectedTab === "found" ? (
                    <FoundItemsList key={`listings-found-${resetKey}`} searchQuery={searchQuery} />
                ) : (
                    <LostItemsList key={`listings-lost-${resetKey}`} searchQuery={searchQuery} />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        paddingBottom: 0,
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
    searchBarContainer: {
        width: "100%",
        marginBottom: spacing.xs,
    },
})