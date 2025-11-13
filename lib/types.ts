export type WeekStartDay = 'monday' | 'sunday'
export type TimeOfDay = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'

export interface UserSettings {
  id: string
  user_id: string
  weekly_calorie_target: number
  week_start_day: WeekStartDay
  created_at: string
  updated_at: string
}

export interface CalorieEntry {
  id: string
  user_id: string
  entry_date: string
  calories: number
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string
  user_id: string
  entry_date: string
  meal_name: string
  calories: number
  time_of_day: TimeOfDay | null
  logged_at: string
  created_at: string
  updated_at: string
}

export interface MealPreset {
  id: string
  user_id: string
  name: string
  calories: number
  time_of_day: TimeOfDay | null
  is_favorite: boolean
  use_count: number
  created_at: string
  updated_at: string
}

export type AchievementCategory = 'streak' | 'milestone' | 'target' | 'consistency' | 'special'
export type RequirementType = 'streak_days' | 'total_entries' | 'weeks_on_target' | 'consecutive_weeks' | 'calories_saved'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  requirement_type: RequirementType
  requirement_value: number
  points: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  seen: boolean
  achievement?: Achievement
}

export interface UserStats {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_entries: number
  total_points: number
  weeks_on_target: number
  consecutive_weeks_on_target: number
  total_calories_banked: number
  level: number
  updated_at: string
}

export interface WeeklySummary {
  weekStart: Date
  weekEnd: Date
  totalConsumed: number
  weeklyTarget: number
  remaining: number
  daysElapsed: number
  daysLogged: number
  averagePerDay: number
  remainingPerDay: number
  banked: number
  isOverBudget: boolean
}

export interface DailyData {
  date: Date
  calories: number
  target: number
  isLogged: boolean
}
