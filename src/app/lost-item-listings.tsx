import { View } from "react-native";
import LostItemsList from "../components/LostItemsList";
import { colors, spacing } from "../styles/globalStyles";

export default function LostItemListingsScreen() {
    return (
        <View style={{
            flex: 1,
            backgroundColor: colors.background,
            padding: spacing.xl,
        }}>
            <LostItemsList />
        </View>
    )
}