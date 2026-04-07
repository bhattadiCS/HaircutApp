import { useState } from 'react';

let firebaseModulePromise;

function loadFirebaseModule() {
  firebaseModulePromise ??= import('../../firebaseAuth');
  return firebaseModulePromise;
}

const AuthForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const module = await loadFirebaseModule();
      
      if (!module) {
        throw new Error('Could not load authentication module.');
      }

      const {
        auth,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        updateProfile,
      } = module;

      if (!auth || !signInWithEmailAndPassword || !createUserWithEmailAndPassword || !updateProfile) {
        console.error('Auth module missing required functions:', { 
          auth: !!auth, 
          signIn: !!signInWithEmailAndPassword, 
          create: !!createUserWithEmailAndPassword,
          update: !!updateProfile 
        });
        throw new Error('Authentication system is initializing. Please try again in a moment.');
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Catch "Cannot access '...' before initialization" and similar JS errors
      const errorMessage = err.message || 'An unexpected error occurred during sign-in.';
      setError(errorMessage.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }

  };

  const handleGoogleLogin = async () => {
    if (!onLogin) {
      return;
    }

    await onLogin();
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    try {
      const { auth, sendPasswordResetEmail } = await loadFirebaseModule();
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="mb-4 rounded-[1.75rem] border border-white/10 bg-slate-950/84 p-8 shadow-[0_24px_80px_rgba(2,6,23,0.3)]">
        <h1 className="mb-8 bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-center text-4xl font-semibold tracking-[-0.04em] text-transparent">StyleShift</h1>

        <form onSubmit={handleSubmit} className="space-y-3" aria-label={isLogin ? 'Log in form' : 'Sign up form'}>
          {!isLogin && (
            <div className="relative">
              <label htmlFor="auth-full-name" className="sr-only">Full Name</label>
              <input
                id="auth-full-name"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2.5 text-sm text-white placeholder-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors"
                required
              />
            </div>
          )}

          <div className="relative">
            <label htmlFor="auth-email" className="sr-only">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2.5 text-sm text-white placeholder-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="auth-password" className="sr-only">Password</label>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2.5 text-sm text-white placeholder-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950 transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:active:scale-100"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isLogin ? 'Log in' : 'Sign up')}
          </button>

          {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
          {resetSent && <p className="text-emerald-300 text-xs text-center mt-2">Password reset email sent!</p>}
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-white/20 flex-1" />
          <span className="text-xs font-semibold text-zinc-300">OR</span>
          <div className="h-px bg-white/20 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-full border border-cyan-200/18 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 transition-transform hover:scale-[1.01] hover:bg-cyan-300/14 active:scale-[0.98]"
        >
          <span className="text-lg">G</span> Log in with Google
        </button>

        {isLogin && (
          <button
            type="button"
            onClick={handleResetPassword}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full px-3 text-xs font-medium text-sky-400 transition-colors hover:text-sky-200"
          >
            Forgot password?
          </button>
        )}
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5 text-center shadow-[0_18px_56px_rgba(2,6,23,0.24)]">
        <p className="text-sm text-white">
          {isLogin ? "Don't have an account?" : 'Have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin((currentMode) => !currentMode);
              setError('');
            }}
            className="inline-flex h-11 items-center rounded-full px-3 font-bold text-sky-400 transition-colors hover:text-sky-200"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
