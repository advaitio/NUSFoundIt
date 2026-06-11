import { View } from "react-native";
import FoundItemsList from "../components/FoundItemsList";
import { colors, spacing } from "../styles/globalStyles";

export default function FoundItemListingsScreen() {
    return (
        <View style={{
            flex: 1,
            backgroundColor: colors.background,
            padding: spacing.xl,
        }}>
            <FoundItemsList />
        </View>
    )
}