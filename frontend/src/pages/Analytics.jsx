import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { emotionAPI } from '../services/api';
import { MoodTrendChart, EmotionFrequencyChart, EmotionDistributionChart, MentalHealthGauge } from '../components/Chart';
import { useAuth } from '../context/AuthContext';
import { EMOTION_LABELS, getEmotionEmoji, getMHIStatus, countEmotions, formatDate, getEmotionScore, calculateMHI } from '../utils/emotionHelpers';
import { Brain, TrendingUp, BarChart3, PieChart, ChevronDown, Loader2 } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [days, setDays] = useState(7);
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const isoCutoff = cutoffDate.toISOString();

      const { data: historyRes, error } = await supabase
        .from('emotions')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', isoCutoff);
        
      if (error) throw error;

      let totalScore = 0;
      historyRes.forEach(item => {
        item.emotion_score = getEmotionScore(item.emotion);
        totalScore += item.emotion_score;
      });
      const avgScore = historyRes.length ? totalScore / historyRes.length : 0;

      setAnalytics({
        mental_health_index: calculateMHI(avgScore),
        average_emotion_score: avgScore,
        total_entries: historyRes.length
      });
      setHistory(historyRes || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const emotionCounts = countEmotions(history);
  const frequencyData = EMOTION_LABELS.map(emotion => ({
    emotion,
    count: emotionCounts[emotion] || 0,
  }));

  const distributionData = EMOTION_LABELS.map(emotion => ({
    emotion,
    count: emotionCounts[emotion] || 0,
  }));

  // Group by date for trend
  const trendData = (() => {
    const grouped = {};
    history.forEach(h => {
      const date = formatDate(h.timestamp || h.created_at);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(h.emotion_score || 0);
    });
    return Object.entries(grouped).map(([date, scores]) => ({
      date,
      score: scores.reduce((a, b) => a + b, 0) / scores.length,
    })).reverse();
  })();

  const mhi = analytics?.mental_health_index || 50;
  const mhiStatus = getMHIStatus(mhi);
  const avgScore = analytics?.average_emotion_score || 0;
  const totalEntries = analytics?.total_entries || 0;

  // Find most frequent emotion
  const mostFrequent = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0];

  const daysOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 14, label: 'Last 14 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="page-header mb-0">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Your emotional patterns and insights</p>
        </div>

        {/* Days selector */}
        <div className="relative">
          <button
            onClick={() => setShowDaysDropdown(!showDaysDropdown)}
            className="btn-secondary flex items-center gap-2"
            id="days-selector"
          >
            {daysOptions.find(o => o.value === days)?.label}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showDaysDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-20 overflow-hidden animate-slide-down">
              {daysOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setDays(opt.value); setShowDaysDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-dark-700 transition-colors ${
                    days === opt.value ? 'text-primary-400 bg-dark-700/50' : 'text-dark-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* MHI Gauge */}
        <div className="card flex flex-col items-center justify-center py-6">
          <Brain className="w-6 h-6 text-dark-400 mb-3" />
          <MentalHealthGauge value={Math.round(mhi)} status={mhiStatus} />
        </div>

        {/* Quick Stats */}
        <div className="card flex flex-col justify-center space-y-4">
          <div>
            <p className="text-xs text-dark-500 font-semibold uppercase tracking-wider">Total Entries</p>
            <p className="text-3xl font-bold text-white">{totalEntries}</p>
          </div>
          <div>
            <p className="text-xs text-dark-500 font-semibold uppercase tracking-wider">Avg Score</p>
            <p className="text-3xl font-bold text-primary-400">{avgScore.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs text-dark-500 font-semibold uppercase tracking-wider">Most Frequent</p>
            <p className="text-xl font-bold text-white flex items-center gap-2">
              <span>{getEmotionEmoji(mostFrequent?.[0])}</span>
              {mostFrequent?.[0] || 'N/A'}
            </p>
          </div>
        </div>

        {/* Mood Trend */}
        <div className="card sm:col-span-1">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-dark-400" />
            Mood Trend
          </h3>
          <MoodTrendChart data={trendData} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency */}
        <div className="card">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-dark-400" />
            Emotion Frequency
          </h3>
          <EmotionFrequencyChart data={frequencyData} />
        </div>

        {/* Distribution */}
        <div className="card">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-dark-400" />
            Emotion Distribution
          </h3>
          <EmotionDistributionChart data={distributionData} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
