import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { screenOptions, webLayoutStyles } from '../styles/globalStyles';

export default function RootLayout() {
  const content = (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="item-details" options={{ title: 'Item Details', headerBackButtonDisplayMode: "minimal" }} />
    </Stack>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={webLayoutStyles.webBackground}>
        <View style={webLayoutStyles.webContainer}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}