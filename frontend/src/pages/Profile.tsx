import { useStore } from '../lib/store'
import { useWebApp } from '../hooks/useWebApp'

export default function Profile() {
  const { user } = useStore()
  const { user: tgUser } = useWebApp()

  return (
    <div className="p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
        Profile
      </h1>

      {/* User Card */}
      <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
            {(tgUser?.first_name || user?.firstName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{tgUser?.first_name || user?.firstName || 'User'}</h2>
            {tgUser?.username && <p className="text-gray-400">@{tgUser.username}</p>}
            {tgUser?.is_premium && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                ⭐ Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Score', value: user?.starsBalance || 0, color: 'text-blue-400', icon: '🎯' },
          { label: 'Level', value: 1, color: 'text-green-400', icon: '📈' },
          { label: 'Stars', value: user?.starsBalance || 0, color: 'text-yellow-400', icon: '⭐' },
          { label: 'Games', value: 0, color: 'text-pink-400', icon: '🎮' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <span>{stat.icon}</span>
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm mb-6">
        <h3 className="font-semibold mb-4">🏆 Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🎯', name: 'First Tap', unlocked: true },
            { icon: '🔥', name: '100 Combo', unlocked: false },
            { icon: '⭐', name: 'Star Collector', unlocked: false },
            { icon: '🏆', name: 'Top 10', unlocked: false },
            { icon: '💎', name: 'Diamond', unlocked: false },
            { icon: '🚀', name: 'Speed Demon', unlocked: false },
          ].map((ach) => (
            <div
              key={ach.name}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl ${
                ach.unlocked
                  ? 'bg-yellow-500/10 border border-yellow-500/30'
                  : 'bg-gray-700/30 opacity-50'
              }`}
            >
              <span className="text-2xl">{ach.icon}</span>
              <span className="text-xs text-center">{ach.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="font-semibold mb-4">⚙️ Settings</h3>
        <div className="space-y-3">
          {[
            { label: 'Notifications', enabled: true },
            { label: 'Sound Effects', enabled: true },
            { label: 'Haptic Feedback', enabled: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between">
              <span className="text-gray-300">{setting.label}</span>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  setting.enabled ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
