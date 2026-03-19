export const EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise'];

export const EMOTION_SCORES = {
  Angry: -1,
  Disgust: -1,
  Fear: -1,
  Happy: 2,
  Neutral: 0,
  Sad: -2,
  Surprise: 1,
};

export const EMOTION_EMOJIS = {
  Angry: '😠',
  Disgust: '🤢',
  Fear: '😨',
  Happy: '😊',
  Neutral: '😐',
  Sad: '😢',
  Surprise: '😲',
};

export const EMOTION_COLORS = {
  Angry: '#ef4444',
  Disgust: '#84cc16',
  Fear: '#a855f7',
  Happy: '#facc15',
  Neutral: '#94a3b8',
  Sad: '#3b82f6',
  Surprise: '#f97316',
};

export const getEmotionEmoji = (emotion) => EMOTION_EMOJIS[emotion] || '❓';
export const getEmotionColor = (emotion) => EMOTION_COLORS[emotion] || '#94a3b8';
export const getEmotionScore = (emotion) => EMOTION_SCORES[emotion] ?? 0;

export const calculateMHI = (avgScore) => {
  return Math.round(((avgScore + 2) / 4) * 100);
};

export const getMHIStatus = (mhi) => {
  if (mhi >= 76) return { label: 'Excellent', color: '#22c55e', bgColor: 'bg-emerald-500/15', textColor: 'text-emerald-400' };
  if (mhi >= 56) return { label: 'Good', color: '#3b82f6', bgColor: 'bg-blue-500/15', textColor: 'text-blue-400' };
  if (mhi >= 31) return { label: 'Moderate', color: '#f97316', bgColor: 'bg-primary-500/15', textColor: 'text-primary-400' };
  return { label: 'Low', color: '#ef4444', bgColor: 'bg-red-500/15', textColor: 'text-red-400' };
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateStr) => {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
};

export const groupEmotionsByDate = (emotions) => {
  const grouped = {};
  emotions.forEach((e) => {
    const date = formatDate(e.timestamp || e.created_at);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(e);
  });
  return grouped;
};

export const countEmotions = (emotions) => {
  const counts = {};
  EMOTION_LABELS.forEach(l => counts[l] = 0);
  emotions.forEach((e) => {
    if (counts[e.emotion] !== undefined) {
      counts[e.emotion]++;
    }
  });
  return counts;
};
