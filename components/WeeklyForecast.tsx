'use client'

import { formatCalories } from '@/lib/calculations'
import type { WeeklySummary } from '@/lib/types'

interface WeeklyForecastProps {
  summary: WeeklySummary
}

export default function WeeklyForecast({ summary }: WeeklyForecastProps) {
  const {
    weeklyTarget,
    totalConsumed,
    remaining,
    daysElapsed,
    daysLogged,
    averagePerDay,
    remainingPerDay,
    banked,
    isOverBudget,
  } = summary

  // Calculate days left in week (excluding today if already logged)
  const totalDaysInWeek = 7
  const daysLeft = totalDaysInWeek - daysElapsed

  // Forecast scenarios
  const averageDailyActual = daysLogged > 0 ? totalConsumed / daysLogged : 0

  // Scenario 1: Continue current pace
  const projectedAtCurrentPace = totalConsumed + (averageDailyActual * daysLeft)
  const outcomeAtCurrentPace = weeklyTarget - projectedAtCurrentPace

  // Scenario 2: Hit daily target for remaining days
  const dailyTarget = weeklyTarget / 7
  const projectedAtTargetPace = totalConsumed + (dailyTarget * daysLeft)
  const outcomeAtTargetPace = weeklyTarget - projectedAtTargetPace

  // Scenario 3: What you can eat per day to hit target
  const neededPerDay = daysLeft > 0 ? remaining / daysLeft : remaining

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🔮</span>
        Weekly Forecast
      </h3>

      <div className="space-y-4">
        {/* Current Status */}
        <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-600">CURRENT PROGRESS</div>
            <div className="text-xs text-gray-500">{daysElapsed} of 7 days</div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-bold text-gray-800">
              {formatCalories(totalConsumed)}
            </div>
            <div className="text-sm text-gray-600">of {formatCalories(weeklyTarget)}</div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-600">Your average: </span>
            <span className="font-bold text-gray-800">{formatCalories(averagePerDay)}/day</span>
          </div>
        </div>

        {/* Forecast Scenarios */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-3">WHAT IF...</h4>

          <div className="space-y-3">
            {/* Scenario 1: Current Pace */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-1">
                <div className="text-sm font-semibold text-gray-700">
                  You continue at your current pace?
                </div>
                <div className={`text-lg font-bold ${outcomeAtCurrentPace >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {outcomeAtCurrentPace >= 0 ? '+' : ''}{formatCalories(Math.round(outcomeAtCurrentPace))}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {formatCalories(Math.round(averageDailyActual))}/day for {daysLeft} more days = {formatCalories(Math.round(projectedAtCurrentPace))} total
              </div>
              <div className="mt-2 text-xs">
                {outcomeAtCurrentPace >= 0 ? (
                  <span className="text-green-700">✅ You'll finish under budget!</span>
                ) : (
                  <span className="text-red-700">⚠️ You'll be over budget</span>
                )}
              </div>
            </div>

            {/* Scenario 2: Target Pace */}
            {daysLeft > 0 && (
              <div className="p-3 bg-primary-50 rounded-lg border-2 border-primary-200">
                <div className="flex items-start justify-between mb-1">
                  <div className="text-sm font-semibold text-gray-700">
                    You eat {formatCalories(Math.round(dailyTarget))}/day?
                  </div>
                  <div className={`text-lg font-bold ${outcomeAtTargetPace >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {outcomeAtTargetPace >= 0 ? '+' : ''}{formatCalories(Math.round(outcomeAtTargetPace))}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Daily target for {daysLeft} more days = {formatCalories(Math.round(projectedAtTargetPace))} total
                </div>
                <div className="mt-2 text-xs text-primary-700">
                  💡 Stick to your daily target to finish balanced
                </div>
              </div>
            )}

            {/* Scenario 3: How to Hit Target Exactly */}
            {daysLeft > 0 && (
              <div className="p-3 bg-secondary-50 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  To hit your target exactly:
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {formatCalories(Math.round(neededPerDay))}<span className="text-sm text-gray-600">/day</span>
                </div>
                <div className="text-xs text-gray-600">
                  For the next {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                </div>
                {neededPerDay < 0 ? (
                  <div className="mt-2 text-xs text-red-700">
                    ⚠️ You're already over budget. Consider this a learning week!
                  </div>
                ) : neededPerDay < dailyTarget * 0.7 ? (
                  <div className="mt-2 text-xs text-green-700">
                    🎉 You've got room to enjoy! You're ahead of pace
                  </div>
                ) : neededPerDay > dailyTarget * 1.3 ? (
                  <div className="mt-2 text-xs text-orange-700">
                    💪 Challenge mode! You'll need to go below target
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-700">
                    ✨ Right on track for a balanced week
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bank Status */}
        {!isOverBudget && banked > 500 && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-2xl">💰</span>
              <span className="text-sm font-semibold text-green-800">BONUS SAVINGS</span>
            </div>
            <div className="text-lg text-green-700">
              You've banked <span className="font-bold">{formatCalories(banked)}</span> so far!
            </div>
            <div className="text-xs text-green-600 mt-1">
              Perfect for a special meal or weekend treat 🎉
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
