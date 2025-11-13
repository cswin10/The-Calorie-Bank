'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import type { UserSettings } from '@/lib/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [weeklyTarget, setWeeklyTarget] = useState('14000')
  const [weekStartDay, setWeekStartDay] = useState<'monday' | 'sunday'>('monday')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setSettings(data)
        setWeeklyTarget(data.weekly_calorie_target.toString())
        setWeekStartDay(data.week_start_day as 'monday' | 'sunday')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      const targetValue = parseInt(weeklyTarget)
      if (isNaN(targetValue) || targetValue < 1000) {
        throw new Error('Weekly target must be at least 1,000 calories')
      }

      if (targetValue > 50000) {
        throw new Error('Weekly target cannot exceed 50,000 calories')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('user_settings')
        .update({
          weekly_calorie_target: targetValue,
          week_start_day: weekStartDay,
        })
        .eq('user_id', user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">⚙️</div>
            <p className="text-xl text-gray-600">Loading settings...</p>
          </div>
        </div>
      </>
    )
  }

  const dailyTarget = Math.round(parseInt(weeklyTarget) / 7)

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings ⚙️</h1>
          <p className="text-lg text-gray-600">Customize your calorie banking preferences</p>
        </div>

        <div className="card animate-slide-up">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Weekly Calorie Target */}
            <div>
              <label htmlFor="weeklyTarget" className="block text-lg font-semibold text-gray-800 mb-2">
                Weekly Calorie Target
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Set your total calorie budget for the week
              </p>
              <input
                type="number"
                id="weeklyTarget"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
                min="1000"
                max="50000"
                step="100"
                className="input-field"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                This equals approximately <span className="font-bold text-primary-600">{dailyTarget} calories per day</span>
              </p>
            </div>

            {/* Week Start Day */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Week Start Day
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Choose which day your tracking week starts
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setWeekStartDay('monday')}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    weekStartDay === 'monday'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">📅</div>
                  <div>Monday</div>
                </button>
                <button
                  type="button"
                  onClick={() => setWeekStartDay('sunday')}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    weekStartDay === 'sunday'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">☀️</div>
                  <div>Sunday</div>
                </button>
              </div>
            </div>

            {/* Common Presets */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Quick Presets
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select a common weekly calorie target
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: '10,500', value: 10500, desc: '1,500/day' },
                  { label: '12,000', value: 12000, desc: '1,714/day' },
                  { label: '14,000', value: 14000, desc: '2,000/day' },
                  { label: '17,500', value: 17500, desc: '2,500/day' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setWeeklyTarget(preset.value.toString())}
                    className="p-3 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-center"
                  >
                    <div className="font-bold text-gray-800">{preset.label}</div>
                    <div className="text-xs text-gray-600">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
                ✅ Settings saved successfully! Redirecting to dashboard...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-bold text-gray-800 mb-2">Pro Tip</h3>
            <p className="text-sm text-gray-700">
              Start with a realistic target and adjust based on your progress. Consistency is more important than perfection!
            </p>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-bold text-gray-800 mb-2">Weekly Banking</h3>
            <p className="text-sm text-gray-700">
              The beauty of weekly budgeting is flexibility. Eat less one day, save those calories for another!
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
