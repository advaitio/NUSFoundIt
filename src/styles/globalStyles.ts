import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Platform, StyleSheet } from "react-native";

export const colors = {
    //background: "#ffffff", // old
    background: "#fffbf4", // new (light beige) same as logoCream
    surface: "#f9fafb",
    surfaceSoft: "#fffdf8",
    //primary: "#007AFF", // old
    primary: "#043366", // new (logoMain)

    textPrimary: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#666666",
    textInput: "#333333",
    placeholder: "#999999",

    border: "#e5e7eb",
    inputBorder: "#cccccc",

    // NUSFoundIt app colors
    logoMain: "#043366",
    logoSecondary: "#059190",
    logoAccent: "#EE7B12",
    logoCream: "#fffbf4",

    error: "#d32f2f",
};

export const spacing = {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const globalStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.xl,
    },

    centeredScreen: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.xxxl,
        alignItems: "center",
        justifyContent: "center",
    },

    formContainer: {
        flexGrow: 1,
        padding: spacing.lg,
        //paddingBottom: 60,
        //justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        width: "100%",
    },

    title: {
        fontSize: 38,
        fontWeight: "900",
        marginBottom: spacing.md,
        textAlign: "center",
        color: colors.textPrimary,
    },

    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: spacing.sm,
        color: colors.textPrimary,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 16,
        marginBottom: spacing.xxxl,
        color: colors.textMuted,
        lineHeight: 22,
        textAlign: "center",
    },

    pageSubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        lineHeight: 21,
        textAlign: "center",
    },

    primaryButton: {
        backgroundColor: colors.primary,
        color: "#fff",
        paddingVertical: 16,
        borderRadius: 14,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        width: "100%",
        marginBottom: spacing.lg,
        overflow: "hidden"
    },
    buttonContainer: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 16,
        width: "35%",
        marginTop: 10,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        padding: spacing.md,
        marginBottom: spacing.lg,
        fontSize: 16,
        backgroundColor: colors.surface,
        color: colors.textInput,
    },

    multilineInput: {
        height: 80,
        textAlignVertical: "top",
    },

    dropdown: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
    },

    placeholderText: {
        fontSize: 16,
        color: colors.placeholder,
    },

    inputText: {
        fontSize: 16,
        color: colors.textInput,
    },

    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },

    errorText: {
        color: colors.error,
        marginBottom: spacing.md,
        fontSize: 14,
        fontWeight: "600",
    },

    logo: {
        width: 130,
        height: 130,
        resizeMode: "contain",
        marginBottom: spacing.sm,
    },
    detailsContainer: {
        gap: 10,
    },
    detailRow: {
        gap: 10,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    detailLabel: {
        fontWeight: "700",
        color: "#4b5563",
        width: 135,
        fontSize: 16,
        lineHeight: 30,
    },
    detailValue: {
        color: colors.textPrimary,
        flex: 1,
        fontSize: 16,
        lineHeight: 30,
    },
    linkDetailValue: {
        color: colors.primary,
        flex: 1,
        fontSize: 16,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.logoCream,
    }
});

export const Suggestions = {
    searchContainer: {
        width: "100%" as const,
        zIndex: 10,
        position: "relative" as const,
    },
    suggestionRow: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    suggestionText: {
        fontSize: 16,
        color: colors.textInput,
    },
    dropdownPopover: {
        borderColor: 'transparent',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: -12,
        marginBottom: 16,
        width: "100%" as const,
        ...Platform.select({
          ios: {
            shadowColor: colors.textPrimary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 3,
          },
        }),
    },
};

export const screenOptions: NativeStackNavigationOptions = {
    headerTitleAlign: "center",
    headerShadowVisible: true,
    headerStyle: {
        backgroundColor: colors.background,
    },
    headerTitleStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    contentStyle: {
        backgroundColor: colors.background,
    },
};

export const PopupStyles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        paddingHorizontal: spacing.lg,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.xl,
        paddingBottom: Platform.OS === "ios" ? 40 : spacing.xl,
        maxHeight: "80%",
    },
    modalHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: spacing.sm,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    modalCloseButton: {
        fontSize: 20,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    modalPlaceholder: {
        paddingVertical: spacing.xl,
        alignItems: "center",
    },
    modalPlaceholderText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    resetButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    resetButtonText: {
        color: colors.textSecondary,
        fontSize: 15,
        fontWeight: "600",
    },
    applyButton: {
        backgroundColor: colors.primary,
    },
    applyButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    dismissLayer: {
        flex: 1,
    },
    slideWrapper: {
        flex: 1,
        justifyContent: "flex-end",
    },
    filterFormContainer: {
        width: "100%",
        paddingVertical: spacing.sm,
    },
    filterLabelText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    dropdownMenuPosition: {
        transform: [{ translateY: -10 }],
    },
});

export const DateStyles = StyleSheet.create({
    datePickerBox: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        backgroundColor: "#f9f9f9",
        justifyContent: "center",
    },
    dualDatePickerBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        justifyContent: "center",
    },
    dateRangeRow: {
        flexDirection: "row",
        gap: spacing.md,
        width: "100%",
    },
    datePickerLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 2,
    },
});

export const ImageStyles = StyleSheet.create({
    imageBox: {
        width: "100%",
        alignItems: "center",
        marginBottom: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        backgroundColor: colors.surface,
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    deleteImage: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: colors.error,
        borderRadius: 6,
    },
    deleteImageText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});