import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';
import { loadActivity, calculateStreak } from '@/lib/storage';
import Logo from '@/assets/Logo.png'; 
import {
  Brain,
  Flame,
  Target,
  Play,
  LogOut,
  LogIn,
  Trophy,
  BarChart3,
  User,
  Settings
} from 'lucide-react';

const API_VERSION = import.meta.env.VITE_API_VERSION || "v1.0.0";

const HomePage: React.FC = () => {
  const { user, isGuest, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const activity = loadActivity();
  const streak = calculateStreak(activity);
  const solved = Object.values(activity).filter(a => a.solved).length;
  const totalScore = Object.values(activity).reduce((sum, a) => sum + (a.score || 0), 0);
  const todaySolved = activity[dayjs().format('YYYY-MM-DD')]?.solved || false;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img src={Logo} alt="Logic Looper Logo" className="h-9 w-auto drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300" />
          
          

          <div className="flex items-center gap-2">

            {/* Leaderboard */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {/* Profile (Only if logged in) */}
            {user && (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Auth Buttons */}
            {user ? (
              <button
                onClick={async () => {
                  const result = await logout();
                  if (result?.error) {
                    console.error(result.error);
                  }
                }}
                disabled={authLoading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-all
                  ${
                    authLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}

                <span className="hidden sm:inline">
                  {authLoading ? "Signing out..." : "Sign Out"}
                </span>
              </button>
            ) : isGuest ? (
              <a
                href="/auth"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-display font-semibold hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Hero Section */}
        <h1
            onClick={() => navigate('/')}
            className="font-display text-xl text-center font-bold text-indigo cursor-pointer"
          >
            ⟳ Logic Looper
          </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <p className="font-body text-sm text-muted-foreground">
            {dayjs().format('dddd, MMMM D, YYYY')}
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {todaySolved ? "You've completed today's puzzle!" : "Ready for today's challenge?"}
          </h2>

          <p className="font-body text-muted-foreground max-w-md mx-auto">
            {todaySolved
              ? 'Come back tomorrow for a new puzzle. Keep your streak alive!'
              : 'A fresh logic puzzle awaits. How fast can you solve it?'
            }
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/play')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              <Play className="w-5 h-5" />
              {todaySolved ? 'View Puzzle' : 'Play Now'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/leaderboard')}
              className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border text-foreground font-display font-semibold text-lg hover:bg-secondary transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              Rankings
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: Brain, label: 'Puzzles Solved', value: solved, color: 'text-indigo', bg: 'bg-accent' },
            { icon: Flame, label: 'Current Streak', value: `${streak} day${streak !== 1 ? 's' : ''}`, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: Target, label: 'Total Score', value: totalScore.toLocaleString(), color: 'text-secondary-foreground', bg: 'bg-secondary' },
          ].map(({ icon: Icon, label, value, color, bg }, i) => (
            <div key={i} className={`${bg} rounded-2xl p-6 space-y-3`}>
              <Icon className={`w-6 h-6 ${color}`} />
              <p className="font-display text-2xl font-bold text-foreground">{value}</p>
              <p className="font-body text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>
      </main>
              <footer className="mt-20 border-t border-border bg-muted/30 py-12">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start md:text-left text-center">
              
              {/* Brand & Tagline */}
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Logic Looper
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
                  Sharpen your logic daily. Build streaks. Compete globally.
                </p>
              </div>

              {/* Support / Contact */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-semibold text-foreground">Support</h4>
                <a
                  href="mailto:design@bluestock.in"
                  className="group inline-flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <div className="rounded-full bg-background p-1.5 shadow-sm ring-1 ring-border group-hover:ring-primary/50">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  design@bluestock.in
                </a>
              </div>

              {/* Legal & Meta */}
              <div className="flex flex-col gap-2 md:items-end">
                <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                  <a href="/terms" className="hover:underline">Terms</a>
                  <a href="/privacy" className="hover:underline">Privacy</a>
                </div>
                <p className="text-xs text-muted-foreground/60">
                  © {new Date().getFullYear()} Logic Looper. All rights reserved.
                </p>
                {import.meta.env.DEV && (
                  <span className="mt-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/40">
                    v{API_VERSION} • {import.meta.env.MODE}
                  </span>
                )}
              </div>

            </div>
          </div>
        </footer>
    </div>
  );
};

export default HomePage;
