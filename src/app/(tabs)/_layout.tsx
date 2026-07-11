import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import { colors } from "../../styles/globalStyles";

export default function TabLayout() {
    useFonts(Ionicons.font);
    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                tabBarActiveTintColor: colors.logoMain,
                tabBarInactiveTintColor: colors.textSecondary,
                headerTitleAlign: "center",
            }}
        >
            <Tabs.Screen 
                name="report" 
                options={{ 
                    title: "Report",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle" size={size} color={color} />
                    ),
                }} 
            />
            <Tabs.Screen 
                name="index"
                options={{ 
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }} 
            />
            <Tabs.Screen 
                name="listings" 
                options={{ 
                    title: "Listings",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                }} 
            />
        </Tabs>
    )
}