import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="submit-found-item" options={{ title: "Submit Found Item" }} />
      <Stack.Screen name="listings" options={{ title: "Public Listings" }} />
    </Stack>
  )
}