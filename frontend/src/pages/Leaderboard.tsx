import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'CryptoKing', score: 98450, level: 42, avatar: '👑' },
  { rank: 2, name: 'TapperPro', score: 87200, level: 38, avatar: '🔥' },
  { rank: 3, name: 'StarHunter', score: 76100, level: 35, avatar: '⭐' },
  { rank: 4, name: 'GameMaster', score: 65800, level: 31, avatar: '🎮' },
  { rank: 5, name: 'QuickFingers', score: 54300, level: 28, avatar: '⚡' },
  { rank: 6, name: 'NightOwl', score: 43200, level: 24, avatar: '🦉' },
  { rank: 7, name: 'PixelHero', score: 32100, level: 20, avatar: '🎯' },
  { rank: 8, name: 'TapWizard', score: 21000, level: 16, avatar: '🧙' },
  { rank: 9, name: 'ComboKing', score: 15400, level: 13, avatar: '💥' },
  { rank: 10, name: 'NewPlayer', score: 8200, level: 8, avatar: '🌟' },
]

export default function Leaderboard() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'all'>('all')
  const [players, setPlayers] = useState(MOCK_LEADERBOARD)
  const { leaderboard, loadLeaderboard } = useStore()

  useEffect(() => {
    loadLeaderboard()
  }, [])

  useEffect(() => {
    if (leaderboard.length > 0) {
      setPlayers(leaderboard.map((p: any, i: number) => ({
        rank: i + 1,
        name: p.firstName || p.username || 'Player',
        score: p.score || 0,
        level: p.level || 1,
        avatar: ['👑', '🔥', '⭐', '🎮', '⚡', '🦉', '🎯', '🧙', '💥', '🌟'][i % 10],
      })))
    }
  }, [leaderboard])

  return (
    <div className="p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
        Leaderboard
      </h1>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'daily' as const, label: 'Daily' },
          { key: 'weekly' as const, label: 'Weekly' },
          { key: 'all' as const, label: 'All Time' },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              period === p.key
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-black'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {players.slice(0, 3).map((player, i) => {
          const heights = [140, 180, 120]
          const colors = ['from-gray-400 to-gray-500', 'from-yellow-400 to-yellow-600', 'from-orange-400 to-orange-600']
          const order = [1, 0, 2] // 2nd, 1st, 3rd

          return (
            <div key={player.rank} className="flex flex-col items-center" style={{ order: order[i] }}>
              <div className="text-3xl mb-2">{player.avatar}</div>
              <div className="text-sm font-bold mb-1">{player.name}</div>
              <div className="text-xs text-gray-400 mb-2">{player.score.toLocaleString()}</div>
              <div
                className={`w-20 bg-gradient-to-t ${colors[i]} rounded-t-xl flex items-center justify-center`}
                style={{ height: heights[i] }}
              >
                <span className="text-3xl font-bold text-black">{i === 1 ? '1' : i === 0 ? '2' : '3'}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {players.slice(3).map((player) => (
          <div
            key={player.rank}
            className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm"
          >
            <span className="text-gray-500 font-mono w-8 text-center">#{player.rank}</span>
            <span className="text-2xl">{player.avatar}</span>
            <div className="flex-1">
              <div className="font-semibold">{player.name}</div>
              <div className="text-xs text-gray-400">Level {player.level}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-yellow-400">{player.score.toLocaleString()}</div>
              <div className="text-xs text-gray-400">pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
