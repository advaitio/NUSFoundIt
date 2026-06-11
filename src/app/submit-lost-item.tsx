import { ScrollView } from "react-native";
import LostItemForm from "../components/FoundItemForm";
import { colors, spacing } from "../styles/globalStyles";

export default function SubmitLostItemScreen() {
    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}
            keyboardShouldPersistTaps="handled"
        >
            <LostItemForm />
        </ScrollView>
    )
}