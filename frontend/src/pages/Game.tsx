import { useState } from 'react'
import { useWebApp } from '../hooks/useWebApp'

export default function Game() {
  const { tg } = useWebApp()
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)

  const handleClick = () => {
    const newScore = score + level
    setScore(newScore)
    
    tg?.HapticFeedback.impactOccurred('medium')
    
    if (newScore >= level * 100) {
      setLevel(l => l + 1)
      tg?.HapticFeedback.notificationOccurred('success')
    }
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
        Game
      </h1>

      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-gray-400 text-sm">Level</div>
              <div className="text-4xl font-bold text-green-500">{level}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Score</div>
              <div className="text-4xl font-bold text-blue-500">{score}</div>
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${(score % (level * 100)) / (level * 100) * 100}%` }}
            />
          </div>

          <button
            onClick={handleClick}
            className="w-full py-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl font-bold text-xl hover:opacity-90 active:scale-95 transition-all"
          >
            TAP ME!
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
          <h3 className="font-semibold mb-2">How to Play</h3>
          <p className="text-gray-400 text-sm">
            Tap the button to earn points. Every {level * 100} points you level up! 
            Higher levels give more points per tap.
          </p>
        </div>
      </div>
    </div>
  )
}
