import { type FormEvent, useEffect, useMemo, useState } from 'react';
import * as authService from './services/authService';
import type { User } from './types';

const navItems = [
  { label: 'Home', target: 'home' },
  { label: 'Assignments', target: 'assignments' },
  { label: 'Classes', target: 'classes' },
  { label: 'About Us', target: 'about' },
];

const sectionCopy: Record<string, { title: string; body: string }> = {
  assignments: {
    title: 'Assignments',
    body: 'Track lab reports, quizzes, and projects in a single stream. CMD cues due dates and grading status.',
  },
  classes: {
    title: 'Classes',
    body: 'Join synchronous or self-paced classes, keep attendance tidy, and surface key chemistry resources.',
  },
  about: {
    title: 'About CMD',
    body: 'Chemistry by CMD is a lean LMS designed for fast onboarding, Google-first sign up, and intuitive navigation.',
  },
};

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState<string>('home');

  // Handle Google redirect token, if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('token');
    const name = params.get('name');
    if (googleToken) {
      localStorage.setItem('authToken', googleToken);
      setAuthSuccess('Signed in with Google');
      setAuthError(null);
      params.delete('token');
      params.delete('email');
      params.delete('name');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({}, '', newUrl);
      void hydrateProfile();
      if (name) setAuthForm((f) => ({ ...f, name }));
    }
  }, []);

  const hydrateProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) void hydrateProfile();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveNav(visible[0].target.id);
      },
      { threshold: [0.35, 0.6] }
    );
    navItems.map((item) => item.target).forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleAuthSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);
    try {
      if (authMode === 'register') {
        const { token, user: newUser } = await authService.register(
          authForm.name,
          authForm.email,
          authForm.password
        );
        localStorage.setItem('authToken', token);
        setUser(newUser);
        setAuthSuccess('Account created. Welcome to CMD Chemistry!');
      } else {
        const { token, user: newUser } = await authService.login(authForm.email, authForm.password);
        localStorage.setItem('authToken', token);
        setUser(newUser);
        setAuthSuccess('Signed in successfully.');
      }
      setAuthForm({ name: '', email: '', password: '' });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Authentication failed';
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const url = await authService.getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      setAuthError('Google sign-in is not configured.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const navLinks = useMemo(
    () =>
      navItems.map((item) => (
        <button
          key={item.target}
          onClick={() => scrollToSection(item.target)}
          className={`px-3 py-2 text-sm font-medium transition ${
            activeNav === item.target ? 'text-white border-b-2 border-blue-400' : 'text-slate-300 hover:text-white'
          }`}
        >
          {item.label}
        </button>
      )),
    [activeNav]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/70 border-b border-slate-800 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-lg font-bold">C</div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Chemistry by CMD</p>
                <p className="text-sm text-slate-300">Lean LMS for labs and lectures</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">{navLinks}</nav>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-slate-300">Hi, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm hover:bg-slate-700 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => scrollToSection('auth')}
                  className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-sm font-semibold transition shadow-lg shadow-blue-500/20"
                >
                  Sign up
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 flex md:hidden items-center justify-center gap-1">{navLinks}</div>
        </header>

        <main className="space-y-24 py-16">
          <section id="home" className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300 mb-3">Welcome</p>
              <h1 className="text-4xl font-bold leading-tight mb-4">
                Welcome to <span className="text-blue-400">Chemistry by CMD</span> LMS
              </h1>
              <p className="text-lg text-slate-300 mb-6">
                Fast onboarding, Google-first sign up, and a clean flow through Home, Assignments, Classes, and About.
                Scroll smoothly or jump via the nav to preview each area.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => scrollToSection('auth')}
                  className="px-5 py-3 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-semibold transition shadow-lg shadow-blue-500/20"
                >
                  Get started
                </button>
                <button
                  onClick={() => scrollToSection('assignments')}
                  className="px-5 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white transition"
                >
                  View sections
                </button>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-blue-900/30">
              <p className="text-sm text-blue-300 uppercase tracking-[0.3em] mb-3">Auth</p>
              <div className="flex gap-2 mb-4">
                <button
                  className={`flex-1 py-2 rounded-lg transition ${
                    authMode === 'login' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  className={`flex-1 py-2 rounded-lg transition ${
                    authMode === 'register' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>
              <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth">
                {authMode === 'register' && (
                  <div>
                    <label className="text-sm text-slate-300">Full name</label>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(e) => setAuthForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Alex Rivers"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-slate-300">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                {authError && <p className="text-red-300 text-sm">{authError}</p>}
                {authSuccess && <p className="text-emerald-300 text-sm">{authSuccess}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-400 transition text-white font-semibold disabled:opacity-70"
                >
                  {isSubmitting
                    ? authMode === 'login'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : authMode === 'login'
                    ? 'Login'
                    : 'Register'}
                </button>
              </form>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs text-slate-400 uppercase tracking-[0.2em]">or</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 rounded-lg bg-white text-slate-900 font-semibold hover:-translate-y-0.5 transition shadow-lg shadow-white/10"
              >
                Continue with Google
              </button>
              <p className="text-xs text-slate-400 mt-2">
                Google Auth signs you in and redirects back here automatically.
              </p>
            </div>
          </section>

          <section
            id="assignments"
            className="grid lg:grid-cols-2 gap-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-8"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300 mb-2">Assignments</p>
              <h2 className="text-3xl font-semibold mb-3">{sectionCopy.assignments.title}</h2>
              <p className="text-slate-300">{sectionCopy.assignments.body}</p>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 text-slate-300">
              <p className="font-semibold text-white mb-2">Preview</p>
              <p>This is the assignments page. You can connect tasks, due dates, and grading flows here later.</p>
            </div>
          </section>

          <section
            id="classes"
            className="grid lg:grid-cols-2 gap-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-8"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300 mb-2">Classes</p>
              <h2 className="text-3xl font-semibold mb-3">{sectionCopy.classes.title}</h2>
              <p className="text-slate-300">{sectionCopy.classes.body}</p>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 text-slate-300">
              <p className="font-semibold text-white mb-2">Preview</p>
              <p>This is the classes page. Add schedules, recordings, and attendance once you wire the data.</p>
            </div>
          </section>

          <section id="about" className="grid lg:grid-cols-2 gap-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300 mb-2">About</p>
              <h2 className="text-3xl font-semibold mb-3">{sectionCopy.about.title}</h2>
              <p className="text-slate-300">{sectionCopy.about.body}</p>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 text-slate-300">
              <p className="font-semibold text-white mb-2">Preview</p>
              <p>This is the about page. Drop your team story, mission, and lab highlights here.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
