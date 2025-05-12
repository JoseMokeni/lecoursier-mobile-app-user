import React, { createContext, useContext, useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { Platform, PermissionsAndroid } from "react-native";
import apiService from "@/services/apiService";
import { useAuth } from "./AuthContext";

interface FcmContextData {}

const FcmContext = createContext<FcmContextData>({} as FcmContextData);

export const FcmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  useEffect(() => {
    const requestNotificationPermissionIos = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
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

    if (Platform.OS === "android") {
      requestNotificationPermissionAndroid();
    }
    if (Platform.OS === "ios") {
      requestNotificationPermissionIos();
    }
  }, []);

  return <FcmContext.Provider value={{}}>{children}</FcmContext.Provider>;
};

export const useFcm = () => useContext(FcmContext);

export default FcmContext;
