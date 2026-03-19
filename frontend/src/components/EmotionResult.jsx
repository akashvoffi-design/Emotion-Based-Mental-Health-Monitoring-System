import { getEmotionEmoji, getEmotionColor } from '../utils/emotionHelpers';
import { HelpCircle } from 'lucide-react';

const EmotionResult = ({ result }) => {
  if (!result || result.error) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-4 opacity-30">❓</div>
        <p className="text-dark-400 text-sm">
          {result?.error || 'Capture an image to detect your emotion'}
        </p>
      </div>
    );
  }

  const emoji = getEmotionEmoji(result.emotion);
  const color = getEmotionColor(result.emotion);
  const confidence = Math.round((result.confidence || 0) * 100);

  return (
    <div className="card animate-scale-in">
      <div className="flex flex-col items-center text-center py-6">
        {/* Emotion Emoji */}
        <div
          className="text-6xl mb-4 drop-shadow-lg"
          style={{ filter: `drop-shadow(0 0 20px ${color}40)` }}
        >
          {emoji}
        </div>

        {/* Emotion Label */}
        <h3 className="text-2xl font-bold text-white mb-1">{result.emotion}</h3>

        {/* Confidence */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-32 h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full progress-bar-animated"
              style={{
                width: `${confidence}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-sm text-dark-400 font-medium">{confidence}%</span>
        </div>

        {/* Score badge */}
        <div
          className="badge"
          style={{
            backgroundColor: `${color}20`,
            color: color,
            borderColor: `${color}30`,
            border: '1px solid',
          }}
        >
          Score: {result.emotion_score}
        </div>
      </div>

      {/* All emotions breakdown */}
      {result.all_emotions && (
        <div className="border-t border-dark-700/50 pt-4 mt-2">
          <p className="text-xs text-dark-500 mb-3 font-medium uppercase tracking-wider">All Predictions</p>
          <div className="space-y-2">
            {Object.entries(result.all_emotions)
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, conf]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <span className="text-sm w-5">{getEmotionEmoji(emotion)}</span>
                  <span className="text-xs text-dark-400 w-16">{emotion}</span>
                  <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(conf * 100)}%`,
                        backgroundColor: getEmotionColor(emotion),
                      }}
                    />
                  </div>
                  <span className="text-xs text-dark-500 w-10 text-right">
                    {Math.round(conf * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionResult;
