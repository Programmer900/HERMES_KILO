import { useState, useEffect, useCallback, useRef } from 'react'
import { useWebApp } from '../hooks/useWebApp'
import { useStore } from '../store/useStore'
import { gameApi } from '../api/client'
import type { LeaderboardEntry } from '../api/client'

// Floating +N text that animates upward
function FloatingScore({ amount, x, y }: { amount: number; x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none font-bold text-lg animate-float-up"
      style={{
        left: x,
        top: y,
        color: amount >= 5 ? '#f59e0b' : amount >= 3 ? '#8b5cf6' : '#3b82f6',
        textShadow: '0 0 8px currentColor',
        animation: 'floatUp 0.8s ease-out forwards',
      }}
    >
      +{amount}
    </div>
  )
}

// Particle component
function Particle({ x, y, dx, dy, color, life }: { x: number; y: number; dx: number; dy: number; color: string; life: number }) {
  return (
    <div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: x + dx * (1 - life) * 20,
        top: y + dy * (1 - life) * 20,
        width: 4 + life * 4,
        height: 4 + life * 4,
        backgroundColor: color,
        opacity: life,
        boxShadow: `0 0 ${life * 8}px ${color}`,
        transform: `scale(${life})`,
      }}
    />
  )
}

export default function Game() {
  const { tg } = useWebApp()
  const store = useStore()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [floatingScores, setFloatingScores] = useState<{ id: number; amount: number; x: number; y: number }[]>([])
  const [showAchievements, setShowAchievements] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isPressed, setIsPressed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const autoTapRef = useRef<ReturnType<typeof setInterval> | null>(null)
  let floatId = 0

  // Load initial progress
  useEffect(() => {
    gameApi.getProgress().then(res => {
      store.setProgress(res.data)
    }).catch(() => {})
  }, [])

  // Load leaderboard
  useEffect(() => {
    if (showLeaderboard) {
      gameApi.getLeaderboard(20).then(res => {
        setLeaderboard(res.data)
      }).catch(() => {})
    }
  }, [showLeaderboard])

  // Power-up ticker
  useEffect(() => {
    const interval = setInterval(() => store.tickPowerUps(), 100)
    return () => clearInterval(interval)
  }, [])

  // Auto-tap effect
  useEffect(() => {
    if (store.autoTapActive && !autoTapRef.current) {
      autoTapRef.current = setInterval(() => {
        store.incrementScore(1)
      }, 200)
    } else if (!store.autoTapActive && autoTapRef.current) {
      clearInterval(autoTapRef.current)
      autoTapRef.current = null
    }
    return () => {
      if (autoTapRef.current) clearInterval(autoTapRef.current)
    }
  }, [store.autoTapActive])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const saveProgress = useCallback(async () => {
    setSaveStatus('saving')
    try {
      await gameApi.saveProgress({
        score: store.score,
        level: store.level,
        stars: store.stars,
        achievements: store.achievements,
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [store.score, store.level, store.stars, store.achievements])

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

    // Score
    store.incrementScore(store.level)
    store.incrementCombo()

    // Particles (burst of 3-6)
    const count = 3 + Math.floor(Math.random() * 4)
    for (let i = 0; i < count; i++) {
      store.addParticle(x, y)
    }

    // Floating score
    const totalMult = store.comboMultiplier * store.activePowerUps.reduce((m, p) => m * p.multiplier, 1)
    const displayAmount = Math.floor(store.level * totalMult)
    const id = ++floatId
    setFloatingScores(prev => [...prev, { id, amount: displayAmount, x, y }])
    setTimeout(() => setFloatingScores(prev => prev.filter(f => f.id !== id)), 800)

    // Haptics
    tg?.HapticFeedback.impactOccurred(store.combo >= 30 ? 'heavy' : store.combo >= 10 ? 'medium' : 'light')

    // Level up check
    const newScore = store.score + displayAmount
    const threshold = store.level * 100
    if (newScore >= threshold) {
      tg?.HapticFeedback.notificationOccurred('success')
    }
  }, [store, tg])

  const comboColor = store.combo >= 50 ? 'text-yellow-400' : store.combo >= 30 ? 'text-orange-400' : store.combo >= 15 ? 'text-purple-400' : store.combo >= 5 ? 'text-blue-400' : 'text-gray-400'

  const progressPct = (store.score % (store.level * 100)) / (store.level * 100) * 100

  const activePowerUpNames = store.activePowerUps.map(p => {
    const remaining = Math.max(0, Math.ceil((p.expiresAt - Date.now()) / 1000))
    return `${p.multiplier}x (${remaining}s)`
  })

  return (
    <div className="p-4 pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Game
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            🏅
          </button>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            🏆
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wide">Level</div>
            <div className="text-4xl font-bold text-green-400">{store.level}</div>
          </div>
          <div className="text-center">
            {store.combo > 0 && (
              <div className={`text-sm font-bold ${comboColor} mb-1`}>
                {store.combo}x COMBO
                {store.comboMultiplier > 1 && <span className="ml-1 text-yellow-300">×{store.comboMultiplier}</span>}
              </div>
            )}
            {activePowerUpNames.length > 0 && (
              <div className="flex gap-1 justify-center">
                {activePowerUpNames.map((name, i) => (
                  <span key={i} className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                    ⚡ {name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Score</div>
            <div className="text-4xl font-bold text-blue-400">{store.score.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-200"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs text-center">
          {store.score % (store.level * 100)} / {store.level * 100} to next level
        </p>
      </div>

      {/* Tap Button */}
      <div className="relative mb-4">
        <button
          ref={buttonRef}
          onMouseDown={handleTap}
          onTouchStart={handleTap}
          onMouseDownCapture={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          className={`w-full py-8 rounded-2xl font-bold text-2xl transition-all select-none ${
            isPressed
              ? 'bg-gradient-to-r from-green-600 to-blue-700 scale-95'
              : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {store.autoTapActive ? '⚡ AUTO TAP ⚡' : 'TAP!'}
        </button>
        {/* Floating scores */}
        {floatingScores.map(f => (
          <FloatingScore key={f.id} amount={f.amount} x={f.x} y={f.y} />
        ))}
        {/* Particles */}
        {store.particles.map(p => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      {/* Save Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">
            {saveStatus === 'saving' && '💾 Saving...'}
            {saveStatus === 'saved' && '✅ Saved'}
            {saveStatus === 'error' && '❌ Save failed'}
          </span>
        </div>
        <button
          onClick={saveProgress}
          className="px-3 py-1.5 bg-gray-800/50 rounded-lg text-xs text-gray-300 hover:bg-gray-700/50 transition-colors border border-gray-700/50"
        >
          💾 Save
        </button>
      </div>

      {/* Power-Ups */}
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Power-Ups</h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { id: '2x', name: '2x', icon: '⚡', multiplier: 2, duration: 15, cost: 10 },
          { id: '5x', name: '5x', icon: '💥', multiplier: 5, duration: 10, cost: 25 },
          { id: 'auto', name: 'Auto', icon: '🤖', multiplier: 1, duration: 20, cost: 50 },
        ].map(pu => {
          const isActive = pu.id === 'auto' ? store.autoTapActive : store.activePowerUps.some(p => p.id === pu.id)
          return (
            <button
              key={pu.id}
              onClick={() => {
                if (pu.id === 'auto') {
                  if (store.spendStars(pu.cost)) {
                    store.setAutoTap(true)
                    setTimeout(() => store.setAutoTap(false), pu.duration * 1000)
                    tg?.HapticFeedback.notificationOccurred('success')
                  } else {
                    tg?.HapticFeedback.notificationOccurred('error')
                  }
                } else {
                  if (store.spendStars(pu.cost)) {
                    store.activatePowerUp(pu.id, pu.multiplier, pu.duration)
                    tg?.HapticFeedback.notificationOccurred('success')
                  } else {
                    tg?.HapticFeedback.notificationOccurred('error')
                  }
                }
              }}
              className={`p-3 rounded-xl text-center transition-all ${
                isActive
                  ? 'bg-yellow-500/20 border border-yellow-500/50'
                  : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <div className="text-2xl mb-1">{pu.icon}</div>
              <div className="text-xs font-medium text-gray-300">{pu.name}</div>
              <div className="text-xs text-yellow-400">⭐{pu.cost}</div>
            </button>
          )
        })}
      </div>

      {/* Achievements Panel */}
      {showAchievements && (
        <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">🏅 Achievements</h3>
          {store.achievements.length > 0 ? (
            <div className="space-y-2">
              {store.achievements.map(a => (
                <div key={a.id} className={`flex items-center gap-3 p-2 rounded-lg ${a.unlocked ? 'bg-gray-700/30' : 'opacity-40'}`}>
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-200">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.description}</div>
                  </div>
                  {a.unlocked && <span className="ml-auto text-green-400 text-xs">✓</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center">Keep playing to unlock achievements!</p>
          )}
        </div>
      )}

      {/* Leaderboard Panel */}
      {showLeaderboard && (
        <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">🏆 Top Players</h3>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry) => (
                <div key={entry.userId} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/20">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    entry.rank === 1 ? 'bg-yellow-500/30 text-yellow-300' :
                    entry.rank === 2 ? 'bg-gray-400/30 text-gray-300' :
                    entry.rank === 3 ? 'bg-orange-500/30 text-orange-300' :
                    'bg-gray-600/30 text-gray-400'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-200">{entry.firstName}</div>
                    <div className="text-xs text-gray-500">Level {entry.level}</div>
                  </div>
                  <div className="text-sm font-bold text-blue-400">{entry.score.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center">Loading leaderboard...</p>
          )}
        </div>
      )}

      {/* How to Play */}
      <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
        <h3 className="font-semibold text-gray-200 mb-2">How to Play</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Tap fast to build combos for score multipliers</li>
          <li>• 5+ combo = 1.5x, 15+ = 2x, 30+ = 3x, 50+ = 5x</li>
          <li>• Buy power-ups with stars for massive multipliers</li>
          <li>• Progress saves automatically every 30s</li>
        </ul>
      </div>
    </div>
  )
}
