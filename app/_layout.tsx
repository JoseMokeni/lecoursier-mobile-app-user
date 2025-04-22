import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "#fff" },
            headerTitleStyle: {
              color: "rgb(37 99 235)",
              fontSize: 20,
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              // headerShown: false,
              title: "Le Coursier",
            }}
          />
          <Stack.Screen
            name="tasks/details"
            options={{
              title: "Task details",
              headerShown: true,
            }}
          />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
