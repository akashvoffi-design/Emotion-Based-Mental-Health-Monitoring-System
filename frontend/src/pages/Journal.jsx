import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import JournalEntry from '../components/JournalEntry';
import { EMOTION_LABELS, getEmotionEmoji, getEmotionColor } from '../utils/emotionHelpers';
import { 
  BookOpen, Plus, X, Save, Loader2, 
  ChevronDown, BookMarked 
} from 'lucide-react';

const Journal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterEmotion, setFilterEmotion] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('Neutral');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsedData = (data || []).map(entry => {
        let title = 'Untitled Entry';
        let text = entry.content || '';
        
        // Parse combined content for title if it exists
        if (text.includes('|||TITLE_SEP|||')) {
          const parts = text.split('|||TITLE_SEP|||');
          title = parts[0];
          text = parts.slice(1).join('|||TITLE_SEP|||');
        }

        return {
          ...entry,
          title: title,
          content: text,
          emotion: entry.mood || 'Neutral', // map mood back to emotion for frontend
          timestamp: entry.created_at || entry.timestamp
        };
      });

      setEntries(parsedData);
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const openNewEntry = () => {
    setEditingEntry(null);
    setTitle('');
    setContent('');
    setEmotion('Neutral');
    setShowModal(true);
  };

  const openEditEntry = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title || '');
    setContent(entry.content || '');
    setEmotion(entry.emotion || 'Neutral');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const combinedContent = `${title}|||TITLE_SEP|||${content}`;

      if (editingEntry) {
        const { error } = await supabase
          .from('journal_entries')
          .update({ content: combinedContent, mood: emotion })
          .eq('id', editingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('journal_entries')
          .insert([{
            user_id: user.id,
            content: combinedContent,
            mood: emotion
          }]);
        if (error) throw error;
      }

      setShowModal(false);
      fetchEntries();
    } catch (err) {
      console.error('Failed to save entry:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const filteredEntries = filterEmotion === 'All'
    ? entries
    : entries.filter(e => e.emotion === filterEmotion);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="page-header mb-0">
          <h1 className="page-title">Journal</h1>
          <p className="page-subtitle">Reflect on your emotional journey</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="btn-secondary flex items-center gap-2 text-sm"
              id="emotion-filter"
            >
              {filterEmotion === 'All' ? 'All emotions' : `${getEmotionEmoji(filterEmotion)} ${filterEmotion}`}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-20 overflow-hidden animate-slide-down">
                <button
                  onClick={() => { setFilterEmotion('All'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-dark-700 transition-colors ${
                    filterEmotion === 'All' ? 'text-primary-400 bg-dark-700/50' : 'text-dark-300'
                  }`}
                >
                  All emotions
                </button>
                {EMOTION_LABELS.map(em => (
                  <button
                    key={em}
                    onClick={() => { setFilterEmotion(em); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-dark-700 transition-colors flex items-center gap-2 ${
                      filterEmotion === em ? 'text-primary-400 bg-dark-700/50' : 'text-dark-300'
                    }`}
                  >
                    <span>{getEmotionEmoji(em)}</span>
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Entry Button */}
          <button onClick={openNewEntry} className="btn-primary flex items-center gap-2 text-sm" id="new-entry-btn">
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <BookMarked className="w-12 h-12 text-dark-600 mb-4" />
          <h3 className="text-lg font-semibold text-dark-300 mb-1">No journal entries yet</h3>
          <p className="text-sm text-dark-500 mb-4">Start writing about your emotional journey</p>
          <button onClick={openNewEntry} className="btn-secondary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Write first entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(entry => (
            <JournalEntry
              key={entry.id}
              entry={entry}
              onEdit={openEditEntry}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Give your entry a title..."
                  id="journal-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">How are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_LABELS.map(em => (
                    <button
                      key={em}
                      onClick={() => setEmotion(em)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                        emotion === em
                          ? 'border-primary-500/50 bg-primary-500/10 text-white'
                          : 'border-dark-700 bg-dark-800 text-dark-400 hover:border-dark-600'
                      }`}
                    >
                      {getEmotionEmoji(em)} {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Content</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="input-field min-h-[150px] resize-y"
                  placeholder="Write about your thoughts and feelings..."
                  id="journal-content-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-dark-700/50">
              <button onClick={() => setShowModal(false)} className="btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || saving}
                className="btn-primary flex items-center gap-2"
                id="save-entry-btn"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
