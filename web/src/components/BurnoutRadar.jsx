// web/src/components/BurnoutRadar.jsx
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
  const statusColor = burnoutScore >= 70 ? '#F87171' : burnoutScore >= 45 ? 'var(--pastel-peach)' : 'var(--sage-green)';
  const recentEntries = moodHistory.slice(0, 5);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 11, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '30px',
        background: 'rgba(14, 22, 38, 0.95)',
        border: '1px solid rgba(110, 193, 228, 0.25)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        borderRadius: '24px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(110, 193, 228, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(110, 193, 228, 0.3)',
            }}>
              <HeartPulse size={22} color="var(--calm-blue)" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '700' }}>
                Burnout Risk & Emotional Velocity
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Longitudinal multimodal health analytics
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '38px', height: '38px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Big Risk Index Meter */}
        <div className="glass-card" style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(168, 198, 165, 0.1) 0%, rgba(110, 193, 228, 0.1) 100%)',
          border: '1px solid rgba(168, 198, 165, 0.3)',
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Burnout Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', fontWeight: '700', color: statusColor }}>
                {burnoutScore}%
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--sage-green-light)' }}>
                {burnoutSnapshot.level} Risk ({burnoutSnapshot.status})
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '420px' }}>
              Based on {moodHistory.length || 'live'} multimodal check-ins stored through the new Django API layer.
            </p>
          </div>

          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: `4px solid ${statusColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 25px ${statusColor}40`,
          }}>
            <CheckCircle2 size={38} color={statusColor} />
          </div>
        </div>

        {/* 7-Day Velocity Chart */}
        <div className="glass-card" style={{ padding: '22px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>7-Day Emotional Velocity</span>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--sage-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ● Calm / Flow
              </span>
              <span style={{ color: 'var(--pastel-peach)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ● Stress / Fatigue
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', gap: '12px', paddingTop: '10px' }}>
            {weeklyTrends.map((t, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100px', justifyContent: 'flex-end', gap: '2px' }}>
                  <div style={{
                    height: `${t.stress}%`,
                    background: 'var(--pastel-peach)',
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.8,
                  }} />
                  <div style={{
                    height: `${t.calm}%`,
                    background: 'var(--sage-green)',
                    borderRadius: '0 0 4px 4px',
                    opacity: 0.9,
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
            Recent Logged Signals
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {recentEntries.length ? (
              recentEntries.map((entry) => (
                <div key={entry.id} className="glass-card" style={{ padding: '14px' }}>
                  <div className={`badge-emotion ${entry.emotion}`} style={{ width: 'fit-content', marginBottom: '10px' }}>
                    {entry.emotion}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {entry.sourceMode} check-in
                  </p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="glass-card" style={{ padding: '14px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  No historical entries yet. Run a few text or voice check-ins to populate the radar.
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
            Personalized Calming Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Wind size={20} color="var(--calm-blue)" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '600' }}>Box Breathing</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  4s in, 4s hold, 4s out, 4s pause. Lowers cortisol instantly.
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Moon size={20} color="var(--soft-lavender)" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '600' }}>Evening Wind-Down</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Shut down screens 45 minutes before sleep to restore REM balance.
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Coffee size={20} color="var(--pastel-peach)" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '600' }}>Micro-Break Pacing</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Take a 3-minute hydration walk between focused work blocks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
