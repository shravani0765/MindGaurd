import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function DashboardHero({ currentMode, burnoutSnapshot, onStartCheckIn, onViewTrends }) {
  return (
    <div className="hero-panel glass-panel">
      <span className="eyebrow">Daily Support</span>
      <h2>Check in early, understand the pattern, and respond before stress piles up.</h2>
      <p>
        Use text, voice, or video depending on what feels easiest. Your dashboard keeps the
        experience simple: one current score, one recent pattern, and the next helpful step.
      </p>

      <div className="hero-actions">
        <button className="btn-primary" type="button" onClick={onStartCheckIn}>
          <Sparkles size={16} />
          Start a check-in
        </button>
        <button className="btn-ghost" type="button" onClick={onViewTrends}>
          <ArrowUpRight size={14} />
          View your trends
        </button>
      </div>

      <div className="hero-meta-grid">
        <div className="hero-meta-card">
          <span>Current mode</span>
          <strong>{formatLabel(currentMode)}</strong>
        </div>
        <div className="hero-meta-card">
          <span>Current score</span>
          <strong>{burnoutSnapshot.burnoutRisk}%</strong>
        </div>
        <div className="hero-meta-card">
          <span>Latest pattern</span>
          <strong>{formatLabel(burnoutSnapshot.latestEmotion)}</strong>
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
