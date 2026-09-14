import React from 'react';
import { Activity, HeartPulse, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

export default function InsightsPanel({
  burnoutSnapshot,
  moodHistory,
  isLoading,
  onRefresh,
  onOpenDashboard,
}) {
  const latestEntry = moodHistory[0];
  const cards = [
    {
      label: 'Burnout Risk',
      value: `${burnoutSnapshot.burnoutRisk}%`,
      accent: burnoutSnapshot.level,
      icon: Activity,
    },
    {
      label: 'Dominant Emotion',
      value: formatLabel(burnoutSnapshot.dominantEmotion || latestEntry?.emotion || 'neutral'),
      accent: burnoutSnapshot.trend || 'steady',
      icon: HeartPulse,
    },
    {
      label: 'Check-ins Logged',
      value: moodHistory.length.toString(),
      accent: moodHistory.length >= 5 ? 'building momentum' : 'starting baseline',
      icon: TrendingUp,
    },
  ];

  return (
    <aside className="insights-panel glass-panel">
      <div className="insights-panel__header">
        <div>
          <span className="eyebrow">Today At A Glance</span>
          <h3>Your stress snapshot</h3>
        </div>
        <button type="button" className="btn-ghost" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>{isLoading ? 'Syncing' : 'Refresh'}</span>
        </button>
      </div>

      <div className="insight-card-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button key={card.label} type="button" className="insight-card" onClick={onOpenDashboard}>
              <div className="insight-card__top">
                <span>{card.label}</span>
                <Icon size={16} />
              </div>
              <strong>{card.value}</strong>
              <p>{formatLabel(card.accent)}</p>
            </button>
          );
        })}
      </div>

      <div className="insights-panel__callout">
        <Sparkles size={16} />
        <p>{buildCoachCopy(burnoutSnapshot, latestEntry)}</p>
      </div>

      <div className="insights-panel__timeline">
        <div className="insights-panel__timeline-header">
          <span>Recent patterns</span>
          <span>{moodHistory.length ? 'Latest first' : 'Waiting for check-ins'}</span>
        </div>

        {moodHistory.length ? (
          <div className="insights-chip-row">
            {moodHistory.slice(0, 6).map((entry) => (
              <div key={entry.id} className={`badge-emotion ${entry.emotion}`}>
                <span>{formatLabel(entry.emotion)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-copy">Start with a text or voice check-in to build the first baseline.</p>
        )}
      </div>
    </aside>
  );
}

function buildCoachCopy(snapshot, latestEntry) {
  if (snapshot.level === 'High') {
    return 'Strain is climbing. Shorter work blocks and a deliberate cooldown will help more than pushing harder.';
  }

  if (latestEntry?.emotion === 'happy' || latestEntry?.emotion === 'calm') {
    return 'You have a stabilizing signal right now. Capture what is helping so it stays repeatable.';
  }

  if (snapshot.trend === 'improving') {
    return 'The recent trend is improving. Keeping the pace steady matters more than adding intensity.';
  }

  return 'MindGuard now stores real history through Django, so these signals can guide better next-step support.';
}

function formatLabel(value) {
  if (!value) {
    return 'Neutral';
  }

  return value
    .toString()
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
