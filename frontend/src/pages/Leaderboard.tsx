import { useState, useEffect } from 'react'
import { useWebApp } from '../hooks/useWebApp'
import { gameApi } from '../api/client'
import type { LeaderboardEntry } from '../api/client'

export default function Leaderboard() {
  const { tg, user } = useWebApp()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'today'>('all')

  useEffect(() => {
    loadLeaderboard()
  }, [timeframe])

  const loadLeaderboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await gameApi.getLeaderboard(50)
      setEntries(res.data)
    } catch {
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', badge: 'bg-yellow-500', text: 'text-yellow-300' }
    if (rank === 2) return { bg: 'bg-gray-400/15', border: 'border-gray-400/30', badge: 'bg-gray-400', text: 'text-gray-300' }
    if (rank === 3) return { bg: 'bg-orange-500/15', border: 'border-orange-500/30', badge: 'bg-orange-500', text: 'text-orange-300' }
    return { bg: 'bg-gray-800/30', border: 'border-gray-700/20', badge: 'bg-gray-600', text: 'text-gray-400' }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return user?.id === entry.userId
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
        Leaderboard
      </h1>
      <p className="text-gray-400 text-sm mb-6">Top players worldwide</p>

      {/* Timeframe Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'All Time' },
          { value: 'week', label: 'This Week' },
          { value: 'today', label: 'Today' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setTimeframe(f.value as typeof timeframe)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              timeframe === f.value
                ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border border-yellow-500/30'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
            }`}
            onMouseDown={() => tg?.HapticFeedback.impactOccurred('light')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={loadLeaderboard} className="text-red-400 text-sm font-medium hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Top 3 Podium */}
      {!loading && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gray-400/20 border-2 border-gray-400/40 flex items-center justify-center text-xl">
                {entries[1].avatar ? (
                  <img src={entries[1].avatar} alt="" className="w-full h-full rounded-full" />
                ) : (
                  entries[1].firstName[0]
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-900">
                2
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-300 font-medium truncate max-w-[80px]">{entries[1].firstName}</div>
              <div className="text-xs text-gray-500">{entries[1].score.toLocaleString()}</div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-3 border-yellow-500/50 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
                {entries[0].avatar ? (
                  <img src={entries[0].avatar} alt="" className="w-full h-full rounded-full" />
                ) : (
                  entries[0].firstName[0]
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold text-gray-900 shadow-lg shadow-yellow-500/30">
                1
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-sm text-yellow-300 font-bold truncate max-w-[100px]">{entries[0].firstName}</div>
              <div className="text-xs text-yellow-400/80">{entries[0].score.toLocaleString()}</div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-xl">
                {entries[2].avatar ? (
                  <img src={entries[2].avatar} alt="" className="w-full h-full rounded-full" />
                ) : (
                  entries[2].firstName[0]
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-900">
                3
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-300 font-medium truncate max-w-[80px]">{entries[2].firstName}</div>
              <div className="text-xs text-gray-500">{entries[2].score.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-700 rounded mb-1" />
                <div className="h-3 w-16 bg-gray-700 rounded" />
              </div>
              <div className="h-5 w-16 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Full List */}
      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => {
            const style = getRankStyle(entry.rank)
            const isMe = isCurrentUser(entry)
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${style.bg} ${style.border} ${isMe ? 'ring-1 ring-indigo-500/50' : ''}`}
                onMouseDown={() => tg?.HapticFeedback.impactOccurred('light')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${style.badge} text-gray-900`}>
                  {getRankIcon(entry.rank)}
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sm font-medium text-gray-300 overflow-hidden">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    entry.firstName[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${isMe ? 'text-indigo-300' : 'text-gray-200'}`}>
                    {entry.firstName}
                    {isMe && <span className="ml-1 text-xs text-indigo-400">(you)</span>}
                  </div>
                  <div className="text-xs text-gray-500">Level {entry.level}</div>
                </div>
                <div className={`text-sm font-bold ${style.text}`}>
                  {entry.score.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-gray-400">No players yet</p>
          <p className="text-gray-500 text-sm mt-1">Be the first on the leaderboard!</p>
        </div>
      )}
    </div>
  )
}
