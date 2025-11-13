'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateWeeklySummary, getDailyDataForWeek, calculateStreak } from '@/lib/calculations'
import type { CalorieEntry, UserSettings, UserStats, Achievement, UserAchievement } from '@/lib/types'
import Navbar from '@/components/Navbar'
import WeeklySummaryCard from '@/components/WeeklySummaryCard'
import WeeklyBarChart from '@/components/WeeklyBarChart'
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

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="animate-slide-up">
            <WeeklySummaryCard summary={weeklySummary} />
          </div>

          {/* Stats Card */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatsCard stats={stats} currentStreak={currentStreak} />
          </div>

          {/* Weekly Bar Chart */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <WeeklyBarChart dailyData={dailyData} />
          </div>

          {/* Calorie Entry Form */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CalorieEntryForm userId={userId} onEntryAdded={fetchData} />
          </div>

          {/* Achievements */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <AchievementsCard
              achievements={achievements}
              userAchievements={userAchievements}
            />
          </div>

          {/* Recent Entries */}
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <RecentEntriesTable entries={entries} />
          </div>
        </div>
      </main>
    </>
  )
}
