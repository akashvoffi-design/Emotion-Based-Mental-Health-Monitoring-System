import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import ThemeToggle from '../components/ThemeToggle';
import { getEmotionScore } from '../utils/emotionHelpers';
import { 
  Lock, Download, Trash2, AlertTriangle, 
  Loader2, Check, Eye, EyeOff, Info, Shield 
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setPasswordMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const { data, error } = await supabase
        .from('emotions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Date', 'Emotion', 'Confidence', 'Score', 'Notes'];
      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };

      const rows = (data || []).map(d => [
        escapeCSV(d.timestamp || d.created_at),
        escapeCSV(d.emotion),
        escapeCSV(d.confidence),
        escapeCSV(getEmotionScore(d.emotion)),
        escapeCSV(d.notes || ''),
      ]);

      // Prepend sep=, to force Excel to recognize the comma delimiter
      const csv = 'sep=,\n' + [headers.map(h => escapeCSV(h)).join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindpulse_emotions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Delete user data
      await supabase.from('journal_entries').delete().eq('user_id', user.id);
      await supabase.from('emotions').delete().eq('user_id', user.id);
      
      // Sign out
      logout();
    } catch (err) {
      console.error('Delete account failed:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-1">Appearance</h2>
          <p className="text-xs text-dark-400 mb-4">Customize your visual experience</p>
          <ThemeToggle />
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-dark-400" />
            <h2 className="text-base font-semibold text-white">Change Password</h2>
          </div>
          <p className="text-xs text-dark-400 mb-4">Update your account password</p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="input-field"
                placeholder="Enter current password"
                id="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="At least 6 characters"
                minLength={6}
                id="new-password"
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                {passwordMessage}
              </p>
            )}
            <button type="submit" disabled={passwordLoading} className="btn-primary flex items-center gap-2" id="change-password-btn">
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </div>

        {/* Export Data */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Download className="w-4 h-4 text-dark-400" />
            <h2 className="text-base font-semibold text-white">Export Data</h2>
          </div>
          <p className="text-xs text-dark-400 mb-4">Download your emotion data as CSV</p>
          <button
            onClick={handleExportData}
            disabled={exportLoading}
            className="btn-secondary flex items-center gap-2"
            id="export-data-btn"
          >
            {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export to CSV
          </button>
        </div>

        {/* Privacy */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-dark-400" />
            <h2 className="text-base font-semibold text-white">Privacy</h2>
          </div>
          <p className="text-xs text-dark-400 mb-4">Your data is private and secure</p>
          <div className="space-y-3 text-sm text-dark-300">
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              No facial images are stored — only emotion labels and scores
            </p>
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              All data is encrypted and protected with Row Level Security
            </p>
            <p className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              You can export or delete your data at any time
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="card border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-amber-400">Disclaimer</h2>
          </div>
          <p className="text-sm text-dark-300 leading-relaxed">
            This application is for personal mood tracking only. It is NOT a medical diagnostic tool.
            If you are experiencing a mental health crisis, please contact a qualified mental health
            professional or a local crisis helpline immediately.
          </p>
        </div>

        {/* Delete Account */}
        <div className="card border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Trash2 className="w-4 h-4 text-red-400" />
            <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
          </div>
          <p className="text-xs text-dark-400 mb-4">This action cannot be undone</p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger flex items-center gap-2"
              id="delete-account-btn"
            >
              <Trash2 className="w-4 h-4" />
              Delete My Account
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3 animate-slide-down">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-sm font-semibold text-red-400">Are you absolutely sure?</p>
              </div>
              <p className="text-xs text-dark-400">
                This will permanently delete all your emotion data, journal entries, and account information.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
