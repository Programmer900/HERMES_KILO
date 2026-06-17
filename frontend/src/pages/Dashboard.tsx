import { useWebApp } from '../hooks/useWebApp'
import PageLayout from '../components/ui/PageLayout'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'

export default function Dashboard() {
  const { user } = useWebApp()

  return (
    <PageLayout title="Dashboard" gradientFrom="from-blue-500" gradientTo="to-purple-600">
      {user ? (
        <div className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Welcome, {user.first_name}!</h2>
            {user.username && <p className="text-gray-400">@{user.username}</p>}
            {user.is_premium && (
              <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold rounded-full">
                ⭐ Premium
              </span>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <StatCard value="1,234" label="Score" color="text-blue-500" />
            <StatCard value={42} label="Level" color="text-purple-500" />
            <StatCard value={156} label="Stars" color="text-green-500" />
            <StatCard value={7} label="Achievements" color="text-pink-500" />
          </div>
        </div>
      ) : (
        <Card>
          <p className="text-gray-400">Open in Telegram to see your profile</p>
        </Card>
      )}
    </PageLayout>
  )
}
