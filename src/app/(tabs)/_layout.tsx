import { Tabs } from "expo-router";
import { colors, globalStyles } from "../../styles/globalStyles";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: colors.logoMain,
            tabBarInactiveTintColor: colors.textSecondary,
            headerTitleAlign: "center",
        }}
        >
            <Tabs.Screen name="index" options={{ title: "Home" }} />
            <Tabs.Screen name="report" options={{ title: "Report" }} />
            <Tabs.Screen name="listings" options={{ title: "Listings" }} />
        </Tabs>
    )
}