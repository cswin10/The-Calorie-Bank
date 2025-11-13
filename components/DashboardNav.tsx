'use client'

import { useState } from 'react'

interface DashboardNavProps {
  onNavigate: (sectionId: string) => void
}

export default function DashboardNav({ onNavigate }: DashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sections = [
    { id: 'summary', label: 'Weekly Summary', icon: '📊' },
    { id: 'stats', label: 'Stats & Streak', icon: '🏆' },
    { id: 'meals', label: "Today's Meals", icon: '🍽️' },
    { id: 'forecast', label: 'Weekly Forecast', icon: '🔮' },
    { id: 'chart', label: 'Weekly Chart', icon: '📈' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'presets', label: 'Meal Presets', icon: '⚡' },
    { id: 'achievements', label: 'Achievements', icon: '🎯' },
    { id: 'history', label: 'Recent History', icon: '📝' },
  ]

  const handleClick = (sectionId: string) => {
    onNavigate(sectionId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button - Fixed Position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-110 active:scale-95"
        aria-label="Navigation Menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Quick Nav</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-white text-opacity-90">Jump to any section</p>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleClick(section.id)}
                  className="w-full flex items-center space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all group text-left"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {section.icon}
                  </span>
                  <span className="font-semibold text-gray-700 group-hover:text-primary-700">
                    {section.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600 text-center">
              💡 Tip: Use this menu to quickly navigate between sections
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
