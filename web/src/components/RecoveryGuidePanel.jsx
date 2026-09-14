import React from 'react';

export default function RecoveryGuidePanel({ recoveryActions, moodHistory }) {
  return (
    <aside className="guide-panel glass-panel">
      <div className="guide-panel__header">
        <span className="eyebrow">Next Steps</span>
        <h3>Practical actions you can take right now</h3>
      </div>

      <div className="guide-card-list">
        {recoveryActions.map((action) => (
          <div key={action.title} className="guide-card">
            <strong>{action.title}</strong>
            <p>{action.body}</p>
          </div>
        ))}
      </div>

      <div className="guide-panel__history">
        <div className="guide-panel__history-header">
          <span>Recent check-ins</span>
          <span>{moodHistory.length}</span>
        </div>
        {moodHistory.length ? (
          moodHistory.slice(0, 4).map((entry) => (
            <div key={entry.id} className="history-row">
              <span className={`badge-emotion ${entry.emotion}`}>{formatLabel(entry.emotion)}</span>
              <small>{formatTimestamp(entry.timestamp)}</small>
            </div>
          ))
        ) : (
          <p className="empty-copy">Your first check-in will show up here and shape the weekly trend.</p>
        )}
      </div>
    </aside>
  );
}

function formatLabel(value) {
  return (value || 'neutral')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
