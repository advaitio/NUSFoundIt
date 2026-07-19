import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { colors } from "../../styles/globalStyles";

export default function TabLayout() {
    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                tabBarActiveTintColor: colors.logoMain,
                tabBarInactiveTintColor: "#6b7280",
                headerTitleAlign: "center",

                tabBarStyle: {
                    backgroundColor: "#fffdf8",
                    borderTopWidth: 1,
                    borderTopColor: "#eadcc8",
                    height: 70,
                    paddingTop: 4,
                    paddingBottom: 8,
                    shadowColor: "#000",
                    shadowOffset: {width: 0, height: -2},
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 8,
                },

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen 
                name="report" 
                options={{ 
                    title: "Report",
                    headerShown: false,
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
                    headerShown: false,
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
                    headerShown: false,
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