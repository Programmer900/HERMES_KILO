import { useState } from 'react'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{id: number, title: string, description: string}>>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    
    // TODO: Connect to backend API
    // const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    // const data = await response.json()
    
    // Mock data for now
    setTimeout(() => {
      setResults([
        { id: 1, title: 'Result 1', description: 'This is a sample search result' },
        { id: 2, title: 'Result 2', description: 'Another example result for testing' },
        { id: 3, title: 'Result 3', description: 'More results will appear here' },
      ])
      setLoading(false)
    }, 500)
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
        Search
      </h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm hover:bg-gray-800/70 transition-colors cursor-pointer"
            >
              <h3 className="font-semibold text-purple-400">{result.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{result.description}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-8 text-gray-400">
          No results found
        </div>
      )}
    </div>
  )
}
