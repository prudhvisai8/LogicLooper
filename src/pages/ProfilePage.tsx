import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { loadActivity, calculateStreak } from '@/lib/storage';
import {
    User,
    Mail,
    Calendar,
    Trophy,
    Flame,
    Brain,
    LogOut,
    Edit,
    Check,
    X,
    } from 'lucide-react';
import dayjs from 'dayjs';

    const ProfilePage: React.FC = () => {
    const { user, logout, authLoading } = useAuth();
    const navigate = useNavigate();

    const activity = loadActivity();
    const streak = calculateStreak(activity);
    const solved = Object.values(activity).filter((a) => a.solved).length;
    const totalScore = Object.values(activity).reduce((sum, a) => sum + (a.score || 0), 0);

    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

    // Optional: If you later want to save to Firebase
    const handleSaveProfile = async () => {
        if (!user) return;
        try {
        // Example: await updateProfile(user, { displayName, photoURL });
        console.log('Profile updated:', { displayName, photoURL });
        setIsEditing(false);
        } catch (err) {
        console.error('Update failed:', err);
        }
    };

    if (authLoading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
        );
    }

    if (!user) {
        return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <User className="w-16 h-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-3">Not signed in</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
            Please sign in to view and manage your profile.
            </p>
            <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition"
            >
            Sign In
            </button>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
        {/* Header / Back */}
        <header className="border-b border-border px-4 sm:px-6 py-4 sticky top-0 z-20 bg-background/80 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
            >
                ← Back
            </button>
            <h1 className="text-xl font-bold text-foreground">Your Profile</h1>
            <div className="w-10" /> {/* spacer */}
            </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
            {/* Profile Card */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
            <div className="p-8 sm:p-10 text-center space-y-6">
                {/* Avatar */}
                <div className="relative inline-block">
                {user.photoURL ? (
                    <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-background shadow-lg mx-auto"
                    />
                ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg mx-auto">
                    {user.email?.[0]?.toUpperCase() || '?'}
                    </div>
                )}

                {isEditing && (
                    <button className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow">
                    <Edit size={16} />
                    </button>
                )}
                </div>

                {/* Name & Email */}
                {isEditing ? (
                <div className="space-y-4 max-w-sm mx-auto">
                    <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="Photo URL (optional)"
                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                    >
                        <Check size={18} /> Save
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
                    >
                        <X size={18} /> Cancel
                    </button>
                    </div>
                </div>
                ) : (
                <>
                    <h2 className="text-2xl sm:text-3xl font-bold">
                    {user.displayName || 'Logic Looper User'}
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Mail size={18} />
                        <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>Joined {dayjs(user.metadata.creationTime).format('MMM D, YYYY')}</span>
                    </div>
                    </div>

                    <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:bg-accent transition text-sm font-medium"
                    >
                    <Edit size={16} /> Edit Profile
                    </button>
                </>
                )}
            </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
            >
            {[
                {
                icon: Brain,
                label: 'Puzzles Solved',
                value: solved,
                color: 'text-indigo',
                bg: 'bg-accent',
                },
                {
                icon: Flame,
                label: 'Current Streak',
                value: `${streak} day${streak !== 1 ? 's' : ''}`,
                color: 'text-primary',
                bg: 'bg-primary/10',
                },
                {
                icon: Trophy,
                label: 'Total Score',
                value: totalScore.toLocaleString(),
                color: 'text-secondary-foreground',
                bg: 'bg-secondary',
                },
            ].map(({ icon: Icon, label, value, color, bg }, i) => (
                <div
                key={i}
                className={`${bg} rounded-2xl p-6 space-y-3 text-center border border-border/50`}
                >
                <Icon className={`w-7 h-7 mx-auto ${color}`} />
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            ))}
            </motion.div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
                onClick={async () => {
                await logout();
                navigate('/');
                }}
                disabled={authLoading}
                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition w-full sm:w-auto font-medium ${
                authLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                <LogOut size={20} />
                Sign Out
            </button>

            {/* Optional future buttons: Delete account, Change password, etc. */}
            </div>
        </main>
        </div>
    );
    };

    export default ProfilePage;