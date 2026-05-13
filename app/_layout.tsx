import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./context/AppContext";
import { StatusBar } from "expo-status-bar";

if (typeof globalThis.fetch === 'undefined') {
  // @ts-ignore
  globalThis.fetch = fetch;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="note/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="timer/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
