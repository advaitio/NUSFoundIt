import { Stack } from 'expo-router';
import { screenOptions } from '../styles/globalStyles';

export default function RootLayout() {
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* show header when viewing item */}
      <Stack.Screen name="item-details" options={{ title: 'Item Details', headerBackButtonDisplayMode: "minimal" }} />
    </Stack>
  );
}