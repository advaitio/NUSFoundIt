import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Button, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import FoundItemsList from "../../components/FoundItemsList";
import LostItemsList from "../../components/LostItemsList";
import { colors, DateStyles, globalStyles, PopupStyles, spacing } from "../../styles/globalStyles";

export default function ListingsScreen() {
    // state variable to track which tab is currently selected (found or lost)
    const [selectedTab, setSelectedTab] = useState<"found" | "lost">("found");
    const [resetKey, setResetKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [tempCategory, setTempCategory] = useState<string | null>(null);
    const [activeLocation, setActiveLocation] = useState<string | null>(null);
    const [tempLocation, setTempLocation] = useState<string | null>(null);

    const [activeStartDate, setActiveStartDate] = useState<Date | null>(null);
    const [activeEndDate, setActiveEndDate] = useState<Date | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);

    const slideAnim = useRef(new Animated.Value(600)).current;

    const categoryData = [
        { label: "ID Card / Matric Card", value: "ID card" },
        { label: "Wallet / Purse", value: "wallet" },
        { label: "Water Bottle", value: "bottle" },
        { label: "Phone", value: "phone" },
        { label: "Laptop", value: "laptop" },
        { label: "Keys", value: "keys" },
        { label: "Electronics", value: "electronics" },
        { label: "Clothing / Accessories", value: "clothing" },
        { label: "Other", value: "other" },
    ];

    const locationData = [
        { label: "Computing", value: "Computing" },
        { label: "UTown", value: "UTown" },
        { label: "Central Library", value: "Central Library" },
        { label: "Engineering", value: "Engineering" },
        { label: "Science", value: "Science" },
        { label: "FASS", value: "FASS" },
        { label: "Music", value: "Music" },
        { label: "Medicine", value: "Medicine" },
        { label: "Business", value: "Business" },
        { label: "Law", value: "Law" },
        { label: "Residential Colleges", value: "Residential Colleges" },
        { label: "Others", value: "Others" },
    ];

    useEffect(() => {
        if (filterModalVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            slideAnim.setValue(600);
        }
    }, [filterModalVisible]);

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 600,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setFilterModalVisible(false);
            setShowStartCalendar(false);
            setShowEndCalendar(false);
        });
    };

    useFocusEffect(
        useCallback(() => {
            return () => {
                setResetKey(prev => prev + 1);
                setSelectedTab("found");
                setSearchQuery("");
                setFilterModalVisible(false);
                setActiveCategory(null);
                setActiveLocation(null);
                setActiveStartDate(null);
                setActiveEndDate(null);
                setTempCategory(null);
                setTempLocation(null);
                setTempStartDate(null);
                setTempEndDate(null);
            };
        }, [])
    );

    const pickStartDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowStartCalendar(false);
        }

        if (selectedDate) {
            setTempStartDate(selectedDate);
        }
    };

    const pickEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowEndCalendar(false);
        }

        if (selectedDate) {
            setTempEndDate(selectedDate);
        }
    };

    const formatDateLabel = (date: Date | null) => {
        if (!date) return "Select date";
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const handleApplyFilters = () => {
        Animated.timing(slideAnim, {
            toValue: 600,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setActiveCategory(tempCategory === "All" ? null : tempCategory);
            setActiveLocation(tempLocation === "All" ? null : tempLocation);
            setFilterModalVisible(false);
            setActiveStartDate(tempStartDate);
            setActiveEndDate(tempEndDate);
        });
    };

    const handleResetFilters = () => {
        Animated.timing(slideAnim, {
            toValue: 600,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setTempCategory(null);
            setActiveCategory(null);
            setTempLocation(null);
            setActiveLocation(null);
            setFilterModalVisible(false);
            setTempStartDate(null);
            setActiveStartDate(null);
            setTempEndDate(null);
            setActiveEndDate(null);
        });
    };
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
                            setActiveCategory(null);
                            setActiveLocation(null);
                            setActiveStartDate(null);
                            setActiveEndDate(null);
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
                            setActiveCategory(null);
                            setActiveLocation(null);
                            setActiveStartDate(null);
                            setActiveEndDate(null);
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
                        onPress={() => {
                            setTempCategory(activeCategory);
                            setTempLocation(activeLocation);
                            setFilterModalVisible(true);
                            setTempStartDate(activeStartDate);
                            setTempEndDate(activeEndDate);
                        }}
                    >
                        <Ionicons name="options-outline" size={24} color={colors.primary} />
                    </Pressable>
                </View>

                {/* render the appropriate form based on which tab is selected */}
                {selectedTab === "found" ? (
                    <FoundItemsList
                    key={`listings-found-${resetKey}`}
                    searchQuery={searchQuery}
                    categoryFilter={activeCategory}
                    locationFilter={activeLocation}
                    startDateFilter={activeStartDate}
                    endDateFilter={activeEndDate}
                />
                ) : (
                    <LostItemsList
                    key={`listings-lost-${resetKey}`}
                    searchQuery={searchQuery}
                    categoryFilter={activeCategory}
                    locationFilter={activeLocation}
                    startDateFilter={activeStartDate}
                    endDateFilter={activeEndDate}
                />
                )}
            </View>

            <Modal
                visible={filterModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={PopupStyles.modalBackdrop}>
                    <Pressable
                        style={PopupStyles.dismissLayer}
                        onPress={closeModal}
                    />
                    <Animated.View style={[
                            PopupStyles.modalContainer,
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <View style={PopupStyles.modalHeaderRow}>
                            <Text style={PopupStyles.modalTitle}>Filter Options</Text>
                            <Pressable onPress={closeModal}>
                                <Text style={PopupStyles.modalCloseButton}>Close</Text>
                            </Pressable>
                        </View>

                        <View style={PopupStyles.filterFormContainer}>
                            <Text style={PopupStyles.filterLabelText}>Item Category</Text>
                            <Dropdown
                                style={globalStyles.dropdown}
                                placeholderStyle={globalStyles.placeholderText}
                                selectedTextStyle={[
                                    globalStyles.inputText,
                                    { color: tempCategory ? colors.textInput : colors.placeholder }
                                ]}
                                itemTextStyle={globalStyles.inputText}
                                data={categoryData}
                                labelField="label"
                                valueField="value"
                                placeholder="All Categories"
                                value={tempCategory}
                                dropdownPosition="top"
                                inverted={false}
                                onChange={item => setTempCategory(item.value)}
                                containerStyle={PopupStyles.dropdownMenuPosition}
                            />
                        </View>

                        <View style={PopupStyles.filterFormContainer}>
                            <Text style={PopupStyles.filterLabelText}>Location</Text>
                            <Dropdown
                                style={globalStyles.dropdown}
                                placeholderStyle={globalStyles.placeholderText}
                                selectedTextStyle={[
                                    globalStyles.inputText,
                                    { color: tempLocation ? colors.textInput : colors.placeholder }
                                ]}
                                itemTextStyle={globalStyles.inputText}
                                data={locationData}
                                labelField="label"
                                valueField="value"
                                placeholder="All Locations"
                                value={tempLocation}
                                dropdownPosition="top"
                                inverted={false}
                                onChange={item => setTempLocation(item.value)}
                                containerStyle={PopupStyles.dropdownMenuPosition}
                            />
                        </View>

                        <View style={PopupStyles.filterFormContainer}>
                            <Text style={PopupStyles.filterLabelText}>Date Range</Text>
                            <View style={DateStyles.dateRangeRow}>
                                <Pressable
                                    style={DateStyles.dualDatePickerBox}
                                    onPress={() =>
                                        setShowStartCalendar(true)}>
                                    <Text style={DateStyles.datePickerLabel}>Start Date</Text>
                                    <Text style={[globalStyles.inputText, { color: tempStartDate ? colors.textInput : colors.placeholder, fontSize: 14 }]}>
                                        {formatDateLabel(tempStartDate)}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={DateStyles.dualDatePickerBox}
                                    onPress={() =>
                                        setShowEndCalendar(true)}>
                                    <Text style={DateStyles.datePickerLabel}>End Date</Text>
                                    <Text style={[globalStyles.inputText, { color: tempEndDate ? colors.textInput : colors.placeholder, fontSize: 14 }]}>
                                        {formatDateLabel(tempEndDate)}
                                    </Text>
                                </Pressable>
                            </View>

                            {showStartCalendar && (
                                <DateTimePicker
                                    // default to current date as placeholder.
                                    value={tempStartDate || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={pickStartDate}
                                    maximumDate={tempEndDate || new Date()} // prevent selection of future dates
                                />
                            )}

                            {showStartCalendar && Platform.OS === 'ios' && (
                                <Button title="Confirm Start Date" onPress={() => setShowStartCalendar(false)} />
                            )}

                            {showEndCalendar && (
                                <DateTimePicker
                                    value={tempEndDate || new Date()}
                                    mode="date"
                                    display="default"
                                    minimumDate={tempStartDate || undefined}
                                    maximumDate={new Date()}
                                    onChange={pickEndDate}
                                />
                            )}
                            {showEndCalendar && Platform.OS === 'ios' && (
                                <Button title="Confirm End Date" onPress={() => setShowEndCalendar(false)} />
                            )}
                        </View>

                        <View style={PopupStyles.modalFooter}>
                            <Pressable 
                                style={[PopupStyles.actionButton, PopupStyles.resetButton]}
                                onPress={handleResetFilters}
                            >
                                <Text style={PopupStyles.resetButtonText}>Reset All</Text>
                            </Pressable>
                            <Pressable 
                                style={[PopupStyles.actionButton, PopupStyles.applyButton]}
                                onPress={handleApplyFilters}
                            >
                                <Text style={PopupStyles.applyButtonText}>Apply Filters</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
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