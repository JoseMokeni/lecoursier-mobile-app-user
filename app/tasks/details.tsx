import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import apiService from "../../services/apiService";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const TaskDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse the params
  const id = params.id as string;
  const name = params.name as string;
  const description = params.description as string;
  const priority = params.priority as string;
  const status = params.status as string;
  const dueDate = params.dueDate as string;
  const userId = params.userId as string;
  const userName = params.userName as string;
  const milestoneId = params.milestoneId as string;
  const milestoneName = params.milestoneName as string;
  const milestoneLongitudinal = params.milestoneLongitudinal as string;
  const milestoneLatitudinal = params.milestoneLatitudinal as string;
  const milestoneFavorite = params.milestoneFavorite;
  const milestoneCreatedAt = params.milestoneCreatedAt as string;

  const handleDelete = () => {
    Alert.alert("Delete Task", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: confirmDelete },
    ]);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await apiService.delete(`/tasks/${id}`);
      Alert.alert("Success", "Task deleted successfully");
      router.back();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", error.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewMilestone = () => {
    console.log("View Milestone");
    console.log({
      id: milestoneId,
      name: milestoneName,
      lat: milestoneLatitudinal,
      lng: milestoneLongitudinal,
      favorite: milestoneFavorite,
      createdAt: milestoneCreatedAt,
    });
    // router.push({
    //   pathname: "/milestones/details",
    //   params: {
    //     id: milestoneId,
    //     name: milestoneName,
    //     lat: milestoneLatitudinal,
    //     lng: milestoneLongitudinal,
    //     favorite: milestoneFavorite,
    //     createdAt: milestoneCreatedAt,
    //   },
    // });
  };

  const getStatusStyle = () => {
    switch (status) {
      case "completed":
        return styles.statusCompleted;
      case "in_progress":
        return styles.statusInProgress;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Pending";
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "#FF3B30";
      case "medium":
        return "#FF9500";
      case "low":
        return "#34C759";
      default:
        return "#999999";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  // Parse coordinates for map
  const latitude = parseFloat(milestoneLatitudinal);
  const longitude = parseFloat(milestoneLongitudinal);
  const hasValidCoordinates = !isNaN(latitude) && !isNaN(longitude);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{name}</Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor() },
              ]}
            >
              <Text style={styles.priorityText}>{priority}</Text>
            </View>
          </View>

          <View style={styles.sectionTitle}>
            <Ionicons name="document-text-outline" size={18} color="#666" />
            <Text style={styles.sectionTitleText}>Description</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={getStatusStyle()}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>{formatDate(dueDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned To:</Text>
              <Text style={styles.detailValue}>{userName}</Text>
            </View>
          </View>

          <View style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.sectionTitleText}>
              Milestone Location: {milestoneName}
            </Text>
          </View>

          {hasValidCoordinates ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: latitude,
                  longitude: longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                // provider={PROVIDER_GOOGLE}
              >
                <Marker
                  coordinate={{ latitude, longitude }}
                  title={milestoneName}
                  description="Milestone location"
                />
              </MapView>
            </View>
          ) : (
            <View style={styles.invalidLocationContainer}>
              <Ionicons name="warning-outline" size={24} color="#FF9500" />
              <Text style={styles.invalidLocationText}>
                Location coordinates not available
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.deleteTaskButton}
            onPress={handleDelete}
          >
            <View style={styles.deleteTaskContent}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="trash-outline" size={20} color="#FFF" />
              )}
              {!isDeleting && (
                <Text style={styles.deleteTaskButtonText}>Delete Task</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  priorityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  descriptionContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    width: 100,
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
  },
  detailValue: {
    fontSize: 15,
    color: "#333",
  },
  statusPending: {
    backgroundColor: "#E5E5EA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusInProgress: {
    backgroundColor: "#5AC8FA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "#34C759",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  mapContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
    height: 300, // Increased from 200 to 300
    borderWidth: 1,
    borderColor: "#D6E4FF",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  invalidLocationContainer: {
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE0A1",
  },
  invalidLocationText: {
    fontSize: 14,
    color: "#815800",
    marginLeft: 8,
  },
  milestoneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#D6E4FF",
  },
  milestoneContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  milestoneTextContainer: {
    marginLeft: 12,
  },
  milestoneLabel: {
    fontSize: 14,
    color: "#666",
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  deleteTaskButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  deleteTaskContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteTaskButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default TaskDetails;
