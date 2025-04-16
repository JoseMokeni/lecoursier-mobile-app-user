import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

const Tasks = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tasks</Text>
      </View>

      {user && (
        <View style={styles.userInfoCard}>
          <Text style={styles.userName}>Welcome, {user.name}</Text>
          <Text style={styles.text}>Tasks will appear here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  userInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: "#666",
  },
});

export default Tasks;
