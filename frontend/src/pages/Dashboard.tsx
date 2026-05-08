import { useWebApp } from '../hooks/useWebApp'

export default function Dashboard() {
  const { user, tg } = useWebApp()

  return (
    <div className="p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Dashboard
      </h1>

      {user ? (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-2">Welcome, {user.first_name}!</h2>
            {user.username && <p className="text-gray-400">@{user.username}</p>}
            {user.is_premium && (
              <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold rounded-full">
                ⭐ Premium
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-500">1,234</div>
              <div className="text-gray-400 text-sm">Score</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-500">42</div>
              <div className="text-gray-400 text-sm">Level</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-500">156</div>
              <div className="text-gray-400 text-sm">Stars</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold text-pink-500">7</div>
              <div className="text-gray-400 text-sm">Achievements</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-gray-400">Open in Telegram to see your profile</p>
        </div>
      )}
    </div>
  )
}
