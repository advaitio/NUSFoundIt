import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { colors, globalStyles } from "../../styles/globalStyles";

export default function ListingsScreen() {
    return (
        <View style={globalStyles.centeredScreen}>
            <Text style={globalStyles.title}>Listings</Text>
            <Text style={globalStyles.subtitle}>This is where the listings will be displayed.</Text>
        </View>
    )
}