import { format, parseISO } from 'date-fns'
import { formatCalories } from '@/lib/calculations'
import type { CalorieEntry } from '@/lib/types'

interface RecentEntriesTableProps {
  entries: CalorieEntry[]
}

export default function RecentEntriesTable({ entries }: RecentEntriesTableProps) {
  // Sort entries by date descending and take last 14
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
    .slice(0, 14)

  if (recentEntries.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Entries</h3>
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2">📝</p>
          <p>No entries yet. Start logging your calories!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Entries</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Day</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Calories</th>
            </tr>
          </thead>
          <tbody>
            {recentEntries.map((entry, index) => {
              const entryDate = parseISO(entry.entry_date)
              const isToday = format(entryDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

              return (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isToday ? 'bg-primary-50' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className={`font-medium ${isToday ? 'text-primary-700' : 'text-gray-800'}`}>
                      {format(entryDate, 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {format(entryDate, 'EEEE')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-gray-800">
                      {formatCalories(entry.calories)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {entries.length > 14 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing 14 most recent entries of {entries.length} total
        </div>
      )}
    </div>
  )
}
