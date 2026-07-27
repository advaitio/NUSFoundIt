import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { Text } from "react-native";
// used an external stylesheet for most of the styling here
import { colors } from "../../styles/globalStyles";

// tabs layout is used for home, reports and listings. 
export default function TabLayout() {
    return (
        <Tabs
            // defaults to home page.
            initialRouteName="index"
            screenOptions={{
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
            }}>
            <Tabs.Screen 
                name="report" 
                options={{ 
                    title: "Report",
                    headerShown: false,
                    tabBarLabel: () => (
                        <Text style={{fontSize: 12, fontWeight: 600, color: colors.logoSecondary}}>Report</Text>
                    ),
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            //swap to filled icon when focused on
                            source={ focused ? require("../../../assets/images/add-circle.png") : require("../../../assets/images/add-circle-outline.png")}
                            // use local png image assets because original Ionicons breaks web deployments. 
                            style={{ width: size, height: size}}
                            tintColor={colors.logoSecondary}/>
                    ),
                }} 
            />
            <Tabs.Screen 
                name="index"
                options={{ 
                    title: "Home",
                    headerShown: false,
                    tabBarLabel: () => (
                        <Text style={{fontSize: 12, fontWeight: 600, color: colors.logoMain}}>Home</Text>
                    ),
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={focused ? require("../../../assets/images/home.png") : require("../../../assets/images/home-outline.png")}
                            style={{ width: size, height: size}}
                            tintColor={colors.logoMain}/>
                    ),
                }} 
            />
            <Tabs.Screen 
                name="listings" 
                options={{ 
                    title: "Listings",
                    headerShown: false,
                    tabBarLabel: () => (
                        <Text style={{fontSize: 12, fontWeight: 600, color: colors.logoAccent}}>Listings</Text>
                    ),
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={focused ? require("../../../assets/images/list-circle.png") : require("../../../assets/images/list-circle-outline.png")}
                            style={{ width: size, height: size}}
                            tintColor={colors.logoAccent}/>
                    ),
                }} 
            />
        </Tabs>
    )
}