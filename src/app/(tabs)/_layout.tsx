import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { colors } from "../../styles/globalStyles";

export default function TabLayout() {
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
                    tabBarIcon: ({ focused, color, size }) => (
                        <Image
                            source={ focused ? require("../../../assets/images/add-circle.png") : require("../../../assets/images/add-circle-outline.png")}
                            style={{ width: size, height: size}}
                            tintColor={color}
                        />
                    ),
                }} 
            />
            <Tabs.Screen 
                name="index"
                options={{ 
                    title: "Home",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Image
                            source={focused ? require("../../../assets/images/home.png") : require("../../../assets/images/home-outline.png")}
                            style={{ width: size, height: size}}
                            tintColor={color}
                        />
                    ),
                }} 
            />
            <Tabs.Screen 
                name="listings" 
                options={{ 
                    title: "Listings",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Image
                            source={focused ? require("../../../assets/images/list-circle.png") : require("../../../assets/images/list-circle-outline.png")}
                            style={{ width: size, height: size}}
                            tintColor={color}
                        />
                    ),
                }} 
            />
        </Tabs>
    )
}