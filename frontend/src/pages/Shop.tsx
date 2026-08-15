import { useState } from 'react'
import { useStore } from '../lib/store'

const SHOP_ITEMS = [
  { id: 'stars-100', name: '100 Stars', price: '$0.99', stars: 100, icon: '⭐', popular: false },
  { id: 'stars-500', name: '500 Stars', price: '$3.99', stars: 500, icon: '⭐⭐', popular: true },
  { id: 'stars-1000', name: '1000 Stars', price: '$6.99', stars: 1000, icon: '⭐⭐⭐', popular: false },
  { id: 'power-2x', name: '2x Points', price: '50 ⭐', stars: -50, icon: '⚡', popular: false },
  { id: 'power-5x', name: '5x Points', price: '200 ⭐', stars: -200, icon: '💥', popular: false },
  { id: 'power-auto', name: 'Auto Tap', price: '500 ⭐', stars: -500, icon: '🤖', popular: false },
  { id: 'skin-gold', name: 'Gold Theme', price: '300 ⭐', stars: -300, icon: '👑', popular: false },
  { id: 'skin-neon', name: 'Neon Theme', price: '250 ⭐', stars: -250, icon: '🌈', popular: false },
]

export default function Shop() {
  const [buying, setBuying] = useState<string | null>(null)
  const { user } = useStore()

  const handleBuy = async (itemId: string) => {
    setBuying(itemId)
    // Simulate purchase
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setBuying(null)
    // TODO: Connect to backend API
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-500 to-pink-600 bg-clip-text text-transparent">
        Shop
      </h1>
      <p className="text-gray-400 text-sm mb-6">Buy stars, power-ups and themes</p>

      {/* Balance */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-pink-500/10 rounded-2xl p-4 mb-6 border border-yellow-500/20">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Your balance</span>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-2xl">⭐</span>
            <span className="text-2xl font-bold">{user?.starsBalance || 0}</span>
          </div>
        </div>
      </div>

      {/* Stars packages */}
      <h2 className="text-lg font-bold mb-3">⭐ Buy Stars</h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {SHOP_ITEMS.filter((i) => i.stars > 0).map((item) => (
          <button
            key={item.id}
            onClick={() => handleBuy(item.id)}
            disabled={buying === item.id}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
              item.popular
                ? 'bg-gradient-to-br from-yellow-500/20 to-pink-500/20 border-2 border-yellow-500/50'
                : 'bg-gray-800/50 border border-gray-700'
            } hover:scale-105 active:scale-95 disabled:opacity-50`}
          >
            {item.popular && (
              <span className="absolute -top-2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full">
                POPULAR
              </span>
            )}
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-bold">{item.name}</span>
            <span className="text-xs text-gray-400">{item.price}</span>
          </button>
        ))}
      </div>

      {/* Power-ups */}
      <h2 className="text-lg font-bold mb-3">⚡ Power-ups</h2>
      <div className="space-y-3 mb-8">
        {SHOP_ITEMS.filter((i) => i.stars < 0 && !i.name.includes('Theme')).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm"
          >
            <span className="text-3xl">{item.icon}</span>
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs text-gray-400">Temporary boost</div>
            </div>
            <button
              onClick={() => handleBuy(item.id)}
              disabled={buying === item.id}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {buying === item.id ? '...' : item.price}
            </button>
          </div>
        ))}
      </div>

      {/* Themes */}
      <h2 className="text-lg font-bold mb-3">🎨 Themes</h2>
      <div className="grid grid-cols-2 gap-3">
        {SHOP_ITEMS.filter((i) => i.name.includes('Theme')).map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm text-center"
          >
            <span className="text-4xl">{item.icon}</span>
            <div className="font-semibold mt-2">{item.name}</div>
            <button
              onClick={() => handleBuy(item.id)}
              className="mt-2 px-4 py-1.5 bg-gray-700 rounded-lg text-xs font-bold hover:bg-gray-600 transition-colors"
            >
              {item.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
