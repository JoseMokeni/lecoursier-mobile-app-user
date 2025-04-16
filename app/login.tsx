import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = () => {
  const [companyCode, setCompanyCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    // Validate inputs
    if (!companyCode.trim()) {
      Alert.alert("Input Required", "Please enter your company code");
      return;
    }
    if (!username.trim()) {
      Alert.alert("Input Required", "Please enter your username");
      return;
    }
    if (!password) {
      Alert.alert("Input Required", "Please enter your password");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(companyCode.trim(), username.trim(), password);

      if (result.error) {
        Alert.alert("Login Failed", result.error);
      } else if (result.success) {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Error",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Le Coursier (User)</Text>
            <Text style={styles.tagline}>Courier Management</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Company Code</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="business-outline"
                size={20}
                color="#777"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter company code"
                placeholderTextColor="#999"
                value={companyCode}
                onChangeText={setCompanyCode}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#777"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#777"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isSubmitting && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.companyInfo}>
              <Text style={styles.companyInfoText}>© 2025 Le Coursier App</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0066CC",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 16,
  },
  inputIcon: {
    padding: 10,
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: "#0066CC",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: "#88AEDD",
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  companyInfo: {
    marginTop: 40,
    alignItems: "center",
  },
  companyInfoText: {
    fontSize: 14,
    color: "#999",
  },
});

export default LoginScreen;
