import type { CalorieEntry, WeeklySummary, UserSettings, DailyData } from './types'
import { getCurrentWeekRange, getDaysElapsed, getRemainingDays, getWeekDays, formatDate, parseDate, isDateInWeek } from './dateUtils'

export function calculateWeeklySummary(
  entries: CalorieEntry[],
  settings: UserSettings
): WeeklySummary {
  const today = new Date()
  const { start: weekStart, end: weekEnd } = getCurrentWeekRange(settings.week_start_day)

  // Filter entries for current week
  const weekEntries = entries.filter(entry => {
    const entryDate = parseDate(entry.entry_date)
    return isDateInWeek(entryDate, weekStart, weekEnd)
  })

  // Calculate totals
  const totalConsumed = weekEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const weeklyTarget = settings.weekly_calorie_target
  const remaining = weeklyTarget - totalConsumed

  // Check if today has been logged
  const todayString = formatDate(today)
  const todayIsLogged = weekEntries.some(entry => entry.entry_date === todayString)

  // Calculate days
  const daysElapsed = getDaysElapsed(weekStart, today)
  const daysLogged = weekEntries.length
  let remainingDays = getRemainingDays(today, weekEnd)

  // If today is logged, exclude it from remaining days (it's done!)
  if (todayIsLogged) {
    remainingDays = Math.max(1, remainingDays - 1)
  }

  // Calculate averages
  const averagePerDay = daysLogged > 0 ? Math.round(totalConsumed / daysLogged) : 0
  const remainingPerDay = remainingDays > 0 ? Math.round(remaining / remainingDays) : 0

  // Calculate bank balance
  const dailyTarget = weeklyTarget / 7
  // If today is logged, count it as a completed day. Otherwise exclude it.
  const completedDays = todayIsLogged ? daysElapsed : Math.max(0, daysElapsed - 1)
  const expectedSoFar = dailyTarget * completedDays
  const banked = expectedSoFar - totalConsumed
  const isOverBudget = banked < 0

  return {
    weekStart,
    weekEnd,
    totalConsumed,
    weeklyTarget,
    remaining,
    daysElapsed,
    daysLogged,
    averagePerDay,
    remainingPerDay,
    banked: Math.abs(Math.round(banked)),
    isOverBudget,
  }
}

export function getDailyDataForWeek(
  entries: CalorieEntry[],
  settings: UserSettings
): DailyData[] {
  const { start: weekStart, end: weekEnd } = getCurrentWeekRange(settings.week_start_day)
  const weekDays = getWeekDays(weekStart, weekEnd)
  const dailyTarget = settings.weekly_calorie_target / 7

  return weekDays.map(date => {
    const dateString = formatDate(date)
    const entry = entries.find(e => e.entry_date === dateString)

    return {
      date,
      calories: entry ? entry.calories : 0,
      target: dailyTarget,
      isLogged: !!entry,
    }
  })
}

export function calculateStreak(entries: CalorieEntry[]): number {
  if (entries.length === 0) return 0

  // Sort entries by date descending
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const mostRecentDate = parseDate(sortedEntries[0].entry_date)
  mostRecentDate.setHours(0, 0, 0, 0)

  // Check if most recent entry is today or yesterday
  const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff > 1) return 0

  let streak = 1
  let currentDate = mostRecentDate

  for (let i = 1; i < sortedEntries.length; i++) {
    const entryDate = parseDate(sortedEntries[i].entry_date)
    entryDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(currentDate)
    expectedDate.setDate(expectedDate.getDate() - 1)

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++
      currentDate = entryDate
    } else {
      break
    }
  }

  return streak
}

export function formatCalories(calories: number): string {
  return new Intl.NumberFormat('en-US').format(calories)
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 100) return '🏆'
  if (streak >= 60) return '⚡'
  if (streak >= 30) return '👑'
  if (streak >= 14) return '💪'
  if (streak >= 7) return '🔥'
  if (streak >= 3) return '⭐'
  return '🌟'
}

export function getBankStatusColor(banked: number, isOverBudget: boolean): string {
  if (isOverBudget) {
    if (banked > 2000) return 'text-red-600'
    if (banked > 1000) return 'text-orange-600'
    return 'text-yellow-600'
  }

  if (banked > 2000) return 'text-emerald-600'
  if (banked > 1000) return 'text-green-600'
  return 'text-primary-600'
}

export function getProgressBarColor(percentage: number): string {
  if (percentage > 100) return 'bg-red-500'
  if (percentage > 90) return 'bg-orange-500'
  if (percentage > 75) return 'bg-yellow-500'
  return 'bg-gradient-to-r from-primary-500 to-primary-600'
}

export function getDailyBarColor(calories: number, target: number): string {
  if (calories === 0) return 'bg-gray-300'

  const percentage = (calories / target) * 100
  const deviation = Math.abs(percentage - 100)

  // Green: within 10% of target
  if (deviation <= 10) return 'bg-green-500'
  // Yellow: within 20% of target
  if (deviation <= 20) return 'bg-yellow-500'
  // Orange: within 30% of target
  if (deviation <= 30) return 'bg-orange-500'
  // Red: 40%+ away from target
  return 'bg-red-500'
}
