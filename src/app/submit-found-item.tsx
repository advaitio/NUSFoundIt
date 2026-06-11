import { ScrollView } from "react-native";
import FoundItemForm from "../components/FoundItemForm";
import { colors, spacing } from "../styles/globalStyles";

export default function SubmitFoundItemScreen() {
    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}
            keyboardShouldPersistTaps="handled"
        >
            <FoundItemForm />
        </ScrollView>
    )
}