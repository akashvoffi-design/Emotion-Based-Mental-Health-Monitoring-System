import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { emotionAPI } from '../services/api';
import EmotionDetector from '../components/EmotionDetector';
import EmotionResult from '../components/EmotionResult';
import WellnessSuggestion from '../components/WellnessSuggestion';
import { 
  getEmotionEmoji, getEmotionColor, calculateMHI, getMHIStatus, countEmotions, getEmotionScore 
} from '../utils/emotionHelpers';
import { Activity as ActivityIcon, Brain as BrainIcon, TrendingUp as TrendingUpIcon, Sparkles as SparklesIcon } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [emotionResult, setEmotionResult] = useState(null);
  const [todayEmotions, setTodayEmotions] = useState([]);
  const [stats, setStats] = useState({ total: 0, mhi: 50, weekTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      if (!user?.id) return;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      const isoCutoff = cutoffDate.toISOString();

      const { data, error } = await supabase
        .from('emotions')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', isoCutoff);

      if (error) throw error;
      const historyRes = data || [];
      
      const todayCutoffDate = new Date();
      todayCutoffDate.setDate(todayCutoffDate.getDate() - 1);
      const todayHistory = historyRes.filter(entry => new Date(entry.timestamp) > todayCutoffDate);
      
      setTodayEmotions(todayHistory);

      let totalScore = 0;
      historyRes.forEach(item => {
        totalScore += getEmotionScore(item.emotion);
      });
      const avgScore = historyRes.length ? totalScore / historyRes.length : 0;
      const mhi = calculateMHI(avgScore);

      setStats({
        total: todayHistory.length,
        mhi: Number.isFinite(mhi) && historyRes.length > 0 ? mhi : 50,
        weekTotal: historyRes.length,
        avgScore: avgScore,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionDetected = async (result) => {
    setEmotionResult(result);
    if (!result.error && user?.id) {
      try {
        await supabase.from('emotions').insert([
          {
            user_id: user.id,
            emotion: result.emotion,
            confidence: result.confidence,
          }
        ]);
        fetchTodayData(); // Refresh stats
      } catch (err) {
        console.error('Failed to log emotion:', err);
      }
    }
  };

  const mhiStatus = getMHIStatus(stats.mhi);
  const emotionCounts = countEmotions(todayEmotions);

  // Import these from the helpers
  const getEmoji = (emotion) => {
    const emojis = { Angry: '😠', Disgust: '🤢', Fear: '😨', Happy: '😊', Neutral: '😐', Sad: '😢', Surprise: '😲' };
    return emojis[emotion] || '❓';
  };
  const getColor = (emotion) => {
    const colors = { Angry: '#ef4444', Disgust: '#84cc16', Fear: '#a855f7', Happy: '#facc15', Neutral: '#94a3b8', Sad: '#3b82f6', Surprise: '#f97316' };
    return colors[emotion] || '#94a3b8';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Hello, <span className="text-gradient">{user?.name || 'there'}</span>
        </h1>
        <p className="page-subtitle">How are you feeling today?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Webcam */}
        <div className="lg:col-span-5">
          <EmotionDetector onEmotionDetected={handleEmotionDetected} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="stat-card">
              <ActivityIcon className="w-5 h-5 text-dark-400 mb-2" />
              <span className="text-2xl font-bold text-white">{stats.total}</span>
              <span className="text-xs text-dark-400 mt-1">Today</span>
            </div>
            <div className="stat-card">
              <BrainIcon className="w-5 h-5 text-dark-400 mb-2" />
              <span className="text-2xl font-bold text-primary-400">{stats.mhi.toFixed(1)}</span>
              <span className="text-xs text-dark-400 mt-1">MHI Score</span>
            </div>
            <div className="stat-card">
              <TrendingUpIcon className="w-5 h-5 text-dark-400 mb-2" />
              <span className="text-2xl font-bold text-white">{stats.weekTotal}</span>
              <span className="text-xs text-dark-400 mt-1">This Week</span>
            </div>
            <div className="stat-card">
              <SparklesIcon className="w-5 h-5 text-dark-400 mb-2" />
              <span className={`text-lg font-bold ${mhiStatus.textColor}`}>{mhiStatus.label}</span>
              <span className="text-xs text-dark-400 mt-1">Status</span>
            </div>
          </div>

          {/* Mental Health Index Bar */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <BrainIcon className="w-4 h-4 text-dark-400" />
                Mental Health Index
              </h3>
              <span className={`badge ${mhiStatus.bgColor} ${mhiStatus.textColor} border ${mhiStatus.textColor.replace('text-', 'border-').replace('400', '500/20')}`}>
                {mhiStatus.label}
              </span>
            </div>
            <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-bar-animated transition-all duration-1000"
                style={{
                  width: `${Math.min(stats.mhi, 100)}%`,
                  backgroundColor: mhiStatus.color,
                }}
              />
            </div>
            <p className="text-xs text-dark-500 mt-2">Keep tracking your mood</p>
          </div>

          {/* Emotion Result */}
          <EmotionResult result={emotionResult} />
        </div>
      </div>

      {/* Bottom Row: Wellness Tips + Today's Emotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <WellnessSuggestion emotion={emotionResult?.emotion} />

        {/* Today's Emotions */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Today's Emotions</h3>
          <div className="space-y-3">
            {['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise'].map((emotion) => {
              const count = emotionCounts[emotion] || 0;
              const maxCount = Math.max(...Object.values(emotionCounts), 1);
              const percentage = (count / maxCount) * 100;

              return (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="text-lg w-7">{getEmoji(emotion)}</span>
                  <span className="text-sm text-dark-300 w-16 font-medium">{emotion}</span>
                  <div className="flex-1 h-2.5 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="emotion-bar h-full progress-bar-animated"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getColor(emotion),
                      }}
                    />
                  </div>
                  <span className="text-xs text-dark-500 w-8 text-right font-medium">{count}x</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
