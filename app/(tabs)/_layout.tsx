import { Tabs } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useColorScheme, TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

/**
 * Tab navigation layout for the app
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { logout, user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          display: "flex",
        },
        headerShown: false, // Hide the header to avoid double headers
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="tasks" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
