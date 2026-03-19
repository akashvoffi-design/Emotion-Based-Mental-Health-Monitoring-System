import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ showLabel = true }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      {showLabel && (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-dark-800">
            {isDark ? (
              <Moon className="w-5 h-5 text-primary-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Dark Mode</p>
            <p className="text-xs text-dark-400">Switch between light and dark themes</p>
          </div>
        </div>
      )}

      <button
        onClick={toggleTheme}
        className={`toggle-switch ${isDark ? 'bg-primary-500' : 'bg-dark-600'}`}
        id="dark-mode-toggle"
        aria-label="Toggle dark mode"
      >
        <span
          className={`toggle-switch-dot ${isDark ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};

export default ThemeToggle;
