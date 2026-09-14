import React from 'react';
import { X, HeartPulse, CheckCircle2, Moon, Coffee, Wind } from 'lucide-react';

export default function BurnoutRadar({
  isOpen,
  onClose,
  burnoutScore = 24,
  moodHistory = [],
  burnoutSnapshot = { level: 'Low', status: 'Healthy equilibrium', trend: 'steady' },
}) {
  if (!isOpen) return null;

  const weeklyTrends = buildWeeklyTrends(moodHistory);
  const statusColor = burnoutScore >= 70 ? '#ef4444' : burnoutScore >= 45 ? 'var(--pastel-peach-warm)' : 'var(--sage-green)';
  const recentEntries = moodHistory.slice(0, 5);
  const actions = [
    {
      icon: Wind,
      title: 'Box breathing',
      body: 'Try four slow counts in, four hold, four out, and four at rest to lower tension quickly.',
      tone: 'var(--calm-blue-deep)',
    },
    {
      icon: Moon,
      title: 'Evening wind-down',
      body: 'Reduce screens before bed and use the lighter check-in modes when energy is already low.',
      tone: 'var(--sage-green-deep)',
    },
    {
      icon: Coffee,
      title: 'Micro-break pacing',
      body: 'A short walk, water, and one fewer task can be more effective than pushing harder.',
      tone: '#af5f1f',
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-panel modal-panel--wide">
        <div className="modal-panel__header">
          <div className="modal-panel__title-group">
            <div className="modal-panel__icon">
              <HeartPulse size={22} color="var(--calm-blue-deep)" />
            </div>
            <div>
              <span className="eyebrow">Burnout Radar</span>
              <h2>Your weekly recovery view</h2>
              <p>See the recent pattern first, then take the smallest useful next step.</p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn-icon modal-panel__close">
            <X size={18} />
          </button>
        </div>

        <div className="radar-score-card glass-card">
          <div>
            <span className="radar-score-card__label">Current score</span>
            <div className="radar-score-card__summary">
              <strong style={{ color: statusColor }}>{burnoutScore}%</strong>
              <span>{burnoutSnapshot.level} risk</span>
            </div>
            <p className="radar-score-card__body">
              {burnoutSnapshot.status}. Based on {moodHistory.length || 'live'} recent check-ins across the app.
            </p>
          </div>

          <div className="radar-score-card__ring" style={{ borderColor: statusColor, color: statusColor }}>
            <CheckCircle2 size={38} color={statusColor} />
          </div>
        </div>

        <div className="radar-section glass-card">
          <div className="radar-section__header">
            <h3>7-day emotional pattern</h3>
            <div className="radar-legend">
              <span className="radar-legend__item calm">Calm</span>
              <span className="radar-legend__item stress">Stress</span>
            </div>
          </div>

          <div className="radar-chart">
            {weeklyTrends.map((trend) => (
              <div key={trend.day} className="radar-chart__column">
                <div className="radar-chart__track">
                  <div className="radar-chart__segment stress" style={{ height: `${trend.stress}%` }} />
                  <div className="radar-chart__segment calm" style={{ height: `${trend.calm}%` }} />
                </div>
                <span>{trend.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="radar-grid">
          <div className="radar-section glass-card">
            <div className="radar-section__header">
              <h3>Recent signals</h3>
              <span>{recentEntries.length ? 'Latest first' : 'Waiting for data'}</span>
            </div>

            {recentEntries.length ? (
              recentEntries.map((entry) => (
                <div key={entry.id} className="radar-entry">
                  <div className={`badge-emotion ${entry.emotion}`}>
                    {formatLabel(entry.emotion)}
                  </div>
                  <div>
                    <strong>{formatLabel(entry.sourceMode)} check-in</strong>
                    <p>{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="radar-empty">
                <p>No historical entries yet. Run a few short check-ins to populate the radar.</p>
              </div>
            )}
          </div>

          <div className="radar-section glass-card">
            <div className="radar-section__header">
              <h3>Recovery ideas</h3>
              <span>Keep it small</span>
            </div>

            <div className="radar-actions">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.title} className="radar-action">
                    <div className="radar-action__icon">
                      <Icon size={18} color={action.tone} />
                    </div>
                    <div>
                      <strong>{action.title}</strong>
                      <p>{action.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatLabel(value) {
  return (value || 'neutral')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildWeeklyTrends(moodHistory) {
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const scoreMap = {
    calm: 0.1,
    happy: 0.18,
    neutral: 0.42,
    sad: 0.58,
    fatigued: 0.66,
    anxious: 0.78,
    stressed: 0.9,
  };
  const today = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const sameDayEntries = moodHistory.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.toDateString() === date.toDateString();
    });

    if (!sameDayEntries.length) {
      return { day: dayMap[date.getDay()], stress: 18, calm: 82 };
    }

    const average =
      sameDayEntries.reduce((total, entry) => total + (scoreMap[entry.emotion] ?? 0.42), 0) /
      sameDayEntries.length;

    return {
      day: dayMap[date.getDay()],
      stress: Math.round(average * 100),
      calm: Math.round((1 - average) * 100),
    };
  });
}
