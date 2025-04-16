import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

const ProfileScreen = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            // Navigation will be handled by AuthGuard
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert(
              "Logout Failed",
              "There was a problem logging out. Please try again."
            );
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={60} color="#FFFFFF" />
          </View>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          )}
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userDetails}>
            @{user?.username || "username"}
          </Text>
          <Text style={styles.userDetails}>
            {user?.email || "email@example.com"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Le Coursier App v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  profileContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
  },
  roleBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  userDetails: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    padding: 20,
  },
  footerText: {
    color: "#999999",
    fontSize: 14,
  },
});

export default ProfileScreen;
