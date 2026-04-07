import { Component } from 'react';
import {
  isRecoverableAssetLoadError,
  recoverFromAssetLoadError,
  resetAssetRecoveryMarker,
} from './errorRecovery';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canRecover: false,
      hasError: false,
      error: null,
      isRecovering: false,
    };

    this.handleRecovery = this.handleRecovery.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      canRecover: isRecoverableAssetLoadError(error),
      hasError: true,
      error,
    };
  }

  componentDidMount() {
    resetAssetRecoveryMarker();
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught application error:', error, errorInfo);

    if (isRecoverableAssetLoadError(error)) {
      void this.handleRecovery(true);
    }
  }

  async handleRecovery(isAutomatic = false) {
    if (this.state.isRecovering) {
      return;
    }

    this.setState({ isRecovering: true });

    const didRecover = await recoverFromAssetLoadError();

    if (!didRecover && !isAutomatic) {
      this.setState({ isRecovering: false });
    }
  }

  render() {
    if (this.state.hasError) {
      const actionLabel = this.state.canRecover ? 'Repair and Reload' : 'Reload App';
      const title = this.state.canRecover ? 'App update required.' : 'Something went wrong.';

      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-red-950 px-6 text-white">
          <h1 className="mb-4 text-3xl font-semibold">{title}</h1>
          {this.state.canRecover ? (
            <p className="max-w-xl text-center text-sm text-white/80">
              A cached app bundle is out of date. Clearing the stale assets and reloading should restore the latest deployed build.
            </p>
          ) : null}
          <pre className="max-w-full overflow-auto rounded-2xl bg-black/40 p-4 text-xs text-white/80">
            {this.state.error?.toString()}
          </pre>
          <button
            type="button"
            onClick={() => {
              if (this.state.canRecover) {
                void this.handleRecovery();
                return;
              }

              window.location.reload();
            }}
            disabled={this.state.isRecovering}
            className="mt-8 rounded-full bg-white px-6 py-3 font-semibold text-red-950 transition-transform hover:scale-[1.02] active:scale-[0.97]"
          >
            {this.state.isRecovering ? 'Refreshing latest build...' : actionLabel}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}