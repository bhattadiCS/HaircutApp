import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-red-950 px-6 text-white">
          <h1 className="mb-4 text-3xl font-semibold">Something went wrong.</h1>
          <pre className="max-w-full overflow-auto rounded-2xl bg-black/40 p-4 text-xs text-white/80">
            {this.state.error?.toString()}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 rounded-full bg-white px-6 py-3 font-semibold text-red-950 transition-transform hover:scale-[1.02] active:scale-[0.97]"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}