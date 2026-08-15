import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'

const NAV_ITEMS = [
  { path: '/', icon: '📊', label: 'Dashboard', badge: null },
  { path: '/game', icon: '🎮', label: 'Game', badge: null },
  { path: '/search', icon: '🔍', label: 'Search', badge: null },
  { path: '/leaderboard', icon: '🏆', label: 'Leaders', badge: null },
  { path: '/shop', icon: '⭐', label: 'Shop', badge: null },
]

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Stars balance */}
      {user && (
        <div className="absolute top-2 right-4 flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full">
          <span className="text-yellow-400 text-xs">⭐</span>
          <span className="text-yellow-400 text-xs font-bold">{user.starsBalance}</span>
        </div>
      )}
    </nav>
  )
}
