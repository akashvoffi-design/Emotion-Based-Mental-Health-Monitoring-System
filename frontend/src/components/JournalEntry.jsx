import { getEmotionEmoji, getEmotionColor, formatDate, formatTime } from '../utils/emotionHelpers';
import { Edit3, Trash2, Tag } from 'lucide-react';

const JournalEntry = ({ entry, onEdit, onDelete }) => {
  const emotionColor = getEmotionColor(entry.emotion || 'Neutral');
  const emotionEmoji = getEmotionEmoji(entry.emotion || 'Neutral');

  return (
    <div className="card group animate-fade-in hover:border-dark-600/80 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {entry.emotion && (
              <span
                className="badge text-xs"
                style={{
                  backgroundColor: `${emotionColor}20`,
                  color: emotionColor,
                  borderColor: `${emotionColor}30`,
                  border: '1px solid',
                }}
              >
                <span className="mr-1">{emotionEmoji}</span>
                {entry.emotion}
              </span>
            )}
            <span className="text-xs text-dark-500">
              {formatDate(entry.timestamp || entry.created_at)}
            </span>
            <span className="text-xs text-dark-600">
              {formatTime(entry.timestamp || entry.created_at)}
            </span>
          </div>

          <h3 className="text-base font-semibold text-white mb-1.5 truncate">
            {entry.title || 'Untitled Entry'}
          </h3>

          <p className="text-sm text-dark-400 line-clamp-2 leading-relaxed">
            {entry.content || 'No content...'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit?.(entry)}
            className="p-2 rounded-lg text-dark-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
            id={`edit-entry-${entry.id}`}
            aria-label="Edit entry"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(entry.id)}
            className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            id={`delete-entry-${entry.id}`}
            aria-label="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;
