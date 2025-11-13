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

          {/* Today's Meals & Quick Daily Total - Side by Side */}
          <div id="meals" className="scroll-mt-24 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Meal-by-Meal Tracking */}
              <TodaysMeals
                userId={userId}
                dailyTarget={dailyTarget}
                onMealsUpdated={fetchData}
              />

              {/* Quick Daily Total */}
              <div className="card">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Quick Daily Total</h3>
                  <p className="text-sm text-gray-600">Log total calories without meal breakdown</p>
                </div>
                <CalorieEntryForm userId={userId} onEntryAdded={fetchData} />
              </div>
            </div>
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
