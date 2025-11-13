'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCalories } from '@/lib/calculations'
import { formatDate } from '@/lib/dateUtils'
import type { Meal, MealPreset, TimeOfDay } from '@/lib/types'

interface TodaysMealsProps {
  userId: string
  dailyTarget: number
  onMealsUpdated: () => void
}

export default function TodaysMeals({ userId, dailyTarget, onMealsUpdated }: TodaysMealsProps) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [presets, setPresets] = useState<MealPreset[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [mealName, setMealName] = useState('')
  const [calories, setCalories] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('other')
  const [loading, setLoading] = useState(false)
  const [loadingMeals, setLoadingMeals] = useState(true)
  const supabase = createClient()

  const today = formatDate(new Date())
  const totalToday = meals.reduce((sum, meal) => sum + meal.calories, 0)
  const remaining = dailyTarget - totalToday
  const percentage = (totalToday / dailyTarget) * 100

  useEffect(() => {
    fetchTodaysMeals()
    fetchPresets()
  }, [])

  const fetchTodaysMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', today)
        .order('logged_at', { ascending: false })

      if (error) throw error
      setMeals(data || [])
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setLoadingMeals(false)
    }
  }

  const fetchPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_presets')
        .select('*')
        .eq('user_id', userId)
        .order('is_favorite', { ascending: false })
        .order('use_count', { ascending: false })

      if (error) throw error
      setPresets(data || [])
    } catch (error) {
      console.error('Error fetching presets:', error)
    }
  }

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const calorieValue = parseInt(calories)
      if (isNaN(calorieValue) || calorieValue < 0) {
        throw new Error('Please enter a valid calorie amount')
      }

      const { error } = await supabase
        .from('meals')
        .insert({
          user_id: userId,
          entry_date: today,
          meal_name: mealName,
          calories: calorieValue,
          time_of_day: timeOfDay,
        })

      if (error) throw error

      setMealName('')
      setCalories('')
      setTimeOfDay('other')
      setShowAddForm(false)
      fetchTodaysMeals()
      onMealsUpdated()
    } catch (error: any) {
      alert(error.message || 'Failed to add meal')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPreset = async (preset: MealPreset) => {
    setLoading(true)

    try {
      // Add meal from preset
      const { error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: userId,
          entry_date: today,
          meal_name: preset.name,
          calories: preset.calories,
          time_of_day: preset.time_of_day,
        })

      if (mealError) throw mealError

      // Increment use count
      await supabase
        .from('meal_presets')
        .update({ use_count: preset.use_count + 1 })
        .eq('id', preset.id)

      fetchTodaysMeals()
      fetchPresets()
      onMealsUpdated()
    } catch (error: any) {
      alert(error.message || 'Failed to add meal from preset')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Delete this meal?')) return

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)

      if (error) throw error

      fetchTodaysMeals()
      onMealsUpdated()
    } catch (error: any) {
      alert(error.message || 'Failed to delete meal')
    }
  }

  const getTimeOfDayIcon = (time: TimeOfDay | null) => {
    switch (time) {
      case 'breakfast': return '🌅'
      case 'lunch': return '☀️'
      case 'dinner': return '🌙'
      case 'snack': return '🍎'
      default: return '🍽️'
    }
  }

  const getTimeOfDayLabel = (time: TimeOfDay | null) => {
    if (!time) return 'Other'
    return time.charAt(0).toUpperCase() + time.slice(1)
  }

  if (loadingMeals) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-2 animate-bounce">🍽️</div>
          <p className="text-gray-600">Loading today's meals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Today's Meals</h3>
          <p className="text-sm text-gray-600">Track what you eat throughout the day</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">
            {formatCalories(totalToday)}
          </div>
          <div className="text-xs text-gray-600">
            of {formatCalories(dailyTarget)} target
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="progress-bar">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 100
                ? 'bg-red-500'
                : percentage > 90
                ? 'bg-orange-500'
                : 'bg-gradient-to-r from-primary-500 to-primary-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={remaining >= 0 ? 'text-primary-600 font-semibold' : 'text-red-600 font-semibold'}>
            {remaining >= 0 ? `${formatCalories(remaining)} remaining` : `${formatCalories(Math.abs(remaining))} over`}
          </span>
          <span className="text-gray-500">{Math.round(percentage)}%</span>
        </div>
      </div>

      {/* Meal List */}
      {meals.length > 0 && (
        <div className="space-y-2 mb-4">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-2xl">{getTimeOfDayIcon(meal.time_of_day)}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{meal.meal_name}</div>
                  <div className="text-xs text-gray-500">
                    {getTimeOfDayLabel(meal.time_of_day)} • {new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-lg font-bold text-gray-700">
                  {formatCalories(meal.calories)}
                </div>
                <button
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {meals.length === 0 && (
        <div className="text-center py-8 mb-4 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">🍽️</div>
          <p className="text-gray-600">No meals logged yet today</p>
          <p className="text-sm text-gray-500">Start tracking to see your progress!</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm)
            setShowPresets(false)
          }}
          className="flex-1 btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Meal'}
        </button>
        {presets.length > 0 && (
          <button
            onClick={() => {
              setShowPresets(!showPresets)
              setShowAddForm(false)
            }}
            className="px-6 py-3 rounded-lg font-semibold bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-colors"
          >
            ⚡ Quick Add
          </button>
        )}
      </div>

      {/* Add Meal Form */}
      {showAddForm && (
        <form onSubmit={handleAddMeal} className="mt-4 p-4 bg-primary-50 rounded-lg space-y-3 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Name
            </label>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g., Chicken Caesar Salad"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calories
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="450"
                min="0"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="input-field"
              >
                <option value="breakfast">🌅 Breakfast</option>
                <option value="lunch">☀️ Lunch</option>
                <option value="dinner">🌙 Dinner</option>
                <option value="snack">🍎 Snack</option>
                <option value="other">🍽️ Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Meal'}
          </button>
        </form>
      )}

      {/* Quick Add Presets */}
      {showPresets && presets.length > 0 && (
        <div className="mt-4 p-4 bg-secondary-50 rounded-lg animate-fade-in">
          <h4 className="font-semibold text-gray-800 mb-3">Your Presets</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.slice(0, 6).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleAddPreset(preset)}
                disabled={loading}
                className="text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTimeOfDayIcon(preset.time_of_day)}</span>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{preset.name}</div>
                      <div className="text-xs text-gray-500">{formatCalories(preset.calories)} cal</div>
                    </div>
                  </div>
                  {preset.is_favorite && <span className="text-yellow-500">⭐</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
