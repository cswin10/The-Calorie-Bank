'use client'

import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns'
import { formatCalories } from '@/lib/calculations'
import type { CalorieEntry, UserSettings } from '@/lib/types'

interface CalendarViewProps {
  entries: CalorieEntry[]
  settings: UserSettings
}

export default function CalendarView({ entries, settings }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const dailyTarget = settings.weekly_calorie_target / 7

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEntryForDate = (date: Date): CalorieEntry | undefined => {
    const dateString = format(date, 'yyyy-MM-dd')
    return entries.find(entry => entry.entry_date === dateString)
  }

  const getDayColor = (date: Date): string => {
    const entry = getEntryForDate(date)
    if (!entry) return 'bg-gray-100 text-gray-400'

    const calories = entry.calories
    const deviation = Math.abs((calories / dailyTarget) * 100 - 100)

    if (deviation <= 10) return 'bg-green-500 text-white'
    if (deviation <= 20) return 'bg-yellow-500 text-gray-900'
    if (deviation <= 30) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }

  const getDayEmoji = (date: Date): string => {
    const entry = getEntryForDate(date)
    if (!entry) return ''

    const calories = entry.calories
    const deviation = Math.abs((calories / dailyTarget) * 100 - 100)

    if (deviation <= 10) return '✅'
    if (deviation <= 20) return '😊'
    if (deviation <= 30) return '😅'
    return '😓'
  }

  const getMonthStats = () => {
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.entry_date)
      return isSameMonth(entryDate, currentMonth)
    })

    const totalCalories = monthEntries.reduce((sum, entry) => sum + entry.calories, 0)
    const avgPerDay = monthEntries.length > 0 ? totalCalories / monthEntries.length : 0
    const daysLogged = monthEntries.length
    const daysOnTarget = monthEntries.filter(entry => {
      const deviation = Math.abs((entry.calories / dailyTarget) * 100 - 100)
      return deviation <= 10
    }).length

    return { totalCalories, avgPerDay, daysLogged, daysOnTarget }
  }

  const stats = getMonthStats()

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const today = () => setCurrentMonth(new Date())

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <p className="text-sm text-gray-600">Your tracking history</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700 transition-colors"
          >
            ←
          </button>
          <button
            onClick={today}
            className="px-4 py-2 rounded-lg bg-primary-100 hover:bg-primary-200 font-semibold text-primary-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-primary-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Days Logged</div>
          <div className="text-2xl font-bold text-gray-800">{stats.daysLogged}</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">On Target</div>
          <div className="text-2xl font-bold text-green-700">{stats.daysOnTarget}</div>
        </div>
        <div className="p-3 bg-secondary-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Avg Per Day</div>
          <div className="text-xl font-bold text-gray-800">{formatCalories(Math.round(stats.avgPerDay))}</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Total</div>
          <div className="text-xl font-bold text-gray-800">{formatCalories(stats.totalCalories)}</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => {
            const entry = getEntryForDate(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isCurrentDay = isToday(day)
            const color = getDayColor(day)
            const emoji = getDayEmoji(day)

            return (
              <div
                key={index}
                className={`
                  aspect-square p-2 rounded-lg transition-all
                  ${color}
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isCurrentDay ? 'ring-2 ring-primary-600 ring-offset-2' : ''}
                  ${entry ? 'cursor-pointer hover:scale-105' : ''}
                `}
                title={entry ? `${formatCalories(entry.calories)} calories` : 'No entry'}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className={`text-sm font-semibold mb-0.5 ${!entry ? 'text-gray-400' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  {entry && (
                    <>
                      <div className="text-xs opacity-90">
                        {formatCalories(entry.calories)}
                      </div>
                      <div className="text-sm mt-0.5">
                        {emoji}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-600 mb-3">LEGEND</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-gray-600">±10% Perfect ✅</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-gray-600">±20% Good 😊</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-gray-600">±30% Fair 😅</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-gray-600">±40%+ Off 😓</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
            <span className="text-gray-600">Not logged</span>
          </div>
        </div>
      </div>
    </div>
  )
}
