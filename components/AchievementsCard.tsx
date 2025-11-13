'use client'

import { useState } from 'react'
import type { Achievement, UserAchievement } from '@/lib/types'

interface AchievementsCardProps {
  achievements: Achievement[]
  userAchievements: UserAchievement[]
}

export default function AchievementsCard({ achievements, userAchievements }: AchievementsCardProps) {
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all')

  const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id))
  const earnedAchievements = achievements.filter(a => earnedIds.has(a.id))
  const lockedAchievements = achievements.filter(a => !earnedIds.has(a.id))

  const displayedAchievements =
    filter === 'earned'
      ? earnedAchievements
      : filter === 'locked'
      ? lockedAchievements
      : achievements

  const totalPoints = userAchievements.reduce((sum, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievement_id)
    return sum + (achievement?.points || 0)
  }, 0)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Achievements</h3>
          <p className="text-sm text-gray-600">
            {earnedAchievements.length} of {achievements.length} unlocked • {totalPoints} points earned
          </p>
        </div>
        <div className="text-4xl">🏆</div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({achievements.length})
        </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'earned'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Earned ({earnedAchievements.length})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'locked'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Locked ({lockedAchievements.length})
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {displayedAchievements.map((achievement) => {
          const isEarned = earnedIds.has(achievement.id)

          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isEarned
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-3xl">{isEarned ? achievement.icon : '🔒'}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{achievement.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs font-semibold text-purple-600">
                      +{achievement.points} pts
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-700">
                      {achievement.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {displayedAchievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No achievements in this category yet.</p>
        </div>
      )}
    </div>
  )
}
