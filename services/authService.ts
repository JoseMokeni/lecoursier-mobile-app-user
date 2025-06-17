import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { Platform, PermissionsAndroid } from "react-native";
import apiService from "@/services/apiService";

interface User {
  username: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";
const COMPANY_CODE_KEY = "company_code";

const requestNotificationPermissionIos = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Authorization status:", authStatus);
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log("FCM Token:", fcmToken);
      const response = await apiService.put("/update-device-token", {
        token: fcmToken,
      });
      console.log(response);
    } else {
      console.log("No FCM token received");
    }
  } else {
    console.log("Notification permission denied");
  }
};

const requestNotificationPermissionAndroid = async () => {
  try {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Notification permission granted");
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log("FCM Token:", fcmToken);
          const response = await apiService.put("/update-device-token", {
            token: fcmToken,
          });
          console.log(response);
        } else {
          console.log("No FCM token received");
        }
      } else {
        console.log("Notification permission denied");
      }
    } else if (Platform.Version >= 26) {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log("FCM Token:", fcmToken);
          const response = await apiService.put("/update-device-token", {
            token: fcmToken,
          });
          console.log(response);
        } else {
          console.log("No FCM token received");
        }
      }
    }
  } catch (err) {
    console.warn(err);
  }
};

const authService = {
  // Login function
  login: async (companyCode: string, username: string, password: string) => {
    const API_ENDPOINT = process.env.EXPO_PUBLIC_API_URL + "/login";
    try {
      console.log("API_ENDPOINT", API_ENDPOINT);

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": companyCode,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          return {
            error: "Invalid creadentials",
          };
        }
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data: AuthResponse = await response.json();

      // check if the user is an admin
      if (data.user.role === "admin") {
        return {
          error: "Admins cannot log in to the app",
        };
      }

      // Store auth data locally
      if (data.token && data.user) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        await AsyncStorage.setItem(COMPANY_CODE_KEY, companyCode);
      }

      // request notification permissions and send FCM token
      if (Platform.OS === "ios") {
        requestNotificationPermissionIos();
      }
      if (Platform.OS === "android") {
        requestNotificationPermissionAndroid();
      }

      return data;
    } catch (error: Error | any) {
      console.error("Error during login:", error);
      return {
        error: error.message || "Login failed. Please try again.",
      };
    }
  },

  // Get logged in user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userDataString) {
        return JSON.parse(userDataString);
      }
      return null;
    } catch (error) {
      console.error("Error retrieving current user:", error);
      return null;
    }
  },

  // Get company code
  getCompanyCode: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(COMPANY_CODE_KEY);
    } catch (error) {
      console.error("Error retrieving company code:", error);
      return null;
    }
  },

  // Get authentication token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving auth token:", error);
      return null;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      // Note: You might want to keep the company code for convenience
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },
};

export default authService;
