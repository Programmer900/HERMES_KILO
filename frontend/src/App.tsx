import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WebAppProvider } from './hooks/useWebApp'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Game from './pages/Game'
import Search from './pages/Search'
import Navigation from './components/Navigation'

function App() {
  return (
    <ErrorBoundary>
      <WebAppProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/game" element={<Game />} />
              <Route path="/search" element={<Search />} />
            </Routes>
            <Navigation />
          </div>
        </BrowserRouter>
      </WebAppProvider>
    </ErrorBoundary>
  )
}

export default App
