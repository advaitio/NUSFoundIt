import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export const colors = {
    background: "#ffffff",
    surface: "#f9fafb",
    primary: "#007AFF",

    textPrimary: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#666666",
    textInput: "#333333",
    placeholder: "#999999",

    border: "#e5e7eb",
    inputBorder: "#cccccc",

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
        padding: spacing.xl,
        alignItems: "center",
        justifyContent: "center",
    },

    formContainer: {
        flexGrow: 1,
        padding: spacing.xxl,
        paddingBottom: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
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
        padding: 14,
        borderRadius: 8,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        width: "100%",
        marginBottom: spacing.md,
        overflow: "hidden"
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
});