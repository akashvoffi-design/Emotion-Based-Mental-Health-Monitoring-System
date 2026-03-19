import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { EMOTION_COLORS } from '../utils/emotionHelpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-dark-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MoodTrendChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[-2, 2]} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          name="Mood Score"
          stroke="#f97316"
          strokeWidth={2.5}
          dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const EmotionFrequencyChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="emotion" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((entry, index) => (
            <Cell key={index} fill={EMOTION_COLORS[entry.emotion] || '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const EmotionDistributionChart = ({ data }) => {
  const filteredData = data.filter(d => d.count > 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="count"
          nameKey="emotion"
          strokeWidth={0}
        >
          {filteredData.map((entry, index) => (
            <Cell key={index} fill={EMOTION_COLORS[entry.emotion] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-dark-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const MentalHealthGauge = ({ value, status }) => {
  const circumference = 2 * Math.PI * 45;
  const fillPercentage = (value / 100) * circumference;
  const offset = circumference - fillPercentage;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={status?.color || '#f97316'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{value}</span>
        </div>
      </div>
      <div className={`mt-3 badge ${status?.bgColor || 'bg-primary-500/15'} ${status?.textColor || 'text-primary-400'} border ${status?.textColor?.replace('text-', 'border-')?.replace('400', '500/20') || 'border-primary-500/20'}`}>
        {status?.label || 'Moderate'}
      </div>
      <p className="text-xs text-dark-500 mt-2">Keep tracking your mood</p>
    </div>
  );
};

export default { MoodTrendChart, EmotionFrequencyChart, EmotionDistributionChart, MentalHealthGauge };
