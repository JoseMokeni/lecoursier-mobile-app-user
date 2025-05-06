import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  StatusBar,
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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FA" />

      <View style={styles.bgAccent} />

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatar}>
              <FontAwesome name="user" size={48} color="#4A90E2" />
            </View>
          </View>
          {user?.role && <Text style={styles.roleText}>{user.role}</Text>}
        </View>

        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <Text style={styles.userDetails}>@{user?.username || "username"}</Text>
        <Text style={styles.userDetails}>
          {user?.email || "email@example.com"}
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#4A90E2" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Le Coursier App v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FA",
    alignItems: "center",
    justifyContent: "center",
  },
  bgAccent: {
    position: "absolute",
    top: -80,
    left: -80,
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: "#E3F0FF",
    borderRadius: width,
    zIndex: 0,
  },
  profileCard: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 24,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#B3D4FC",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F8FA",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  roleText: {
    color: "#4A90E2",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "uppercase",
    marginTop: 10,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
    marginTop: 6,
    textAlign: "center",
  },
  userDetails: {
    fontSize: 15,
    color: "#6A7A90",
    marginBottom: 2,
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 28,
    backgroundColor: "#fff",
  },
  logoutText: {
    color: "#4A90E2",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    padding: 18,
    zIndex: 2,
  },
  footerText: {
    color: "#bbb",
    fontSize: 13,
  },
});

export default ProfileScreen;
