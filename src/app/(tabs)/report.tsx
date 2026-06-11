import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { colors, globalStyles } from "../../styles/globalStyles";

export default function ReportScreen() {
    return (
        <View style={globalStyles.centeredScreen}>
            <Text style={globalStyles.title}>Report an Item</Text>
            <Text style={globalStyles.subtitle}>This page will contain the Found Item and Lost Item forms.</Text>
        </View>)
}