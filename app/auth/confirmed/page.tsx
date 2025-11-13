'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ConfirmedPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full">
        <div className="text-center animate-fade-in">
          <div className="text-8xl mb-6 animate-bounce">✅</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Email Confirmed!
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Your email has been successfully verified. Welcome to Calorie Bank!
          </p>

          <div className="card bg-white shadow-lg animate-slide-up">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-left">
                <div className="text-3xl">🏦</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Start Banking Calories</h3>
                  <p className="text-sm text-gray-600">Track your weekly calorie budget</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="text-3xl">🏆</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Unlock Achievements</h3>
                  <p className="text-sm text-gray-600">Complete challenges and level up</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="text-3xl">🔥</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Build Streaks</h3>
                  <p className="text-sm text-gray-600">Stay consistent and earn rewards</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="block w-full btn-primary text-center"
              >
                Go to Dashboard
              </Link>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
