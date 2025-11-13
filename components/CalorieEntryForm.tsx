'use client'

import { useState } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

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

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Log Calories</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={formatDate(new Date())}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
              Calories
            </label>
            <input
              type="number"
              id="calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="2000"
              min="0"
              step="1"
              className="input-field"
              required
            />
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
          {loading ? 'Logging...' : 'Log Calories'}
        </button>
      </form>
    </div>
  )
}
