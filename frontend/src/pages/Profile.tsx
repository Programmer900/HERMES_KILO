import { useState, useEffect } from 'react'
import { useWebApp } from '../hooks/useWebApp'
import { useStore } from '../store/useStore'
import { userApi, gameApi } from '../api/client'
import type { UserProfile } from '../api/client'

export default function Profile() {
  const { user, tg } = useWebApp()
  const store = useStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, progressRes] = await Promise.allSettled([
          userApi.getProfile(),
          gameApi.getProgress(),
        ])

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data)
          setDisplayName(profileRes.value.data.firstName)
        }
        if (progressRes.status === 'fulfilled') {
          store.setProgress(progressRes.value.data)
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    try {
      await userApi.updateProfile({ firstName: displayName })
      setEditing(false)
      tg?.HapticFeedback.notificationOccurred('success')
    } catch {
      tg?.HapticFeedback.notificationOccurred('error')
    }
  }

  const avatarName = user ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}` : 'Player'
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=6366f1&color=fff&size=128`

  const unlockedCount = store.achievements.filter(a => a.unlocked).length
  const totalCount = store.achievements.length

  if (loading) {
    return (
      <div className="p-4 pb-24 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-800 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-800 rounded-xl" />
            <div className="h-20 bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        Profile
      </h1>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 rounded-2xl p-6 mb-6 border border-indigo-500/20">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <img src={avatarUrl} alt={avatarName} className="w-24 h-24 rounded-full border-3 border-indigo-400/50" />
            {user?.is_premium && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-8 h-8 flex items-center justify-center text-sm border-2 border-gray-900">
                ⭐
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none text-center text-white"
              />
              <button onClick={handleSave} className="px-3 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="px-3 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600">
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
              {user?.username && <p className="text-indigo-300 text-sm mb-2">@{user.username}</p>}
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 bg-gray-800/50 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✏️ Edit Profile
              </button>
            </>
          )}

          <div className="flex gap-2 mt-3">
            <span className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs text-indigo-300">
              Level {store.level}
            </span>
            {user?.is_premium && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full text-xs text-yellow-300">
                Premium
              </span>
            )}
            {profile?.joinedAt && (
              <span className="px-3 py-1 bg-gray-700/30 rounded-full text-xs text-gray-400">
                Joined {new Date(profile.joinedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Stats</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
          <div className="text-2xl font-bold text-blue-400">{store.score.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Total Score</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
          <div className="text-2xl font-bold text-green-400">{store.level}</div>
          <div className="text-gray-400 text-sm">Level</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
          <div className="text-2xl font-bold text-yellow-400">⭐ {store.stars}</div>
          <div className="text-gray-400 text-sm">Stars</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
          <div className="text-2xl font-bold text-pink-400">{unlockedCount}/{totalCount}</div>
          <div className="text-gray-400 text-sm">Achievements</div>
        </div>
      </div>

      {/* Achievements */}
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Achievements</h3>
      {store.achievements.length > 0 ? (
        <div className="space-y-2 mb-6">
          {store.achievements.map(a => (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                a.unlocked
                  ? 'bg-gray-800/50 border-gray-700/30'
                  : 'bg-gray-900/30 border-gray-800/30 opacity-50'
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-200">{a.name}</div>
                <div className="text-xs text-gray-400">{a.description}</div>
                {a.unlockedAt && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              {a.unlocked ? (
                <span className="text-green-400 text-lg">✓</span>
              ) : (
                <span className="text-gray-600 text-lg">🔒</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/40 rounded-xl p-6 text-center border border-gray-700/30 mb-6">
          <p className="text-gray-500 text-sm">Play games to unlock achievements!</p>
        </div>
      )}

      {/* Settings */}
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Settings</h3>
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/30 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
          <div className="flex items-center gap-3">
            <span>🔔</span>
            <span className="text-sm text-gray-200">Notifications</span>
          </div>
          <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
          <div className="flex items-center gap-3">
            <span>🔊</span>
            <span className="text-sm text-gray-200">Sound Effects</span>
          </div>
          <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span>📱</span>
            <span className="text-sm text-gray-200">Haptic Feedback</span>
          </div>
          <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
          </div>
        </div>
      </div>
    </div>
  )
}
