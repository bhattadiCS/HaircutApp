import AppProviders from './app/AppProviders';
import ErrorBoundary from './app/ErrorBoundary';
import StyleShiftApp from './app/StyleShiftApp';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <StyleShiftApp />
      </AppProviders>
    </ErrorBoundary>
  );
}
