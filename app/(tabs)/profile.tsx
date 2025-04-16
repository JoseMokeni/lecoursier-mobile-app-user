import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const ProfileScreen = () => {
  const { user, logout, isLoading } = useAuth();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FA" />

      <Animated.View
        style={[
          styles.profileContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.headerTitle}>My Profile</Text>

        <View style={styles.avatarContainer}>
          <LinearGradient colors={["#0088FF", "#0066CC"]} style={styles.avatar}>
            <FontAwesome name="user" size={60} color="#FFFFFF" />
          </LinearGradient>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          )}
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <View style={styles.userDetailRow}>
            <Ionicons name="person-outline" size={18} color="#666666" />
            <Text style={styles.userDetails}>
              @{user?.username || "username"}
            </Text>
          </View>
          <View style={styles.userDetailRow}>
            <Ionicons name="mail-outline" size={18} color="#666666" />
            <Text style={styles.userDetails}>
              {user?.email || "email@example.com"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

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
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginVertical: 20,
    textAlign: "center",
  },
  profileContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingTop: 5,
  },
  avatarContainer: {
    marginTop: 10,
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  roleBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
    width: "100%",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  userDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userDetails: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    width: "100%",
    marginBottom: 20,
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
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    width: width * 0.7,
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
