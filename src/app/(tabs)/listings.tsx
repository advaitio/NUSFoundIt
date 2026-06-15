import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import FoundItemsList from "../../components/FoundItemsList";
import LostItemsList from "../../components/LostItemsList";
import { colors, globalStyles, PopupStyles, spacing } from "../../styles/globalStyles";

export default function ListingsScreen() {
    // state variable to track which tab is currently selected (found or lost)
    const [selectedTab, setSelectedTab] = useState<"found" | "lost">("found");
    const [resetKey, setResetKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setResetKey(prev => prev + 1);
                setSelectedTab("found");
                setSearchQuery("");
                setFilterModalVisible(false);
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

                <View style={styles.searchRowContainer}>
                    <View style={styles.searchBarContainer}>
                        <TextInput
                            style={[globalStyles.input, { width: 'auto', flex: 1, marginBottom: 0 }]}
                            placeholder={selectedTab === "found" ? "Search found items..." : "Search lost items..."}
                            placeholderTextColor={colors.placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            clearButtonMode="while-editing"
                            returnKeyType="search"
                        />
                    </View>

                    <Pressable
                        style={PopupStyles.buttonContainer}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Text style={PopupStyles.buttonText}>Filter</Text>
                    </Pressable>
                </View>

                {/* render the appropriate form based on which tab is selected */}
                {selectedTab === "found" ? (
                    <FoundItemsList key={`listings-found-${resetKey}`} searchQuery={searchQuery} />
                ) : (
                    <LostItemsList key={`listings-lost-${resetKey}`} searchQuery={searchQuery} />
                )}
            </View>

            <Modal
                visible={filterModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={PopupStyles.modalBackdrop}>
                    <Modal
                        visible={filterModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setFilterModalVisible(false)}
                    >
                        <Pressable
                            style={PopupStyles.dismissLayer}
                            onPress={() => setFilterModalVisible(false)}
                        />
                        <View style={PopupStyles.modalContainer}>
                            <View style={PopupStyles.modalHeaderRow}>
                                <Text style={PopupStyles.modalTitle}>Filter Options</Text>
                                <Pressable onPress={() => setFilterModalVisible(false)}>
                                    <Text style={PopupStyles.modalCloseButton}>Close</Text>
                                </Pressable>
                            </View>

                            <View style={PopupStyles.modalPlaceholder}>
                                <Text style={PopupStyles.modalPlaceholderText}>
                                    Filter options will go here.
                                </Text>
                            </View>

                            <View style={PopupStyles.modalFooter}>
                                <Pressable 
                                    style={[PopupStyles.actionButton, PopupStyles.resetButton]}
                                    onPress={() => { /* test */ }}
                                >
                                    <Text style={PopupStyles.resetButtonText}>Reset All</Text>
                                </Pressable>
                                <Pressable 
                                    style={[PopupStyles.actionButton, PopupStyles.applyButton]}
                                    onPress={() => setFilterModalVisible(false)}
                                >
                                    <Text style={PopupStyles.applyButtonText}>Apply Filters</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </View>
            </Modal>
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
        flex: 1,
    },
    searchRowContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
})