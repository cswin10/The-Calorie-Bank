'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/dateUtils'

interface CalorieEntryFormProps {
  userId: string
  onEntryAdded: () => void
}

export default function CalorieEntryForm({ userId, onEntryAdded }: CalorieEntryFormProps) {
  const [date, setDate] = useState(formatDate(new Date()))
  const [calories, setCalories] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingEntry, setLoadingEntry] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  // Load existing entry when date changes
  useEffect(() => {
    const loadEntryForDate = async () => {
      if (!date) return

      setLoadingEntry(true)
      try {
        const { data: existingEntry } = await supabase
          .from('calorie_entries')
          .select('calories')
          .eq('user_id', userId)
          .eq('entry_date', date)
          .single()

        if (existingEntry) {
          setCalories(existingEntry.calories.toString())
        } else {
          setCalories('')
        }
      } catch (error) {
        // No entry found for this date, that's okay
        setCalories('')
      } finally {
        setLoadingEntry(false)
      }
    }

    loadEntryForDate()
  }, [date, userId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const calorieValue = parseInt(calories)
      if (isNaN(calorieValue) || calorieValue < 0) {
        throw new Error('Please enter a valid calorie amount')
      }

      // Check if entry exists for this date
      const { data: existingEntry } = await supabase
        .from('calorie_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('entry_date', date)
        .single()

      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('calorie_entries')
          .update({ calories: calorieValue })
          .eq('id', existingEntry.id)

        if (updateError) throw updateError
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from('calorie_entries')
          .insert({
            user_id: userId,
            entry_date: date,
            calories: calorieValue,
          })

        if (insertError) throw insertError
      }

      setSuccess(true)
      setCalories('')
      onEntryAdded()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to log calories')
    } finally {
      setLoading(false)
    }
  }

  const isEditingPastDate = date !== formatDate(new Date())

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Log Calories</h3>
          <p className="text-sm text-gray-600 mt-1">
            📅 You can log or edit calories for any day
          </p>
        </div>
        {isEditingPastDate && (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold animate-fade-in">
            Editing past date
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-primary-600">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={formatDate(new Date())}
              className="input-field cursor-pointer"
              required
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-lg">👆</span>
              <span className="font-medium">Click to change date and edit previous days</span>
            </p>
          </div>

          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
              Calories <span className="text-primary-600">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="2000"
                min="0"
                step="1"
                className="input-field"
                disabled={loadingEntry}
                required
              />
              {loadingEntry && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {loadingEntry ? 'Loading...' : isEditingPastDate ? 'Update calories for selected date' : 'Enter total calories for today'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
            ✅ Calories logged successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (isEditingPastDate ? 'Updating...' : 'Logging...') : (isEditingPastDate ? 'Update Calories' : 'Log Calories')}
        </button>
      </form>
    </div>
  )
}
