import AuthForm from './AuthForm';

export default function AuthScene({ onLogin }) {
  return (
    <div
      className="app-screen relative flex w-full overflow-y-auto bg-transparent px-4"
      data-testid="auth-scene"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.14),transparent_18%),linear-gradient(180deg,rgba(2,6,23,0.9),rgba(2,6,23,1))]" />

      <div className="absolute inset-0 overflow-hidden opacity-50">
        <div className="absolute left-[-6rem] top-[18%] h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-[10%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div className="absolute inset-x-6 top-1/2 h-px bg-white/10" />
        <div className="absolute left-[12%] top-[20%] h-28 w-28 rounded-[2rem] border border-white/10" />
        <div className="absolute right-[14%] top-[48%] h-36 w-36 rounded-[2.5rem] border border-white/10" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 z-10 px-6 text-center"
        style={{ top: 'calc(var(--safe-area-top) + 0.75rem)' }}
      >
        <p className="mx-auto max-w-xl text-sm uppercase tracking-[0.42em] text-white/70">
          Local-first salon intelligence
        </p>
      </div>

      <div
        className="relative z-20 flex min-h-full w-full items-center justify-center"
        style={{
          paddingTop: 'calc(var(--safe-area-top) + 4.25rem)',
          paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)',
        }}
      >
        <div className="w-full max-w-sm">
          <AuthForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}