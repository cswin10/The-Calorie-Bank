import { getDayName, isToday, isPastDate } from '@/lib/dateUtils'
import { formatCalories } from '@/lib/calculations'
import type { DailyData } from '@/lib/types'

interface WeeklyBarChartProps {
  dailyData: DailyData[]
}

export default function WeeklyBarChart({ dailyData }: WeeklyBarChartProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Weekly Overview</h3>

      <div className="grid grid-cols-7 gap-2">
        {dailyData.map((day, index) => {
          const percentage = Math.min((day.calories / day.target) * 100, 150)
          const isCurrentDay = isToday(day.date)
          const isPast = isPastDate(day.date)

          let barColor = 'bg-gray-300'
          if (day.isLogged) {
            if (percentage > 100) {
              barColor = 'bg-gradient-to-t from-red-500 to-red-400'
            } else if (percentage > 90) {
              barColor = 'bg-gradient-to-t from-orange-500 to-orange-400'
            } else if (percentage > 75) {
              barColor = 'bg-gradient-to-t from-yellow-500 to-yellow-400'
            } else {
              barColor = 'bg-gradient-to-t from-primary-500 to-primary-400'
            }
          } else if (!isPast && !isCurrentDay) {
            barColor = 'bg-gray-200'
          }

          return (
            <div
              key={index}
              className={`flex flex-col items-center ${
                isCurrentDay ? 'ring-2 ring-primary-400 rounded-lg p-1' : ''
              }`}
            >
              {/* Day Label */}
              <div className="text-xs font-semibold text-gray-600 mb-2">
                {getDayName(day.date)}
              </div>

              {/* Bar Container */}
              <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                {/* Target Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-400 z-10" />

                {/* Bar */}
                <div
                  className={`absolute bottom-0 left-0 right-0 ${barColor} transition-all duration-500 ease-out rounded-t-sm`}
                  style={{ height: `${percentage}%` }}
                />

                {/* Today Indicator */}
                {isCurrentDay && (
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                    <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold">
                      Today
                    </span>
                  </div>
                )}
              </div>

              {/* Calories Display */}
              <div className="text-xs text-center mt-2">
                {day.isLogged ? (
                  <span className="font-bold text-gray-700">
                    {formatCalories(day.calories)}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>

              {/* Status Emoji */}
              <div className="text-lg mt-1">
                {day.isLogged ? (
                  percentage > 100 ? (
                    '😓'
                  ) : percentage > 90 ? (
                    '😅'
                  ) : (
                    '✅'
                  )
                ) : isPast ? (
                  '⭕'
                ) : (
                  '⚪'
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-t from-primary-500 to-primary-400" />
            <span className="text-gray-600">On Target</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-t from-yellow-500 to-yellow-400" />
            <span className="text-gray-600">75-90%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-t from-orange-500 to-orange-400" />
            <span className="text-gray-600">90-100%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-t from-red-500 to-red-400" />
            <span className="text-gray-600">Over Target</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gray-300" />
            <span className="text-gray-600">Not Logged</span>
          </div>
        </div>
      </div>
    </div>
  )
}
