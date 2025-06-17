import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BadgeCard } from "./BadgeCard";
import badgeService from "@/services/badgeService";
import { EarnedBadge, BadgeWithProgress } from "@/types/badge";
import { useBadgeContext } from "@/context/BadgeContext";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

export const BadgesSection: React.FC = () => {
  const { onNewBadgeEarned } = useBadgeContext();
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  const handleNewBadgeEarned = useCallback(async (data: any) => {
    console.log("BadgesSection: handleNewBadgeEarned called with:", data);
    try {
      const newBadge = data.badge;
      const earnedAt = data.earned_at;

      console.log("BadgesSection: Processing new badge:", newBadge.name);

      // Create new earned badge object
      const newEarnedBadge: EarnedBadge = {
        badge: {
          ...newBadge,
          category_name: newBadge.category_name || "General",
          rarity_name: newBadge.rarity_name || newBadge.rarity,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          criteria: {},
        },
        earned_at: earnedAt,
        progress: {
          current: 1,
          required: 1,
          percentage: 100,
        },
      };

      console.log("BadgesSection: Adding badge to earned list");
      // Add to earned badges list
      setEarnedBadges((prev) => {
        console.log("BadgesSection: Previous earned badges:", prev.length);
        const newList = [newEarnedBadge, ...prev];
        console.log("BadgesSection: New earned badges list:", newList.length);
        return newList;
      });

      // Update all badges list if it's loaded
      setAllBadges((prev) =>
        prev.map((badgeWithProgress) =>
          badgeWithProgress.badge.id === newBadge.id
            ? {
                ...badgeWithProgress,
                earned: true,
                earned_at: earnedAt,
                progress: {
                  current: 1,
                  required: 1,
                  percentage: 100,
                },
              }
            : badgeWithProgress
        )
      );

      console.log("BadgesSection: Badge processing completed");
    } catch (error) {
      console.error("BadgesSection: Error handling new badge earned:", error);
    }
  }, []);

  useEffect(() => {
    fetchEarnedBadges();

    // Listen for badge earned events from the index component
    console.log("BadgesSection: Setting up badge listener");
    const cleanup = onNewBadgeEarned(handleNewBadgeEarned);

    return cleanup;
  }, [onNewBadgeEarned, handleNewBadgeEarned]);

  const fetchEarnedBadges = async () => {
    try {
      setLoading(true);
      const response = await badgeService.getEarnedBadges();
      setEarnedBadges(response.data);
    } catch (error) {
      console.error("Error fetching earned badges:", error);
      Alert.alert("Error", "Failed to load badges. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBadges = async () => {
    try {
      setProgressLoading(true);
      const response = await badgeService.getAllBadges();
      setAllBadges(response.data);
    } catch (error) {
      console.error("Error fetching all badges:", error);
      Alert.alert("Error", "Failed to load badge progress. Please try again.");
    } finally {
      setProgressLoading(false);
    }
  };

  const handleShowProgress = async () => {
    setShowProgressModal(true);
    if (allBadges.length === 0) {
      await fetchAllBadges();
    }
  };

  const handleCloseModal = () => {
    setShowProgressModal(false);
  };

  const groupBadgesByCategory = (badges: BadgeWithProgress[]) => {
    return badges.reduce((groups, badgeWithProgress) => {
      const category = badgeWithProgress.badge.category_name;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(badgeWithProgress);
      return groups;
    }, {} as Record<string, BadgeWithProgress[]>);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>🏆 Badges</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading badges...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>🏆 Badges</Text>
        <TouchableOpacity
          style={styles.progressButton}
          onPress={handleShowProgress}
        >
          <Ionicons name="analytics-outline" size={16} color="#4A90E2" />
          <Text style={styles.progressButtonText}>View Progress</Text>
        </TouchableOpacity>
      </View>

      {earnedBadges.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesScroll}
        >
          {earnedBadges.map((earnedBadge) => (
            <View key={earnedBadge.badge.id} style={styles.earnedBadgeItem}>
              <BadgeCard
                badge={earnedBadge.badge}
                earned={true}
                earnedAt={earnedBadge.earned_at}
                progress={earnedBadge.progress}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noBadgesContainer}>
          <Text style={styles.noBadgesText}>No badges earned yet</Text>
          <Text style={styles.noBadgesSubtext}>
            Complete tasks to start earning badges!
          </Text>
        </View>
      )}

      {/* Progress Modal */}
      <Modal
        visible={showProgressModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Badge Progress</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>

          {progressLoading ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading progress...</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              {Object.entries(groupBadgesByCategory(allBadges)).map(
                ([category, categoryBadges]) => (
                  <View key={category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    {categoryBadges.map((badgeWithProgress) => (
                      <BadgeCard
                        key={badgeWithProgress.badge.id}
                        badge={badgeWithProgress.badge}
                        earned={badgeWithProgress.earned}
                        earnedAt={badgeWithProgress.earned_at}
                        progress={badgeWithProgress.progress}
                      />
                    ))}
                  </View>
                )
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  progressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F0FF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  progressButtonText: {
    color: "#4A90E2",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#6A7A90",
    fontSize: 14,
    marginLeft: 8,
  },
  badgesScroll: {
    marginHorizontal: -4,
  },
  earnedBadgeItem: {
    width: width * 0.7,
    marginHorizontal: 4,
  },
  noBadgesContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  noBadgesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6A7A90",
    marginBottom: 4,
  },
  noBadgesSubtext: {
    fontSize: 14,
    color: "#A0A0A0",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F8FA",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  closeButton: {
    padding: 4,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 12,
    paddingLeft: 4,
  },
});
