import React, { useState, useEffect } from 'react';
import { X, Sparkles, Play, Pause, RotateCcw, Heart } from 'lucide-react';
import { meditationEngine } from '../services/meditationEngine';

export default function SadhguruMeditationModal({ isOpen, onClose }) {
  const [activeSession, setActiveSession] = useState('sadhguru');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(180);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [streak] = useState(3);

  const sessions = [
    {
      id: 'sadhguru',
      title: 'Sadhguru 3-Min Miracle Meditation',
      subtitle: 'A short grounding session for busy, overstimulated days.',
      duration: 180,
      sound: 'aum',
      tag: '136.1Hz Om',
    },
    {
      id: 'limitless',
      title: 'Limitless Brain Theta Reset',
      subtitle: 'A quicker audio reset when your mind feels crowded.',
      duration: 120,
      sound: 'theta',
      tag: '6Hz Theta',
    },
    {
      id: 'somatic',
      title: 'Serenity Bowl Reset',
      subtitle: 'A softer body-first cooldown for tension and jaw tightness.',
      duration: 180,
      sound: 'temple',
      tag: '432Hz Bowl',
    },
  ];

  const currentObj = sessions.find((session) => session.id === activeSession) || sessions[0];

  useEffect(() => {
    let interval = null;
    let breathInterval = null;

    if (isPlaying && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      breathInterval = setInterval(() => {
        setBreathPhase((prev) => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          if (prev === 'exhale') return 'pause';
          return 'inhale';
        });
      }, 3000);
    } else if (timer === 0) {
      setIsPlaying(false);
      meditationEngine.stop();
    }

    return () => {
      clearInterval(interval);
      clearInterval(breathInterval);
    };
  }, [isPlaying, timer]);

  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      meditationEngine.stop();
    } else {
      setIsPlaying(true);
      meditationEngine.playTrack(currentObj.sound);
    }
  };

  const handleSelectSession = (sessionId) => {
    meditationEngine.stop();
    setIsPlaying(false);
    setActiveSession(sessionId);
    const selected = sessions.find((session) => session.id === sessionId);
    setTimer(selected ? selected.duration : 180);
    setBreathPhase('inhale');
  };

  const handleReset = () => {
    meditationEngine.stop();
    setIsPlaying(false);
    setTimer(currentObj.duration);
    setBreathPhase('inhale');
  };

  const handleClose = () => {
    meditationEngine.stop();
    onClose();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-panel modal-panel--wide">
        <div className="modal-panel__header">
          <div className="modal-panel__title-group">
            <div className="modal-panel__icon">
              <Sparkles size={22} color="var(--calm-blue-deep)" />
            </div>
            <div>
              <span className="eyebrow">Guided Reset</span>
              <h2>Take a short recovery break.</h2>
              <p>Pick a calm practice, let the timer guide you, and keep the session gentle.</p>
            </div>
          </div>

          <button type="button" onClick={handleClose} className="btn-icon modal-panel__close">
            <X size={18} />
          </button>
        </div>

        <div className="meditation-streak glass-card">
          <div className="meditation-streak__main">
            <Heart size={18} color="var(--sage-green)" />
            <span>Day {streak} mindful reset streak</span>
          </div>
          <small>Short consistency beats intensity.</small>
        </div>

        <div className="meditation-session-grid">
          {sessions.map((session) => {
            const isSelected = activeSession === session.id;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => handleSelectSession(session.id)}
                className={`meditation-session glass-card ${isSelected ? 'selected' : ''}`}
              >
                <span className="meditation-session__tag">{session.tag}</span>
                <h4>{session.title}</h4>
                <p>{session.subtitle}</p>
              </button>
            );
          })}
        </div>

        <div className="meditation-stage glass-card">
          <div
            className={`meditation-stage__orb ${isPlaying ? 'is-playing' : ''}`}
            style={{
              transform: isPlaying
                ? breathPhase === 'inhale' || breathPhase === 'hold'
                  ? 'scale(1.18)'
                  : 'scale(0.86)'
                : 'scale(1)',
            }}
          >
            <span>{formatTime(timer)}</span>
          </div>

          <div className="meditation-stage__copy">
            <h3>{getMeditationMessage(isPlaying, breathPhase)}</h3>
            <p>{currentObj.tag} • {currentObj.title}</p>
          </div>

          <div className="meditation-stage__controls">
            <button type="button" onClick={handleStart} className="btn-primary">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span>{isPlaying ? 'Pause session' : 'Start session'}</span>
            </button>

            <button type="button" onClick={handleReset} className="btn-ghost">
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMeditationMessage(isPlaying, breathPhase) {
  if (!isPlaying) {
    return 'Press start when you are ready for a short reset.';
  }

  if (breathPhase === 'inhale') {
    return 'Inhale slowly and let your shoulders soften.';
  }

  if (breathPhase === 'hold') {
    return 'Hold gently. Nothing needs to be forced.';
  }

  if (breathPhase === 'exhale') {
    return 'Exhale longer than the inhale and release the jaw.';
  }

  return 'Pause for a moment and notice the body settling.';
}
