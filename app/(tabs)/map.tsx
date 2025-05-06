import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import apiService from "@/services/apiService";
import { useCallback, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import authService from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import * as Location from "expo-location";

interface Task {
  id: number;
  name: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  userId: number;
  user: { id: number; username: string; email: string; phone: string | null };
  milestoneId: number;
  milestone: {
    id: number;
    name: string;
    longitudinal: string;
    latitudinal: string;
    favorite: boolean;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

const getMarkerColor = (status: string) => {
  if (status === "pending") return "#007AFF"; // blue
  if (status === "in_progress") return "#FF9500"; // orange
  return "#888";
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "#FF3B30";
    case "medium":
      return "#FF9500";
    case "low":
      return "#34C759";
    default:
      return "#888";
  }
};

const Map = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [startingTaskId, setStartingTaskId] = useState<number | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const router = useRouter();
  const [lastPressedTaskId, setLastPressedTaskId] = useState<number | null>(
    null
  );
  const [lastPressTime, setLastPressTime] = useState<number>(0);

  const fetchTasks = async () => {
    try {
      // Don't set loading to true on subsequent fetches to avoid UI flickering
      if (tasks.length === 0) {
        setLoading(true);
      }
      const response = await apiService.get("/tasks");
      const sorted = (response.data || []).sort(
        (a: Task, b: Task) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log("Fetched tasks:", sorted);
      setTasks(sorted);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    let channel: any = null;
    let isMounted = true;

    const setupPusher = async () => {
      const COMPANY_CODE = await authService.getCompanyCode();
      const username = user?.username || "";
      // log all the env vars used bellow with types
      console.log("Pusher App Key:", process.env.EXPO_PUBLIC_PUSHER_APP_KEY);
      console.log("Pusher Host:", process.env.EXPO_PUBLIC_PUSHER_HOST);
      console.log("Pusher Port:", process.env.EXPO_PUBLIC_PUSHER_PORT);
      console.log("Pusher Cluster:", process.env.EXPO_PUBLIC_PUSHER_CLUSTER);
      console.log("Company Code:", COMPANY_CODE);
      console.log("Username:", username);
      const pusher = new Pusher(
        process.env.EXPO_PUBLIC_PUSHER_APP_KEY || "lecoursier",
        {
          wsHost: process.env.EXPO_PUBLIC_PUSHER_HOST || "10.0.2.2",
          wsPort: parseInt(process.env.EXPO_PUBLIC_PUSHER_PORT || "6001", 10),
          wssPort: parseInt(process.env.EXPO_PUBLIC_PUSHER_PORT || "6001", 10),
          forceTLS: false,
          disableStats: true,
          enabledTransports: ["ws"],
          cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER || "mt1",
        }
      );
      pusherRef.current = pusher;

      channel = pusher.subscribe(`tasks.${COMPANY_CODE}.${username}`);
      channel.bind("App\\Events\\TaskCreated", function (data: any) {
        // update the tasks list
        console.log("Task created event received:", data);
        if (!isMounted) return;
        const newTask = data.task;
        console.log("New task data:", newTask);
        setTasks((prevTasks) => {
          const updatedTasks = [...prevTasks, newTask];
          return updatedTasks.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      });

      channel.bind("App\\Events\\TaskDeleted", function (data: any) {
        // update the tasks list
        console.log("Task deleted event received:", data);
        if (!isMounted) return;
        const deletedTaskId = data.taskId;
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== deletedTaskId)
        );
      });

      channel.bind("App\\Events\\TaskUpdated", function (data: any) {
        // update the tasks list
        console.log("Task updated event received:", data);
        if (!isMounted) return;
        const updatedTask = data.task;
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      });
    };

    setupPusher();

    return () => {
      console.log("Cleaning up Pusher and Echo");

      isMounted = false;
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, []);

  // Default region (center of map), fallback to first task if available
  const visibleTasks = tasks.filter(
    (t) => t.status === "in_progress" || t.status === "pending"
  );
  const defaultRegion =
    visibleTasks.length > 0
      ? {
          latitude: parseFloat(visibleTasks[0].milestone.latitudinal),
          longitude: parseFloat(visibleTasks[0].milestone.longitudinal),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: 36.8065, // Example: Tunis
          longitude: 10.1815,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

  // Focus map on a task's milestone
  const focusOnTask = (task: Task) => {
    setSelectedTaskId(task.id);
    if (mapRef.current) {
      const region: Region = {
        latitude: parseFloat(task.milestone.latitudinal),
        longitude: parseFloat(task.milestone.longitudinal),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 500);
    }
  };

  // Start a pending task
  const startTask = async (task: Task) => {
    Alert.alert(
      "Start Task",
      `Do you want to start the task: "${task.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              setStartingTaskId(task.id);
              await apiService.post(`/tasks/${task.id}/start`);
              // Optionally, you can optimistically update the task status here
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === task.id ? { ...t, status: "in_progress" } : t
                )
              );
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to start task");
            } finally {
              setStartingTaskId(null);
            }
          },
        },
      ]
    );
  };

  // Complete a task in progress
  const completeTask = async (task: Task) => {
    Alert.alert(
      "Complete Task",
      `Do you want to complete the task: "${task.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              setCompletingTaskId(task.id);
              await apiService.post(`/tasks/${task.id}/complete`);
              // Optimistically update the task status
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === task.id ? { ...t, status: "completed" } : t
                )
              );
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to complete task");
            } finally {
              setCompletingTaskId(null);
            }
          },
        },
      ]
    );
  };

  // Handle single/double press on task card
  const handleTaskCardPress = (task: Task) => {
    const now = Date.now();
    if (lastPressedTaskId === task.id && now - lastPressTime < 400) {
      // Double tap detected, show details
      router.push({
        pathname: "/tasks/details",
        params: {
          id: task.id.toString(),
          name: task.name,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate || "",
          completedAt: task.completedAt || "",
          userId: task.userId.toString(),
          userName: task.user.username,
          milestoneId: task.milestoneId.toString(),
          milestoneName: task.milestone.name,
          milestoneLongitudinal: task.milestone.longitudinal,
          milestoneLatitudinal: task.milestone.latitudinal,
          milestoneFavorite: task.milestone.favorite.toString(),
          milestoneCreatedAt: task.milestone.createdAt,
        },
      });
      setLastPressedTaskId(null);
      setLastPressTime(0);
    } else {
      // Single tap: focus map
      focusOnTask(task);
      setLastPressedTaskId(task.id);
      setLastPressTime(now);
    }
  };

  // Get user location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUserLocation(null);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation || undefined}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {tasks
          .filter(
            (task) => task.status === "in_progress" || task.status === "pending"
          )
          .map((task) => (
            <Marker
              key={task.id}
              coordinate={{
                latitude: parseFloat(task.milestone.latitudinal),
                longitude: parseFloat(task.milestone.longitudinal),
              }}
              title={task.name}
              description={task.milestone.name}
              pinColor={getMarkerColor(task.status)}
            />
          ))}
      </MapView>
      {/* Superposed list of in-progress and pending tasks */}
      {visibleTasks.length > 0 && (
        <View style={styles.taskListOverlay}>
          <View style={styles.blurBackground} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {visibleTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  selectedTaskId === task.id && styles.taskCardSelected,
                  task.status === "pending" && styles.taskCardPending,
                  { borderLeftColor: getPriorityColor(task.priority) },
                ]}
              >
                <TouchableOpacity
                  style={styles.taskCardTouchable}
                  onPress={() => handleTaskCardPress(task)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.taskCardTitle}>{task.name}</Text>
                  <Text style={styles.taskCardMilestone}>
                    {task.milestone.name}
                  </Text>
                  <Text
                    style={[
                      styles.taskCardPriority,
                      {
                        color: getPriorityColor(task.priority),
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {task.priority}
                  </Text>
                  <Text
                    style={[
                      styles.taskCardStatus,
                      task.status === "pending"
                        ? styles.statusPending
                        : styles.statusInProgress,
                    ]}
                  >
                    {task.status === "pending" ? "Pending" : "In Progress"}
                  </Text>
                </TouchableOpacity>
                {task.status === "pending" && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => startTask(task)}
                    disabled={startingTaskId === task.id}
                  >
                    {startingTaskId === task.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.startButtonText}>Start Task</Text>
                    )}
                  </TouchableOpacity>
                )}
                {task.status === "in_progress" && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => completeTask(task)}
                    disabled={completingTaskId === task.id}
                  >
                    {completingTaskId === task.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.completeButtonText}>
                        Complete Task
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {visibleTasks.length === 0 && (
        <View style={styles.noTasksOverlay}>
          <Text style={styles.noTasksText}>
            No pending or in-progress tasks to display
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  noTasksOverlay: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 18,
    color: "#666",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 8,
  },
  taskListOverlay: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  blurBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    marginHorizontal: 2,
    zIndex: 0,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    minWidth: 170,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: "#888",
    marginVertical: 8,
    zIndex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  taskCardTouchable: {
    width: "100%",
  },
  taskCardSelected: {
    borderColor: "#0066CC",
    borderWidth: 2,
    backgroundColor: "#F0F8FF",
    shadowOpacity: 0.25,
  },
  taskCardPending: {
    backgroundColor: "#F0F7FF",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  taskCardTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 2,
    color: "#222",
  },
  taskCardMilestone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  taskCardPriority: {
    fontSize: 13,
    marginTop: 2,
  },
  taskCardStatus: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "bold",
  },
  startButton: {
    marginTop: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  completeButton: {
    marginTop: 8,
    backgroundColor: "#34C759", // green color for completion
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  calloutContainer: {
    minWidth: 180,
    alignItems: "flex-start",
    padding: 4,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
    color: "#222",
  },
  calloutMilestone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  calloutPriority: {
    fontSize: 13,
    marginTop: 2,
  },
  calloutStatus: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "bold",
  },
  calloutDescription: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
    marginBottom: 2,
  },
  calloutDueDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  calloutAssigned: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  statusPending: {
    color: "#007AFF",
  },
  statusInProgress: {
    color: "#FF9500",
  },
});

export default Map;
