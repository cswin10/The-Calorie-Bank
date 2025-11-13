import { startOfWeek, endOfWeek, format, differenceInDays, addDays, parseISO, isWithinInterval, eachDayOfInterval } from 'date-fns'
import type { WeekStartDay } from './types'

export function getWeekStart(date: Date, weekStartDay: WeekStartDay): Date {
  const dayOfWeek = weekStartDay === 'monday' ? 1 : 0
  return startOfWeek(date, { weekStartsOn: dayOfWeek })
}

export function getWeekEnd(date: Date, weekStartDay: WeekStartDay): Date {
  const dayOfWeek = weekStartDay === 'monday' ? 1 : 0
  return endOfWeek(date, { weekStartsOn: dayOfWeek })
}

export function getCurrentWeekRange(weekStartDay: WeekStartDay): { start: Date; end: Date } {
  const today = new Date()
  const start = getWeekStart(today, weekStartDay)
  const end = getWeekEnd(today, weekStartDay)
  return { start, end }
}

export function formatWeekRange(start: Date, end: Date): string {
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
}

export function getDaysElapsed(weekStart: Date, today: Date = new Date()): number {
  return differenceInDays(today, weekStart) + 1
}

export function getRemainingDays(today: Date, weekEnd: Date): number {
  const remaining = differenceInDays(weekEnd, today) + 1 // +1 to include today
  return Math.max(1, remaining)
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseDate(dateString: string): Date {
  return parseISO(dateString)
}

export function isDateInWeek(date: Date, weekStart: Date, weekEnd: Date): boolean {
  return isWithinInterval(date, { start: weekStart, end: weekEnd })
}

export function getWeekDays(weekStart: Date, weekEnd: Date): Date[] {
  return eachDayOfInterval({ start: weekStart, end: weekEnd })
}

export function getDayName(date: Date): string {
  return format(date, 'EEE')
}

export function getShortDate(date: Date): string {
  return format(date, 'MMM d')
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
}

export function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate < today
}

export function getLevel(totalPoints: number): number {
  // Level progression: 100 points per level
  return Math.floor(totalPoints / 100) + 1
}

export function getPointsForNextLevel(totalPoints: number): number {
  const currentLevel = getLevel(totalPoints)
  const pointsForNextLevel = currentLevel * 100
  return pointsForNextLevel - totalPoints
}

export function getLevelProgress(totalPoints: number): number {
  const currentLevelPoints = (getLevel(totalPoints) - 1) * 100
  const pointsInCurrentLevel = totalPoints - currentLevelPoints
  return (pointsInCurrentLevel / 100) * 100
}
