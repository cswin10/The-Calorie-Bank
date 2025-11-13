'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-3xl">🏦</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Calorie Bank
              </span>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  pathname === '/settings'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Settings
              </Link>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex">
          <Link
            href="/dashboard"
            className={`flex-1 text-center px-3 py-3 text-sm font-medium ${
              pathname === '/dashboard'
                ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-600'
                : 'text-gray-600'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className={`flex-1 text-center px-3 py-3 text-sm font-medium ${
              pathname === '/settings'
                ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-600'
                : 'text-gray-600'
            }`}
          >
            Settings
          </Link>
        </div>
      </div>
    </nav>
  )
}
