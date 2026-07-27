import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Animated, Button, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import FoundItemsList from "../../components/FoundItemsList";
import LostItemsList from "../../components/LostItemsList";
import { colors, DateStyles, globalStyles, PopupStyles, spacing } from "../../styles/globalStyles";

export default function ListingsScreen() {
    // tracking if tab is on lost or found, for displaying info and styling. 
    const [selectedTab, setSelectedTab] = useState<"found" | "lost">("found");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    // for choosing filter options before its applied. 
    const [tempCategory, setTempCategory] = useState<string | null>(null);
    const [activeLocation, setActiveLocation] = useState<string | null>(null);
    const [tempLocation, setTempLocation] = useState<string | null>(null);

    const [activeStartDate, setActiveStartDate] = useState<Date | null>(null);
    const [activeEndDate, setActiveEndDate] = useState<Date | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    // keeps filter popup off the screen at the start
    const slideAnim = useRef(new Animated.Value(600)).current;

    // lights up borders of field being used
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // keeps same values as report form input fields
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

    //to group venues dataset with new category key
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
    }, [filterModalVisible, slideAnim]);

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

    const pickStartDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        // android closes picker automatically, unlike ios
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
            // actually applies the chosen filters to the active search
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
            // clear everything
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
        <SafeAreaView edges={["top"]} style={globalStyles.safeArea}>
            <View style={styles.container}>
                <View style={styles.customHeader}>
                    {/* switch button between theme colours */}
                    <Text style={[styles.customHeaderTitle, {color: selectedTab === "found" ? colors.logoMain : colors.logoSecondary}]}>Listings</Text>
                </View>
                <View style={styles.content}>
                    <View style={styles.tabContainer}>
                        <Pressable
                            style={[styles.tabButton, selectedTab === "found" && styles.activeTabButton]}
                            onPress={() => {
                                // resets everything when switching
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
                        <Pressable
                            style={[styles.tabButton, selectedTab === "lost" && {...styles.activeTabButton, backgroundColor: colors.logoSecondary}]}
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

                    <Text style={globalStyles.pageSubtitle}>Browse recently reported items.</Text>
                    {/* search and filter put on same row together */}
                    <View style={styles.searchRowContainer}>
                        <View style={styles.searchBarContainer}>
                            <TextInput
                                style={[globalStyles.input, {width: 'auto', flex: 1, marginBottom: 0}, focusedField === "search" && {borderColor: selectedTab === "found" ? colors.logoMain: colors.logoSecondary}]}
                                placeholder={selectedTab === "found" ? "Search found items..." : "Search lost items..."}
                                placeholderTextColor={colors.placeholder}
                                value={searchQuery}
                                onFocus={() => setFocusedField("search")}
                                onBlur={() => setFocusedField(null)}
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
                            <Image
                                source={filterModalVisible ? require("../../../assets/images/options.png") : require("../../../assets/images/options-outline.png")}
                                style={{ width: 24, height: 24 }}
                                tintColor="#ffffff"
                            />
                        </Pressable>
                    </View>

                    {/* swap lists based on tab */}
                    {selectedTab === "found" ? (
                        <FoundItemsList
                            searchQuery={searchQuery}
                            categoryFilter={activeCategory}
                            locationFilter={activeLocation}
                            startDateFilter={activeStartDate}
                            endDateFilter={activeEndDate}
                        />
                    ) : (
                        <LostItemsList
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
                    statusBarTranslucent={true}
                    navigationBarTranslucent={true}
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
                                    <Image
                                        source={require("../../../assets/images/close.png")} 
                                        style={{ width: 25, height: 25 }}
                                        tintColor={colors.logoAccent}/>
                                </Pressable>
                            </View>

                            <View style={PopupStyles.filterFormContainer}>
                                <Text style={PopupStyles.filterLabelText}>Item Category</Text>
                                <Dropdown
                                    style={[globalStyles.dropdown, focusedField === "category" && {borderColor: colors.logoAccent}]}
                                    placeholderStyle={globalStyles.placeholderText}
                                    selectedTextStyle={[
                                        globalStyles.inputText,
                                        { color: tempCategory ? colors.textInput : colors.placeholder }
                                    ]}
                                    itemTextStyle={globalStyles.inputText}
                                    data={categoryData}
                                    labelField="label"
                                    valueField="value"
                                    activeColor={colors.logoAccent}
                                    placeholder="All Categories"
                                    value={tempCategory}
                                    dropdownPosition="top"
                                    inverted={false}
                                    onChange={item => setTempCategory(item.value)}
                                    onFocus={() => setFocusedField("category")}
                                    onBlur={() => setFocusedField(null)}
                                    containerStyle={PopupStyles.dropdownMenuPosition}
                                />
                            </View>

                            <View style={PopupStyles.filterFormContainer}>
                                <Text style={PopupStyles.filterLabelText}>Location</Text>
                                <Dropdown
                                    style={[globalStyles.dropdown, focusedField === "location" && {borderColor: colors.logoAccent}]}
                                    placeholderStyle={globalStyles.placeholderText}
                                    selectedTextStyle={[
                                        globalStyles.inputText,
                                        { color: tempLocation ? colors.textInput : colors.placeholder }
                                    ]}
                                    itemTextStyle={globalStyles.inputText}
                                    data={locationData}
                                    labelField="label"
                                    valueField="value"
                                    activeColor={colors.logoAccent}
                                    placeholder="All Locations"
                                    value={tempLocation}
                                    // put dropdown on top
                                    dropdownPosition="top"
                                    inverted={false}
                                    onFocus={() => setFocusedField("location")}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={item => setTempLocation(item.value)}
                                    containerStyle={PopupStyles.dropdownMenuPosition}
                                />
                            </View>

                            <View style={PopupStyles.filterFormContainer}>
                                <Text style={PopupStyles.filterLabelText}>Date Range</Text>
                                <View style={DateStyles.dateRangeRow}>
                                    <Pressable style={DateStyles.dualDatePickerBox} onPress={() => {
                                            if (Platform.OS !== "web") {
                                                setShowStartCalendar(true);
                                            }
                                        }}>
                                        <Text style={DateStyles.datePickerLabel}>Start Date</Text>
                                        <Text style={[globalStyles.inputText, { color: tempStartDate ? colors.textInput : colors.placeholder, fontSize: 14 }]}>
                                            {formatDateLabel(tempStartDate)}
                                        </Text>
                                        {/* web doesn't support native datepicker so had to use invisible html date input to handle clicks */}
                                        {Platform.OS === "web" && (
                                            <input
                                                type="date"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setTempStartDate(val ? new Date(val) : null);
                                                }}
                                                max={new Date().toISOString().split("T")[0]}
                                                style={{
                                                    position: "absolute",
                                                    // make field transparent to hide it
                                                    opacity: 0,
                                                    top: 0, 
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    //stretch over full container to catch all clicks
                                                    width: '100%',
                                                    height: '100%',
                                                    padding: 0,
                                                    margin: 0,
                                                }}/>
                                        )}
                                    </Pressable>

                                    <Pressable style={DateStyles.dualDatePickerBox} onPress={() => {
                                            if (Platform.OS !== "web") {
                                                setShowEndCalendar(true);
                                            }
                                        }}>
                                        <Text style={DateStyles.datePickerLabel}>End Date</Text>
                                        <Text style={[globalStyles.inputText, { color: tempEndDate ? colors.textInput : colors.placeholder, fontSize: 14 }]}>
                                            {formatDateLabel(tempEndDate)}
                                        </Text>
                                        {/* same invisible field like start date */}
                                        {Platform.OS === "web" && (
                                            <input
                                                type="date"
                                                value={tempEndDate ? tempEndDate.toISOString().split('T')[0] : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setTempEndDate(val ? new Date(val) : null);
                                                }}
                                                min={tempStartDate ? tempStartDate.toISOString().split('T')[0] : undefined}
                                                max={new Date().toISOString().split('T')[0]}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    opacity: 0,
                                                    cursor: 'pointer',
                                                }}/>
                                        )}
                                    </Pressable>
                                </View>
                                {/* on native expo go only, else web will crash */}
                                {showStartCalendar && Platform.OS !== "web" && (
                                    <DateTimePicker
                                        // fall back to today
                                        value={tempStartDate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={pickStartDate}
                                        // stops selection of future date
                                        maximumDate={tempEndDate || new Date()}/>
                                )}

                                {showStartCalendar && Platform.OS === 'ios' && (
                                    <Button title="Confirm Start Date" onPress={() => setShowStartCalendar(false)} />
                                )}
                                {showEndCalendar && Platform.OS !== "web" && (
                                    <DateTimePicker
                                        value={tempEndDate || new Date()}
                                        mode="date"
                                        display="default"
                                        minimumDate={tempStartDate || undefined}
                                        maximumDate={new Date()}
                                        onChange={pickEndDate}/>
                                )}
                                {showEndCalendar && Platform.OS === 'ios' && (
                                    <Button title="Confirm End Date" onPress={() => setShowEndCalendar(false)} />
                                )}
                            </View>

                            <View style={PopupStyles.modalFooter}>
                                <Pressable style={[PopupStyles.actionButton, PopupStyles.resetButton]} onPress={handleResetFilters}>
                                    <Text style={PopupStyles.resetButtonText}>Reset All</Text>
                                </Pressable>
                                <Pressable style={[PopupStyles.actionButton, PopupStyles.applyButton]} onPress={handleApplyFilters}>
                                    <Text style={PopupStyles.applyButtonText}>Apply Filters</Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
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
        paddingTop: spacing.xs,
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: spacing.sm,
        backgroundColor: colors.surfaceSoft,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#f1e2c8",
        padding: spacing.xs,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
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
        shadowOffset: { width: 0, height: 2 },
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