import { formatCalories, getBankStatusColor } from '@/lib/calculations'
import { formatWeekRange } from '@/lib/dateUtils'
import type { WeeklySummary } from '@/lib/types'

interface WeeklySummaryCardProps {
  summary: WeeklySummary
}

export default function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  const {
    weekStart,
    weekEnd,
    totalConsumed,
    weeklyTarget,
    remaining,
    daysElapsed,
    daysLogged,
    averagePerDay,
    remainingPerDay,
    banked,
    isOverBudget,
  } = summary

  const progressPercentage = (totalConsumed / weeklyTarget) * 100
  const bankStatusColor = getBankStatusColor(banked, isOverBudget)

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {formatWeekRange(weekStart, weekEnd)}
          </h2>
          <span className="badge badge-success">Day {daysElapsed} of 7</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Weekly Progress</span>
            <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                progressPercentage > 100 ? 'bg-red-500' : ''
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Consumed</p>
            <p className="text-3xl font-bold text-primary-700">
              {formatCalories(totalConsumed)}
            </p>
            <p className="text-xs text-gray-500 mt-1">of {formatCalories(weeklyTarget)}</p>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-3xl font-bold text-secondary-700">
              {formatCalories(remaining)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {remainingPerDay > 0 ? `${formatCalories(remainingPerDay)}/day` : 'Over budget'}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Balance Card */}
      <div className={`card ${isOverBudget ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Calorie Bank</p>
            <p className={`text-4xl font-bold ${bankStatusColor}`}>
              {isOverBudget ? '-' : '+'}{formatCalories(banked)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {isOverBudget ? (
                <span className="text-red-600 font-medium">
                  ⚠️ Over budget by {formatCalories(banked)}
                </span>
              ) : (
                <span className="text-green-600 font-medium">
                  ✅ Banked {formatCalories(banked)} calories
                </span>
              )}
            </p>
          </div>
          <div className="text-6xl opacity-20">
            {isOverBudget ? '📉' : '🏦'}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-accent-50 to-accent-100">
          <p className="text-sm text-gray-600 mb-1">Days Logged</p>
          <p className="text-2xl font-bold text-accent-700">{daysLogged}</p>
        </div>

        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <p className="text-sm text-gray-600 mb-1">Avg/Day</p>
          <p className="text-2xl font-bold text-primary-700">
            {averagePerDay > 0 ? formatCalories(averagePerDay) : '-'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100">
          <p className="text-sm text-gray-600 mb-1">Per Day Left</p>
          <p className="text-2xl font-bold text-secondary-700">
            {remainingPerDay > 0 ? formatCalories(remainingPerDay) : '-'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-gray-600 mb-1">Daily Target</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatCalories(Math.round(weeklyTarget / 7))}
          </p>
        </div>
      </div>
    </div>
  )
}
