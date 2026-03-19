import { Lightbulb, AlertTriangle } from 'lucide-react';
import { getWellnessSuggestions, getRandomTips } from '../utils/wellnessSuggestions';

const WellnessSuggestion = ({ emotion }) => {
  const data = getWellnessSuggestions(emotion || 'Neutral');
  const tips = emotion ? getRandomTips(emotion, 2) : data.tips.slice(0, 2);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary-400" />
        <h3 className="font-semibold text-white">Wellness Tips</h3>
      </div>

      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-xl bg-dark-900/50 border border-dark-700/30"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center text-xs font-semibold text-dark-400">
              {index + 1}
            </span>
            <p className="text-sm text-dark-300 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>

      {data.resources && data.resources.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Resources</span>
          </div>
          {data.resources.map((resource, i) => (
            <p key={i} className="text-xs text-dark-400">
              {resource.name} — {resource.note}
            </p>
          ))}
        </div>
      )}

      <p className="text-xs text-dark-600 mt-4">
        This is NOT a medical diagnostic tool. For professional help, contact a mental health provider.
      </p>
    </div>
  );
};

export default WellnessSuggestion;
