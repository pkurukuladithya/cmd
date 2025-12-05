import { useEffect, useMemo, useState } from 'react';
import * as authService from './services/authService';
import type { User } from './types';

type PendingGoogle = {
  email: string;
  name?: string;
  avatar?: string;
  googleId: string;
};

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
  const [user, setUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState<string>('home');
  const [pendingGoogle, setPendingGoogle] = useState<PendingGoogle | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Google redirect token and pending signup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('token');
    const name = params.get('name') || undefined;
    const email = params.get('email') || undefined;
    const avatar = params.get('avatar') || undefined;
    const googleId = params.get('googleId') || undefined;
    const newUser = params.get('newUser');

    if (googleToken) {
      localStorage.setItem('authToken', googleToken);
      setAuthSuccess('Signed in with Google');
      setAuthError(null);
      params.delete('token');
      params.delete('email');
      params.delete('name');
      params.delete('avatar');
      params.delete('googleId');
      params.delete('newUser');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({}, '', newUrl);
      void hydrateProfile();
    } else if (newUser === 'true' && email && googleId) {
      setPendingGoogle({ email, name, avatar, googleId });
      params.delete('newUser');
      params.delete('email');
      params.delete('name');
      params.delete('avatar');
      params.delete('googleId');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({}, '', newUrl);
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

  const handleGoogleSignIn = async () => {
    try {
      const url = await authService.getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      setAuthError('Google sign-in is not configured.');
    }
  };

  const completeGoogleSignup = async () => {
    if (!pendingGoogle) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const { token, user: newUser } = await authService.completeGoogleSignup({
        ...pendingGoogle,
        name: pendingGoogle.name ?? 'New CMD Learner',
      });
      localStorage.setItem('authToken', token);
      setUser(newUser);
      setPendingGoogle(null);
      setAuthSuccess('Account created. Welcome to CMD Chemistry!');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to complete Google signup';
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setPendingGoogle(null);
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
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                    />
                  )}
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
                  onClick={handleGoogleSignIn}
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
              {user ? (
                <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                  {user.avatar && (
                    <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="text-sm text-slate-300">Welcome back</p>
                    <p className="text-xl font-semibold">{user.name}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleGoogleSignIn}
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
              )}
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-blue-900/30">
              <p className="text-sm text-blue-300 uppercase tracking-[0.3em] mb-3">Google Sign up</p>
              <p className="text-slate-300 mb-4">
                Sign up with Google. We check if your email exists; if yes, you land on your welcome page. If not, we
                prompt you to finish signup.
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 rounded-lg bg-white text-slate-900 font-semibold hover:-translate-y-0.5 transition shadow-lg shadow-white/10"
              >
                Continue with Google
              </button>
              {authError && <p className="text-red-300 text-sm mt-3">{authError}</p>}
              {authSuccess && <p className="text-emerald-300 text-sm mt-3">{authSuccess}</p>}
            </div>
          </section>

          {pendingGoogle && !user && (
            <section
              id="auth"
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                {pendingGoogle.avatar && (
                  <img
                    src={pendingGoogle.avatar}
                    alt={pendingGoogle.name || pendingGoogle.email}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm text-slate-300">Complete Google signup</p>
                  <p className="text-lg font-semibold text-white">{pendingGoogle.name || 'New user'}</p>
                  <p className="text-slate-400 text-sm">{pendingGoogle.email}</p>
                </div>
              </div>
              <p className="text-slate-300">
                We didn&apos;t find this email in CMD yet. Confirm to create your account and continue.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={completeGoogleSignup}
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-semibold transition disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating...' : 'Complete signup'}
                </button>
                <button
                  onClick={() => setPendingGoogle(null)}
                  className="px-5 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white"
                >
                  Cancel
                </button>
              </div>
              {authError && <p className="text-red-300 text-sm">{authError}</p>}
            </section>
          )}

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
