import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

// Simplified type definition
type Mode = "login" | "signup";

const AuthPage: React.FC = () => {
  const {
    user,
    isGuest,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle, // Assuming this exists in your AuthContext
    continueAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  if (user || isGuest) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!email.includes("@")) return setError("Please enter a valid email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setSubmitting(true);
    const result = mode === "login" 
      ? await signInWithEmail(email, password) 
      : await signUpWithEmail(email, password);
    
    if (result?.error) setError(result.error);
    setSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    const result = await signInWithGoogle();
    if (result?.error) setError(result.error);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl space-y-6">

          <div className="flex justify-center">
            <a href="https://bluestock.in" className="w-auto h-7">
            <img src="/src/assets/logo.png" alt="LogicLooper Logo" className="w-auto h-7 mx-auto" /></a>
          </div>
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-primary">⟳ Logic Looper</h1>
            <p className="text-sm text-muted-foreground">Daily puzzles for sharp minds</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
              </div>

              {/* Social Login */}
              <button
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-border bg-background hover:bg-accent/50 transition-all font-medium disabled:opacity-50"
              >
                <img src="https://s.yimg.com/zb/imgv1/5a4d1c5d-863e-347c-a130-3133b578f183/t_500x300" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>

              <div className="relative flex items-center gap-4">
                <div className="flex-grow border-t border-border"></div>
                <span className="text-xs text-muted-foreground uppercase">or email</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-4 focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-11 focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Get Started"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="text-center space-y-4">
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
                </button>
                
                <div className="pt-2">
                  <button
                    onClick={continueAsGuest}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;