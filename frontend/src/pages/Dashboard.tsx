import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWebApp } from '../hooks/useWebApp'
import { useStore } from '../store/useStore'
import { gameApi, userApi } from '../api/client'
import type { Activity } from '../api/client'

// Animated counter that counts up to target value
function AnimatedCounter({ target, duration = 1000, prefix = '', suffix = '' }: { target: number; duration?: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = null
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.floor(eased * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return <>{prefix}{value.toLocaleString()}{suffix}</>
}

// Skeleton loader
function StatSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm animate-pulse">
      <div className="h-8 w-16 bg-gray-700 rounded mb-2" />
      <div className="h-4 w-12 bg-gray-700 rounded" />
    </div>
  )
}

export default function Dashboard() {
  const { user, tg } = useWebApp()
  const navigate = useNavigate()
  const { score, level, stars, achievements, setProgress, setActivities, activities } = useStore()
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setProfileError(false)
    try {
      const [progressRes, activitiesRes] = await Promise.allSettled([
        gameApi.getProgress(),
        userApi.getActivities(10),
      ])

      if (progressRes.status === 'fulfilled') {
        setProgress(progressRes.value.data)
      } else {
        setProfileError(true)
      }

      if (activitiesRes.status === 'fulfilled') {
        setActivities(activitiesRes.value.data)
      }
    } catch {
      setProfileError(true)
    } finally {
      setLoading(false)
    }
  }, [setProgress, setActivities])

  useEffect(() => { loadData() }, [loadData])

  const displayName = user ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}` : 'Player'
  const avatarUrl = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=128` : ''

  const quickActions = [
    { label: 'Play Game', icon: '🎮', color: 'from-green-500 to-emerald-600', path: '/game' },
    { label: 'Search', icon: '🔍', color: 'from-purple-500 to-pink-600', path: '/search' },
    { label: 'Buy Stars', icon: '⭐', color: 'from-yellow-500 to-orange-500', path: '/shop' },
    { label: 'Leaderboard', icon: '🏆', color: 'from-blue-500 to-cyan-500', path: '/leaderboard' },
  ]

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      game: '🎮', achievement: '🏆', purchase: '⭐', level_up: '⬆️', search: '🔍', default: '📌',
    }
    return icons[type] || icons.default
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      {/* User Profile Card */}
      {user && (
        <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-2xl p-5 mb-6 border border-indigo-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-full border-2 border-indigo-400/50"
              />
              {user.is_premium && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs border-2 border-gray-900">
                  ⭐
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              {user.username && <p className="text-indigo-300 text-sm">@{user.username}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-indigo-500/30 rounded-full text-xs text-indigo-200">
                  Level {level}
                </span>
                {user.is_premium && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full text-xs text-yellow-200">
                    Premium
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              ⚙️
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {profileError && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-red-300 text-sm">Couldn't load data. Backend may be offline.</p>
          <button onClick={loadData} className="text-red-400 text-sm font-medium hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {loading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
              <div className="text-3xl font-bold text-blue-400">
                <AnimatedCounter target={score} />
              </div>
              <div className="text-gray-400 text-sm mt-1">Score</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
              <div className="text-3xl font-bold text-purple-400">
                <AnimatedCounter target={level} />
              </div>
              <div className="text-gray-400 text-sm mt-1">Level</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
              <div className="text-3xl font-bold text-yellow-400">
                <AnimatedCounter target={stars} prefix="⭐ " />
              </div>
              <div className="text-gray-400 text-sm mt-1">Stars</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
              <div className="text-3xl font-bold text-pink-400">
                <AnimatedCounter target={achievements.filter(a => a.unlocked).length} />
              </div>
              <div className="text-gray-400 text-sm mt-1">Achievements</div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => {
              tg?.HapticFeedback.impactOccurred('light')
              navigate(action.path)
            }}
            className={`bg-gradient-to-r ${action.color} rounded-xl p-4 flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="font-semibold text-white text-sm">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Recent Activity</h3>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-800/40 rounded-xl p-3 flex items-center gap-3 border border-gray-700/30"
            >
              <span className="text-xl">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm truncate">{activity.description}</p>
                <p className="text-gray-500 text-xs">{timeAgo(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/40 rounded-xl p-6 text-center border border-gray-700/30">
          <p className="text-gray-500 text-sm">No activity yet. Start playing!</p>
          <button
            onClick={() => navigate('/game')}
            className="mt-3 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Play Now
          </button>
        </div>
      )}
    </div>
  )
}
