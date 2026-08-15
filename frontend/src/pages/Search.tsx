import { useState, useEffect, useCallback, useRef } from 'react'
import { useWebApp } from '../hooks/useWebApp'
import { useStore } from '../store/useStore'
import { searchApi } from '../api/client'
import type { SearchResult } from '../api/client'

export default function Search() {
  const { tg } = useWebApp()
  const { searchHistory, addSearchHistory } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filterType, setFilterType] = useState<string>('')
  const [filterDate, setFilterDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch suggestions as user types
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      return
    }
    try {
      const res = await searchApi.getSuggestions(q)
      setSuggestions(res.data.suggestions)
    } catch {
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchSuggestions])

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery || query).trim()
    if (!q) return

    setLoading(true)
    setError(null)
    setHasSearched(true)
    setShowSuggestions(false)
    tg?.HapticFeedback.impactOccurred('light')

    try {
      const filters: { type?: string; date?: string } = {}
      if (filterType) filters.type = filterType
      if (filterDate) filters.date = filterDate

      const res = await searchApi.search(q, filters)
      setResults(res.data.results)
      addSearchHistory(q)
    } catch (err) {
      setError('Search failed. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, filterType, filterDate, addSearchHistory, tg])

  const typeFilters = [
    { value: '', label: 'All' },
    { value: 'user', label: 'Users' },
    { value: 'game', label: 'Games' },
    { value: 'content', label: 'Content' },
  ]

  const dateFilters = [
    { value: '', label: 'Any Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ]

  return (
    <div className="p-4 pb-24 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Search
      </h1>

      {/* Search Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search anything..."
              className="w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none backdrop-blur-sm text-white placeholder-gray-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResults([]); setHasSearched(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '🔍'
            )}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className="bg-gray-800/90 rounded-xl border border-gray-700/50 mb-4 overflow-hidden backdrop-blur-sm">
          {suggestions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-gray-500 uppercase">Suggestions</div>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setQuery(s); handleSearch(s) }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                >
                  <span className="text-gray-500">🔍</span> {s}
                </button>
              ))}
            </div>
          )}
          {searchHistory.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs text-gray-500 uppercase border-t border-gray-700/50">Recent</div>
              {searchHistory.slice(0, 5).map((h, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setQuery(h); handleSearch(h) }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                >
                  <span className="text-gray-500">🕐</span> {h}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          {showFilters ? '▲' : '▼'} Filters
          {(filterType || filterDate) && (
            <span className="ml-1 px-1.5 py-0.5 bg-purple-500/30 rounded-full text-xs">
              {(filterType ? 1 : 0) + (filterDate ? 1 : 0)}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterType(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === f.value
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date</label>
              <div className="flex flex-wrap gap-2">
                {dateFilters.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterDate(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterDate === f.value
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={() => handleSearch()} className="text-red-400 text-sm font-medium hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-gray-700 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm hover:bg-gray-800/70 transition-colors cursor-pointer border border-gray-700/30 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-purple-300">{result.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{result.description}</p>
                </div>
                {result.type && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-700/50 rounded-full text-xs text-gray-400 shrink-0">
                    {result.type}
                  </span>
                )}
              </div>
              {result.date && (
                <p className="text-gray-500 text-xs mt-2">{new Date(result.date).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-400">No results found for "{query}"</p>
          <p className="text-gray-500 text-sm mt-1">Try different keywords or adjust filters</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">✨</div>
          <p className="text-gray-400">Search for anything</p>
          <p className="text-gray-500 text-sm mt-1">Results will appear here</p>
        </div>
      )}
    </div>
  )
}
