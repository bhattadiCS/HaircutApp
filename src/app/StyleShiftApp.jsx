import { useAppStore } from '../store/useAppStore';
import Toast from '../components/Toast';
import AuthScene from '../features/auth/AuthScene';
import { useAuthBootstrap } from '../features/auth/hooks/useAuthBootstrap';
import AuthenticatedStudioShell from './AuthenticatedStudioShell';

export default function StyleShiftApp() {
  const view = useAppStore((state) => state.view);
  const toast = useAppStore((state) => state.toast);
  const clearToast = useAppStore((state) => state.clearToast);
  const { loginWithGoogle, persistVibeSelection } = useAuthBootstrap();

  let activeScene = null;

  if (view === 'auth') {
    activeScene = <AuthScene key="auth" onLogin={loginWithGoogle} />;
  } else {
    activeScene = <AuthenticatedStudioShell persistVibeSelection={persistVibeSelection} />;
  }

  const sceneTitleByView = {
    auth: 'StyleShift authentication',
    quiz: 'Vibe Check',
    mirror: 'Mirror Mode',
    magic: 'Magic Studio',
    refine: 'Refine Studio',
    share: 'Share Studio',
  };

  const sceneTitle = sceneTitleByView[view] || 'StyleShift';

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-fuchsia-500/30">
      <main className="min-h-screen" aria-label={sceneTitle}>
        <h1 className="sr-only">{sceneTitle}</h1>
        {toast ? (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={clearToast}
          />
        ) : null}
        {activeScene}
      </main>
    </div>
  );
}