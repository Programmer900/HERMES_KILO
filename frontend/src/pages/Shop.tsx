import { useState, useEffect } from 'react'
import { useWebApp } from '../hooks/useWebApp'
import { useStore } from '../store/useStore'
import { shopApi } from '../api/client'
import type { ShopItem } from '../api/client'

// Predefined shop items (used as fallback if API unavailable)
const FALLBACK_ITEMS: ShopItem[] = [
  { id: 'stars-10', name: '10 Stars', description: 'Get 10 bonus stars', type: 'stars', price: 1, icon: '⭐', value: 10 },
  { id: 'stars-50', name: '50 Stars', description: 'Get 50 bonus stars (best value!)', type: 'stars', price: 3, icon: '🌟', value: 50 },
  { id: 'stars-100', name: '100 Stars', description: 'Get 100 bonus stars', type: 'stars', price: 5, icon: '💫', value: 100 },
  { id: 'power-2x', name: '2x Power-Up', description: 'Double your score for 15 seconds', type: 'power_up', price: 2, icon: '⚡', value: 2 },
  { id: 'power-5x', name: '5x Power-Up', description: '5x score for 10 seconds', type: 'power_up', price: 5, icon: '💥', value: 5 },
  { id: 'power-auto', name: 'Auto-Tap', description: 'Auto tap for 20 seconds', type: 'power_up', price: 8, icon: '🤖', value: 1 },
  { id: 'cosmic-trail', name: 'Cosmic Trail', description: 'Particle trail effect on taps', type: 'cosmetic', price: 15, icon: '✨', value: 1 },
  { id: 'neon-glow', name: 'Neon Glow', description: 'Glowing tap button effect', type: 'cosmetic', price: 20, icon: '💎', value: 1 },
]

export default function Shop() {
  const { tg } = useWebApp()
  const store = useStore()
  const [items, setItems] = useState<ShopItem[]>(FALLBACK_ITEMS)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'stars' | 'power_up' | 'cosmetic'>('all')
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await shopApi.getItems()
        if (res.data.length > 0) setItems(res.data)
      } catch {
        // Use fallback items
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handlePurchase = async (item: ShopItem) => {
    if (purchasing) return

    // Check if user has enough stars
    if (store.stars < item.price) {
      tg?.HapticFeedback.notificationOccurred('error')
      return
    }

    setPurchasing(item.id)
    tg?.HapticFeedback.impactOccurred('medium')

    try {
      await shopApi.purchase(item.id)
      store.spendStars(item.price)

      // Apply item effects locally
      if (item.type === 'stars') {
        store.addStars(item.value)
      } else if (item.type === 'power_up') {
        if (item.id === 'power-auto') {
          store.setAutoTap(true)
          setTimeout(() => store.setAutoTap(false), 20000)
        } else {
          store.activatePowerUp(item.id, item.value, item.value === 5 ? 10 : 15)
        }
      }

      setPurchaseSuccess(item.id)
      setTimeout(() => setPurchaseSuccess(null), 2000)
      tg?.HapticFeedback.notificationOccurred('success')
    } catch {
      // Fallback: apply locally anyway
      if (store.spendStars(item.price)) {
        if (item.type === 'stars') store.addStars(item.value)
        setPurchaseSuccess(item.id)
        setTimeout(() => setPurchaseSuccess(null), 2000)
      } else {
        tg?.HapticFeedback.notificationOccurred('error')
      }
    } finally {
      setPurchasing(null)
    }
  }

  const tabs = [
    { value: 'all', label: 'All', icon: '🏪' },
    { value: 'stars', label: 'Stars', icon: '⭐' },
    { value: 'power_up', label: 'Power-Ups', icon: '⚡' },
    { value: 'cosmetic', label: 'Cosmetics', icon: '✨' },
  ]

  const filteredItems = activeTab === 'all' ? items : items.filter(i => i.type === activeTab)

  return (
    <div className="p-4 pb-24 min-h-screen">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Shop
        </h1>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
          <span className="text-yellow-400">⭐</span>
          <span className="text-yellow-300 font-bold text-sm">{store.stars}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-6">Spend your stars on power-ups and cosmetics</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as typeof activeTab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.value
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
            }`}
            onMouseDown={() => tg?.HapticFeedback.impactOccurred('light')}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse h-40" />
          ))}
        </div>
      )}

      {/* Items Grid */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const canAfford = store.stars >= item.price
            const isPurchasing = purchasing === item.id
            const justPurchased = purchaseSuccess === item.id

            return (
              <div
                key={item.id}
                className={`relative bg-gray-800/50 rounded-xl p-4 border transition-all ${
                  justPurchased
                    ? 'border-green-500/50 bg-green-500/10'
                    : canAfford
                    ? 'border-gray-700/50 hover:border-gray-600/50'
                    : 'border-gray-800/50 opacity-60'
                }`}
              >
                {justPurchased && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-xl z-10">
                    <span className="text-3xl">✅</span>
                  </div>
                )}

                <div className="text-center">
                  <span className="text-4xl">{item.icon}</span>
                  <h3 className="text-sm font-semibold text-gray-200 mt-2">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>

                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      item.type === 'stars' ? 'bg-yellow-500/20 text-yellow-300' :
                      item.type === 'power_up' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {item.type === 'stars' ? '⭐ Stars' : item.type === 'power_up' ? '⚡ Power' : '✨ Cosmetic'}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford || isPurchasing}
                    className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 hover:opacity-90 active:scale-95'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isPurchasing ? (
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      `⭐ ${item.price}`
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🏪</div>
          <p className="text-gray-400">No items in this category</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
        <h3 className="font-semibold text-gray-200 mb-2">How to earn stars</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• 🎮 Play the tap game and level up</li>
          <li>• 🏆 Complete achievements</li>
          <li>• 📅 Daily login bonus</li>
          <li>• ⭐ Purchase with Telegram Stars</li>
        </ul>
      </div>
    </div>
  )
}
