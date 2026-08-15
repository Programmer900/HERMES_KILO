import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/game', label: 'Game', icon: '🎮' },
  { path: '/search', label: 'Search', icon: '🔍' },
  { path: '/leaderboard', label: 'Ranks', icon: '🏆' },
  { path: '/shop', label: 'Shop', icon: '⭐' },
]

export default function Navigation() {
  const location = useLocation()
  const { achievements, stars } = useStore()

  const getBadge = (path: string) => {
    if (path === '/shop' && stars > 0) return null // Don't show badge for having stars
    if (path === '/') {
      const newAchievements = achievements.filter(a => a.unlocked && !a.unlockedAt).length
      return newAchievements > 0 ? newAchievements : null
    }
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800/80 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const badge = getBadge(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive
                  ? 'text-blue-400'
                  : 'text-gray-500 hover:text-gray-300 active:text-gray-200'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full" />
              )}
              <span className={`text-xl mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-blue-400' : ''}`}>
                {item.label}
              </span>
              {badge && (
                <span className="absolute top-1 right-1/4 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
