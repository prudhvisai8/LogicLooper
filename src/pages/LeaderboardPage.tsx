import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you still have a local Auth provider
import { Trophy, Medal, ArrowLeft, Crown } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_score: number;
  puzzles_solved: number;
  rank: number;
}

const API_BASE_URL = 'https://ep-late-rice-ainifhcp.apirest.c-4.us-east-1.aws.neon.tech/neondb/rest/v1'; // Replace with your actual API

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'today'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Standard fetch call to your backend
      const response = await fetch(`${API_BASE_URL}/leaderboard?timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${yourToken}` // Add if your API requires auth
        },
      });

      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data: LeaderboardEntry[] = await response.json();
      
      // We assume the backend already sorts and ranks these. 
      // If not, you can keep the .sort() logic from your original code.
      setEntries(data.slice(0, 50));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="font-display text-sm text-muted-foreground w-5 text-center">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">Leaderboard</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Timeframe Tabs */}
        <div className="flex gap-2">
          {(['all', 'week', 'today'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              className={`px-4 py-2 rounded-xl font-display text-sm font-medium transition-colors ${
                timeframe === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {key === 'all' ? 'All Time' : key === 'week' ? 'This Week' : 'Today'}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="font-body text-sm text-muted-foreground mt-3">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="font-body text-muted-foreground">No scores yet for this timeframe.</p>
            <button
              onClick={() => navigate('/play')}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Be the first!
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const isCurrentUser = user?.id === entry.user_id;
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
                    isCurrentUser
                      ? 'bg-primary/5 border-primary/20'
                      : entry.rank <= 3
                      ? 'bg-card border-border shadow-sm'
                      : 'bg-card/50 border-border'
                  }`}
                >
                  <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-display text-sm font-semibold truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                      {entry.display_name}
                      {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {entry.puzzles_solved} puzzle{entry.puzzles_solved !== 1 ? 's' : ''} solved
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-foreground">
                      {entry.total_score.toLocaleString()}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">points</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;