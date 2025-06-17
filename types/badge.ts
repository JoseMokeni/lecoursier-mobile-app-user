export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  category_name: string;
  criteria: Record<string, any>;
  points: number;
  rarity: string;
  rarity_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  current: number;
  required: number;
  percentage: number;
  requirement_type?: string;
}

export interface BadgeWithProgress {
  badge: Badge;
  earned: boolean;
  earned_at: string | null;
  progress: Progress | null;
}

export interface EarnedBadge {
  badge: Badge;
  earned_at: string;
  progress: Progress;
}

export interface BadgesResponse {
  data: BadgeWithProgress[];
  meta: {
    total_badges: number;
    earned_badges: number;
  };
}

export interface EarnedBadgesResponse {
  data: EarnedBadge[];
  meta: {
    total_earned: number;
  };
}
