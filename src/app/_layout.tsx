import { Stack } from 'expo-router';
import { screenOptions } from '../styles/globalStyles';

export default function RootLayout() {
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="submit-found-item" options={{ title: "Submit Found Item", headerBackTitle: "" }} />
      <Stack.Screen name="found-item-listings" options={{ title: "Public Listings", headerBackTitle: "" }} />
      <Stack.Screen name="submit-lost-item" options={{ title: "Submit Lost Item", headerBackTitle: "" }} />
      <Stack.Screen name="lost-item-listings" options={{ title: "Public Listings", headerBackTitle: "" }} />
    </Stack>
  )
}