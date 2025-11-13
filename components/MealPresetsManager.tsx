'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCalories } from '@/lib/calculations'
import type { MealPreset, TimeOfDay } from '@/lib/types'

interface MealPresetsManagerProps {
  userId: string
}

export default function MealPresetsManager({ userId }: MealPresetsManagerProps) {
  const [presets, setPresets] = useState<MealPreset[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPreset, setEditingPreset] = useState<MealPreset | null>(null)
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('other')
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchPresets()
  }, [])

  const fetchPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_presets')
        .select('*')
        .eq('user_id', userId)
        .order('is_favorite', { ascending: false })
        .order('name', { ascending: true })

      if (error) throw error
      setPresets(data || [])
    } catch (error) {
      console.error('Error fetching presets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const calorieValue = parseInt(calories)
      if (isNaN(calorieValue) || calorieValue < 0) {
        throw new Error('Please enter a valid calorie amount')
      }

      const presetData = {
        name,
        calories: calorieValue,
        time_of_day: timeOfDay,
        is_favorite: isFavorite,
      }

      if (editingPreset) {
        // Update existing preset
        const { error } = await supabase
          .from('meal_presets')
          .update(presetData)
          .eq('id', editingPreset.id)

        if (error) throw error
      } else {
        // Create new preset
        const { error } = await supabase
          .from('meal_presets')
          .insert({
            ...presetData,
            user_id: userId,
          })

        if (error) throw error
      }

      resetForm()
      fetchPresets()
    } catch (error: any) {
      alert(error.message || 'Failed to save preset')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (preset: MealPreset) => {
    setEditingPreset(preset)
    setName(preset.name)
    setCalories(preset.calories.toString())
    setTimeOfDay(preset.time_of_day || 'other')
    setIsFavorite(preset.is_favorite)
    setShowAddForm(true)
  }

  const handleDelete = async (presetId: string) => {
    if (!confirm('Delete this preset?')) return

    try {
      const { error } = await supabase
        .from('meal_presets')
        .delete()
        .eq('id', presetId)

      if (error) throw error
      fetchPresets()
    } catch (error: any) {
      alert(error.message || 'Failed to delete preset')
    }
  }

  const toggleFavorite = async (preset: MealPreset) => {
    try {
      const { error } = await supabase
        .from('meal_presets')
        .update({ is_favorite: !preset.is_favorite })
        .eq('id', preset.id)

      if (error) throw error
      fetchPresets()
    } catch (error: any) {
      alert(error.message || 'Failed to update favorite')
    }
  }

  const resetForm = () => {
    setName('')
    setCalories('')
    setTimeOfDay('other')
    setIsFavorite(false)
    setEditingPreset(null)
    setShowAddForm(false)
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

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Meal Presets</h3>
          <p className="text-sm text-gray-600">Save your common meals for quick logging</p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) {
              resetForm()
            } else {
              setShowAddForm(true)
            }
          }}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ New Preset'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-primary-50 rounded-lg space-y-3 animate-fade-in">
          <h4 className="font-semibold text-gray-800">
            {editingPreset ? 'Edit Preset' : 'Create New Preset'}
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My usual breakfast"
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
                placeholder="400"
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="favorite" className="text-sm text-gray-700">
              ⭐ Mark as favorite (shows first in quick add)
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingPreset ? 'Update Preset' : 'Create Preset'}
            </button>
            {editingPreset && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Presets List */}
      {presets.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-gray-600 mb-1">No presets yet</p>
          <p className="text-sm text-gray-500">Create presets for your common meals</p>
        </div>
      ) : (
        <div className="space-y-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <button
                  onClick={() => toggleFavorite(preset)}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  {preset.is_favorite ? '⭐' : '☆'}
                </button>
                <div className="text-2xl">{getTimeOfDayIcon(preset.time_of_day)}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{preset.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatCalories(preset.calories)} • Used {preset.use_count} times
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(preset)}
                  className="text-primary-600 hover:text-primary-700 font-semibold text-sm px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
