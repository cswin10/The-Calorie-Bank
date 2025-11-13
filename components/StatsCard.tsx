import { getStreakEmoji, formatCalories } from '@/lib/calculations'
import { getLevel, getPointsForNextLevel, getLevelProgress } from '@/lib/dateUtils'
import type { UserStats } from '@/lib/types'

interface StatsCardProps {
  stats: UserStats
  currentStreak: number
}

export default function StatsCard({ stats, currentStreak }: StatsCardProps) {
  const level = getLevel(stats.total_points)
  const pointsForNext = getPointsForNextLevel(stats.total_points)
  const levelProgress = getLevelProgress(stats.total_points)

  return (
    <div className="card bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Your Progress</h3>
          <p className="text-sm text-gray-600">Keep up the great work!</p>
        </div>
        <div className="text-5xl animate-bounce-slow">
          {getStreakEmoji(currentStreak)}
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6 p-4 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-purple-700">Level {level}</span>
          <span className="text-sm text-gray-600">{pointsForNext} points to next level</span>
        </div>
        <div className="progress-bar">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <div className="mt-2 text-center">
          <span className="text-2xl font-bold text-purple-600">{stats.total_points}</span>
          <span className="text-sm text-gray-600 ml-1">total points</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">⚡</div>
          <div className="text-2xl font-bold text-blue-600">{stats.longest_streak}</div>
          <div className="text-xs text-gray-600">Best Streak</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">📝</div>
          <div className="text-2xl font-bold text-green-600">{stats.total_entries}</div>
          <div className="text-xs text-gray-600">Total Logs</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-purple-600">{stats.weeks_on_target}</div>
          <div className="text-xs text-gray-600">Weeks On Target</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">📈</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.consecutive_weeks_on_target}</div>
          <div className="text-xs text-gray-600">Consecutive Weeks</div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl mb-1">💰</div>
          <div className="text-xl font-bold text-emerald-600">
            {formatCalories(stats.total_calories_banked)}
          </div>
          <div className="text-xs text-gray-600">Total Banked</div>
        </div>
      </div>
    </div>
  )
}
