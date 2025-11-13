'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateWeeklySummary, getDailyDataForWeek, calculateStreak } from '@/lib/calculations'
import type { CalorieEntry, UserSettings, UserStats, Achievement, UserAchievement } from '@/lib/types'
import Navbar from '@/components/Navbar'
import DashboardNav from '@/components/DashboardNav'
import WeeklySummaryCard from '@/components/WeeklySummaryCard'
import WeeklyBarChart from '@/components/WeeklyBarChart'
import TodaysMeals from '@/components/TodaysMeals'
import WeeklyForecast from '@/components/WeeklyForecast'
import MealPresetsManager from '@/components/MealPresetsManager'
import CalendarView from '@/components/CalendarView'
import CalorieEntryForm from '@/components/CalorieEntryForm'
import RecentEntriesTable from '@/components/RecentEntriesTable'
import StatsCard from '@/components/StatsCard'
import AchievementsCard from '@/components/AchievementsCard'

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [entries, setEntries] = useState<CalorieEntry[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  const supabase = createClient()

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // Fetch user settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settingsData) {
        setSettings(settingsData)
      }

      // Fetch calorie entries
      const { data: entriesData } = await supabase
        .from('calorie_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })

      if (entriesData) {
        setEntries(entriesData)
      }

      // Fetch user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsData) {
        setStats(statsData)
      }

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true })

      if (achievementsData) {
        setAchievements(achievementsData)
      }

      // Fetch user achievements
      const { data: userAchievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)

      if (userAchievementsData) {
        setUserAchievements(userAchievementsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const yOffset = -80 // Offset for navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🏦</div>
            <p className="text-xl text-gray-600">Loading your calorie bank...</p>
          </div>
        </div>
      </>
    )
  }

  if (!settings || !stats || !userId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Setting up your account...</p>
          </div>
        </div>
      </>
    )
  }

  const weeklySummary = calculateWeeklySummary(entries, settings)
  const dailyData = getDailyDataForWeek(entries, settings)
  const currentStreak = calculateStreak(entries)
  const dailyTarget = settings.weekly_calorie_target / 7

  return (
    <>
      <Navbar />
      <DashboardNav onNavigate={scrollToSection} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to Your Calorie Bank! 🏦
          </h1>
          <p className="text-lg text-gray-600">
            Track your weekly calorie budget and build healthy habits
          </p>
        </div>

        <div className="space-y-8">
          {/* Weekly Summary */}
          <div id="summary" className="scroll-mt-24 animate-slide-up">
            <WeeklySummaryCard summary={weeklySummary} />
          </div>

          {/* Stats Card */}
          <div id="stats" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatsCard stats={stats} currentStreak={currentStreak} />
          </div>

          {/* Today's Meals */}
          <div id="meals" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <TodaysMeals
              userId={userId}
              dailyTarget={dailyTarget}
              onMealsUpdated={fetchData}
            />
          </div>

          {/* Weekly Forecast */}
          <div id="forecast" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <WeeklyForecast summary={weeklySummary} />
          </div>

          {/* Weekly Bar Chart */}
          <div id="chart" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <WeeklyBarChart dailyData={dailyData} />
          </div>

          {/* View Toggles */}
          <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                showCalendar
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📅 {showCalendar ? 'Hide' : 'View'} Calendar
            </button>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                showPresets
                  ? 'bg-secondary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚡ {showPresets ? 'Hide' : 'Manage'} Presets
            </button>
          </div>

          {/* Calendar View */}
          {showCalendar && (
            <div id="calendar" className="scroll-mt-24 animate-slide-up">
              <CalendarView entries={entries} settings={settings} />
            </div>
          )}

          {/* Meal Presets Manager */}
          {showPresets && (
            <div id="presets" className="scroll-mt-24 animate-slide-up">
              <MealPresetsManager userId={userId} />
            </div>
          )}

          {/* Fallback: Simple Calorie Entry (for manual daily totals) */}
          <details className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <summary className="cursor-pointer p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-gray-700">
              📝 Quick Daily Total (No Meal Breakdown)
            </summary>
            <div className="mt-4">
              <CalorieEntryForm userId={userId} onEntryAdded={fetchData} />
            </div>
          </details>

          {/* Achievements */}
          <div id="achievements" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <AchievementsCard
              achievements={achievements}
              userAchievements={userAchievements}
            />
          </div>

          {/* Recent Entries */}
          <div id="history" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <RecentEntriesTable entries={entries} />
          </div>
        </div>
      </main>
    </>
  )
}
