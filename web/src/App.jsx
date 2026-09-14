import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/Header';
import ModeSwitcher from './components/ModeSwitcher';
import VoiceAssistantOrb from './components/VoiceAssistantOrb';
import ChatInterface from './components/ChatInterface';
import VideoInterface from './components/VideoInterface';
import ComboInterface from './components/ComboInterface';
import BurnoutRadar from './components/BurnoutRadar';
import SadhguruMeditationModal from './components/SadhguruMeditationModal';
import InsightsPanel from './components/InsightsPanel';
import { ambianceEngine } from './services/audioAmbiance';
import { ArrowUpRight, Music, Sparkles, X } from 'lucide-react';
import { apiClient } from './services/api';

const DEMO_USER_ID = 'user_demo_01';
const EMPTY_SNAPSHOT = {
  burnoutRisk: 28,
  level: 'Low',
  status: 'Healthy equilibrium',
  trend: 'steady',
  latestEmotion: 'neutral',
  dominantEmotion: 'neutral',
};

export default function App() {
  const [currentMode, setCurrentMode] = useState('text');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [moodHistory, setMoodHistory] = useState([]);
  const [burnoutSnapshot, setBurnoutSnapshot] = useState(EMPTY_SNAPSHOT);
  const [isSyncingInsights, setIsSyncingInsights] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isMeditationOpen, setIsMeditationOpen] = useState(false);
  const [interventionToast, setInterventionToast] = useState(null);

  const burnoutScore = burnoutSnapshot.burnoutRisk;

  useEffect(() => {
    void refreshInsights();
  }, []);

  const handleToggleMic = () => setIsMicOn((prev) => !prev);
  const handleToggleCam = () => setIsCamOn((prev) => !prev);
  const handleToggleTranscript = () => setShowTranscript((prev) => !prev);

  async function refreshInsights() {
    setIsSyncingInsights(true);
    try {
      const [history, snapshot] = await Promise.all([
        apiClient.getMoodHistory(DEMO_USER_ID),
        apiClient.getBurnoutRisk(DEMO_USER_ID),
      ]);
      setMoodHistory(history);
      setBurnoutSnapshot((prev) => ({ ...prev, ...snapshot }));
    } finally {
      setIsSyncingInsights(false);
    }
  }

  const handleMoodLogged = (logEntry) => {
    if (!logEntry) return;

    const normalizedEntry = normalizeMoodLog(logEntry);
    setMoodHistory((prev) => {
      const nextHistory = [normalizedEntry, ...prev].slice(0, 30);
      setBurnoutSnapshot(buildSnapshot(nextHistory));
      return nextHistory;
    });

    if (normalizedEntry.emotion === 'stressed' || normalizedEntry.emotion === 'anxious') {
      ambianceEngine.triggerBurnoutIntervention();
      setInterventionToast('MindGuard detected elevated stress. Auto-playing a gentle restorative soundscape to ease the transition.');
      setTimeout(() => setInterventionToast(null), 7000);
    }

    if (normalizedEntry.emotion === 'happy' || normalizedEntry.emotion === 'calm') {
      setInterventionToast('A positive signal was logged. This is a good moment to preserve the routine that helped you feel steadier.');
      setTimeout(() => setInterventionToast(null), 5000);
    }

    void refreshInsights();
  };

  const recoveryActions = useMemo(
    () => getRecoveryActions(burnoutSnapshot, moodHistory[0]),
    [burnoutSnapshot, moodHistory]
  );

  return (
    <div className="app-shell">
      <Header
        burnoutScore={burnoutScore}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {interventionToast && (
        <div className="intervention-toast">
          <Music size={18} color="var(--sage-green)" />
          <span>{interventionToast}</span>
          <button
            onClick={() => setInterventionToast(null)}
            className="toast-dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <main className="app-content">
        <section className="hero-grid">
          <div className="hero-panel glass-panel">
            <span className="eyebrow">Calm And Clear</span>
            <h2>A softer, simpler way to check in with your stress.</h2>
            <p>
              Choose the mode that feels easiest right now. Write, speak, or use video when you want
              a fuller signal. The goal is to help you notice pressure early and respond gently.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" type="button" onClick={() => setCurrentMode('text')}>
                <Sparkles size={16} />
                Start a check-in
              </button>
              <button className="btn-ghost" type="button" onClick={() => setIsDashboardOpen(true)}>
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

          <InsightsPanel
            burnoutSnapshot={burnoutSnapshot}
            moodHistory={moodHistory}
            isLoading={isSyncingInsights}
            onRefresh={refreshInsights}
            onOpenDashboard={() => setIsDashboardOpen(true)}
          />
        </section>

        <ModeSwitcher
          currentMode={currentMode}
          onModeChange={(mode) => {
            setCurrentMode(mode);
            setIsMicOn(mode === 'voice' || mode === 'combo');
            setIsCamOn(mode === 'video' || mode === 'combo');
          }}
          isMicOn={isMicOn}
          onToggleMic={handleToggleMic}
          isCamOn={isCamOn}
          onToggleCam={handleToggleCam}
          showTranscript={showTranscript}
          onToggleTranscript={handleToggleTranscript}
        />

        <section className="workspace-grid">
          <div className="experience-shell">
            {currentMode === 'combo' && (
              <ComboInterface
                isMicOn={isMicOn}
                onToggleMic={handleToggleMic}
                isCamOn={isCamOn}
                onToggleCam={handleToggleCam}
                showTranscript={showTranscript}
                onMoodLogged={handleMoodLogged}
                onOpenMeditation={() => setIsMeditationOpen(true)}
                userId={DEMO_USER_ID}
              />
            )}

            {currentMode === 'voice' && (
              <VoiceAssistantOrb
                isMicOn={isMicOn}
                onToggleMic={handleToggleMic}
                showTranscript={showTranscript}
                onMoodLogged={handleMoodLogged}
                userId={DEMO_USER_ID}
              />
            )}

            {currentMode === 'text' && (
              <ChatInterface onMoodLogged={handleMoodLogged} userId={DEMO_USER_ID} />
            )}

            {currentMode === 'video' && (
              <VideoInterface
                isCamOn={isCamOn}
                onToggleCam={handleToggleCam}
                onMoodLogged={handleMoodLogged}
                userId={DEMO_USER_ID}
              />
            )}
          </div>

          <aside className="guide-panel glass-panel">
            <div className="guide-panel__header">
              <span className="eyebrow">Helpful next steps</span>
              <h3>Small actions that can help today</h3>
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
        </section>
      </main>

      <BurnoutRadar
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        burnoutScore={burnoutScore}
        moodHistory={moodHistory}
        burnoutSnapshot={burnoutSnapshot}
      />

      <SadhguruMeditationModal
        isOpen={isMeditationOpen}
        onClose={() => setIsMeditationOpen(false)}
      />
    </div>
  );
}

function normalizeMoodLog(logEntry) {
  return {
    id: logEntry.id || logEntry._id || `entry_${Date.now()}`,
    emotion: logEntry.emotion || 'neutral',
    sourceMode: logEntry.sourceMode || logEntry.source_mode || 'text',
    timestamp: logEntry.timestamp || new Date().toISOString(),
    details: logEntry.details || {},
  };
}

function buildSnapshot(logs) {
  if (!logs.length) {
    return EMPTY_SNAPSHOT;
  }

  const scoreMap = {
    calm: 0.12,
    happy: 0.2,
    neutral: 0.42,
    sad: 0.58,
    fatigued: 0.66,
    anxious: 0.78,
    stressed: 0.9,
  };

  const recent = logs.slice(0, 7);
  const average = recent.reduce((total, item) => total + (scoreMap[item.emotion] ?? 0.42), 0) / recent.length;
  const burnoutRisk = Math.round(average * 100);
  const counts = recent.reduce((accumulator, item) => {
    accumulator[item.emotion] = (accumulator[item.emotion] || 0) + 1;
    return accumulator;
  }, {});
  const dominantEmotion =
    Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] || 'neutral';

  return {
    burnoutRisk,
    level: burnoutRisk >= 70 ? 'High' : burnoutRisk >= 45 ? 'Moderate' : 'Low',
    status:
      burnoutRisk >= 70
        ? 'Sustained strain detected'
        : burnoutRisk >= 45
          ? 'Recovery pacing recommended'
          : 'Healthy equilibrium',
    trend:
      recent[0]?.emotion === 'happy' || recent[0]?.emotion === 'calm'
        ? 'improving'
        : ['stressed', 'anxious', 'fatigued', 'sad'].includes(recent[0]?.emotion)
          ? 'rising'
          : 'steady',
    latestEmotion: recent[0]?.emotion || 'neutral',
    dominantEmotion: dominantEmotion || 'neutral',
  };
}

function getRecoveryActions(snapshot, latestEntry) {
  const latestEmotion = latestEntry?.emotion || snapshot.latestEmotion;

  if (snapshot.level === 'High') {
    return [
      {
        title: 'Reduce intensity',
        body: 'Shrink the next focus block to 25 minutes and remove one non-essential task from today.',
      },
      {
        title: 'Recover physically',
        body: 'Step away from the screen, hydrate, and let your breathing slow down before restarting.',
      },
      {
        title: 'Log context',
        body: 'Use the text mode to capture the trigger so repeated strain becomes easier to predict.',
      },
    ];
  }

  if (latestEmotion === 'happy' || latestEmotion === 'calm') {
    return [
      {
        title: 'Protect the routine',
        body: 'Save the pattern that helped today: timing, music, breaks, or environment.',
      },
      {
        title: 'Build consistency',
        body: 'Add one more check-in later today so the baseline stays grounded in real data.',
      },
      {
        title: 'Stay lightweight',
        body: 'Use the voice or combo mode for a quick pulse check rather than waiting for stress to build.',
      },
    ];
  }

  return [
    {
      title: 'Create a clear baseline',
      body: 'Two or three short check-ins across the day will make burnout trends more trustworthy.',
    },
    {
      title: 'Use multimodal mode',
      body: 'The combo flow gives the strongest signal because it blends voice, text intent, and facial cues.',
    },
    {
      title: 'End with a cooldown',
      body: 'Open the meditation flow after your last session to lower carryover stress into the evening.',
    },
  ];
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
