import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught UI error:', error, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
          <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-gray-400 text-sm mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
