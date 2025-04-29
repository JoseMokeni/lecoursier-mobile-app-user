import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import apiService from "@/services/apiService";

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

const Tasks = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortByDueDate, setSortByDueDate] = useState(false);

  // Extract fetchTasks function so it can be reused
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

  useFocusEffect(
    useCallback(() => {
      // Initial fetch
      fetchTasks();

      // Set up interval to fetch tasks every 15 seconds
      const interval = setInterval(() => {
        console.log("Auto-refreshing tasks...");
        fetchTasks();
      }, 15000); // 15 seconds

      // Clean up interval when component is unfocused
      return () => {
        console.log("Cleaning up task refresh interval");
        clearInterval(interval);
      };
    }, [])
  );

  const getPriorityColor = (p: string) =>
    p.toLowerCase() === "high"
      ? "#FF3B30"
      : p.toLowerCase() === "medium"
      ? "#FF9500"
      : p.toLowerCase() === "low"
      ? "#34C759"
      : "#777";

  const getStatusBadgeStyle = (s: string) =>
    s.toLowerCase() === "completed"
      ? styles.statusCompleted
      : s.toLowerCase() === "in_progress"
      ? styles.statusInProgress
      : styles.statusPending;

  const getStatusText = (s: string) =>
    s.toLowerCase() === "in_progress"
      ? "In Progress"
      : s.toLowerCase() === "completed"
      ? "Completed"
      : "Pending";

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : "Not set";

  const handleTaskPress = (t: Task) =>
    router.push({
      pathname: "/tasks/details",
      params: {
        id: t.id.toString(),
        name: t.name,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate || "",
        completedAt: t.completedAt || "",
        userId: t.userId.toString(),
        userName: t.user.username,
        milestoneId: t.milestoneId.toString(),
        milestoneName: t.milestone.name,
        milestoneLongitudinal: t.milestone.longitudinal,
        milestoneLatitudinal: t.milestone.latitudinal,
        milestoneFavorite: t.milestone.favorite.toString(),
        milestoneCreatedAt: t.milestone.createdAt,
      },
    });

  const sortTasksByDueDate = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      // Put tasks with no due date at the bottom
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      // Sort by due date (ascending - closest due date first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  const filteredTasks = tasks
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.user.username.toLowerCase().includes(q)
      );
    })
    .filter((t) => !statusFilter || t.status === statusFilter)
    .filter(
      (t) =>
        !priorityFilter ||
        t.priority.toLowerCase() === priorityFilter.toLowerCase()
    );

  // Apply sorting if needed
  const sortedAndFilteredTasks = sortByDueDate
    ? sortTasksByDueDate(filteredTasks)
    : filteredTasks;

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskName}>{item.name}</Text>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) },
          ]}
        >
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>

      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.milestone.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Due: {formatDate(item.dueDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.user.username}</Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={getStatusBadgeStyle(item.status)}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterChipsContainer}>
        {[
          { label: "All", value: "" },
          { label: "Pending", value: "pending" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
        ].map(({ label, value }) => (
          <TouchableOpacity
            key={value || "all"}
            style={[styles.chip, statusFilter === value && styles.chipActive]}
            onPress={() => setStatusFilter(value)}
          >
            <Text
              style={[
                styles.chipText,
                statusFilter === value && styles.chipTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {statusFilter === "pending" && (
        <>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filter by Priority:</Text>
            <View style={styles.filterChipsContainer}>
              {[
                { label: "All", value: "" },
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ].map(({ label, value }) => (
                <TouchableOpacity
                  key={value || "all-priority"}
                  style={[
                    styles.chip,
                    priorityFilter === value && styles.chipActive,
                    value && {
                      backgroundColor: value
                        ? getPriorityColor(value) + "40"
                        : undefined,
                    },
                    priorityFilter === value &&
                      value && { backgroundColor: getPriorityColor(value) },
                  ]}
                  onPress={() => setPriorityFilter(value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      priorityFilter === value && styles.chipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sortingContainer}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortByDueDate && styles.sortButtonActive,
              ]}
              onPress={() => setSortByDueDate(!sortByDueDate)}
            >
              <Ionicons
                name={sortByDueDate ? "calendar" : "calendar-outline"}
                size={16}
                color={sortByDueDate ? "#FFF" : "#666"}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  sortByDueDate && styles.sortButtonTextActive,
                ]}
              >
                Sort by due date
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTasks}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sortedAndFilteredTasks.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="clipboard-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No tasks found</Text>
        </View>
      ) : (
        <FlatList
          data={sortedAndFilteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchTasks}
        />
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
  addButton: {
    backgroundColor: "#0066CC",
    borderRadius: 50,
    padding: 10,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: "#0066CC",
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF3B30",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#0066CC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  createButton: {
    marginTop: 20,
    backgroundColor: "#0066CC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  priorityBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  priorityText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  taskDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusCompleted: {
    backgroundColor: "#34C759",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusInProgress: {
    backgroundColor: "#FF9500",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusPending: {
    backgroundColor: "#FF3B30",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  filterSection: {
    marginBottom: 15,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  sortingContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  sortButtonActive: {
    backgroundColor: "#0066CC",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
  },
});

export default Tasks;
