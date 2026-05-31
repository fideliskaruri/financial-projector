import { Component, type ErrorInfo, type ReactNode } from "react"

type ErrorBoundaryProps = {
  children: ReactNode
  onRetry?: () => void
}

type ErrorBoundaryState = {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Screen rendering failed", error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[calc(100dvh-12rem)] items-center justify-center px-4 py-8">
          <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-6 text-center shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">This screen hit a loading problem.</p>
              <h2 className="text-xl font-semibold">Try reloading the app</h2>
              <p className="text-sm text-muted-foreground">Your data is still saved locally. Reloading usually fixes stale or failed chunks.</p>
            </div>
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
