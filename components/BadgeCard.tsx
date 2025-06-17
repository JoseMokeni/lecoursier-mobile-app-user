import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Badge, Progress } from "@/types/badge";

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: string | null;
  progress?: Progress | null;
  onPress?: () => void;
}

const { width } = Dimensions.get("window");

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  earned,
  earnedAt,
  progress,
  onPress,
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "bronze":
        return "#CD7F32";
      case "silver":
        return "#C0C0C0";
      case "gold":
        return "#FFD700";
      case "platinum":
        return "#E5E4E2";
      default:
        return "#6A7A90";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.badgeCard,
        earned ? styles.earnedCard : styles.unearnedCard,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.badgeHeader}>
        <Text style={styles.badgeIcon}>{badge.icon}</Text>
        <View style={styles.badgeInfo}>
          <Text style={[styles.badgeName, !earned && styles.unearnedText]}>
            {badge.name}
          </Text>
          <Text
            style={[
              styles.badgeRarity,
              { color: getRarityColor(badge.rarity) },
            ]}
          >
            {badge.rarity_name} • {badge.points} pts
          </Text>
        </View>
      </View>

      <Text style={[styles.badgeDescription, !earned && styles.unearnedText]}>
        {badge.description}
      </Text>

      {earned && earnedAt && (
        <Text style={styles.earnedDate}>Earned {formatDate(earnedAt)}</Text>
      )}

      {!earned && progress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress.percentage, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.current}/{progress.required} (
            {Math.round(progress.percentage)}%)
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badgeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  earnedCard: {
    borderColor: "#4CAF50",
    backgroundColor: "#F8FFF8",
  },
  unearnedCard: {
    borderColor: "#E0E0E0",
    opacity: 0.8,
  },
  badgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  badgeRarity: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  badgeDescription: {
    fontSize: 14,
    color: "#6A7A90",
    lineHeight: 20,
    marginBottom: 8,
  },
  unearnedText: {
    color: "#A0A0A0",
  },
  earnedDate: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    fontStyle: "italic",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6A7A90",
    textAlign: "right",
  },
});
