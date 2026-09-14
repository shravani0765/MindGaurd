// web/src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  Activity,
  Heart,
  ChevronDown,
  CloudRain,
  Waves,
  Music,
  Trees,
  Compass,
} from 'lucide-react';
import { ambianceEngine } from '../services/audioAmbiance';

export default function Header({ onOpenDashboard, burnoutScore = 24, autoInterventionActive: _autoInterventionActive = false }) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    ambianceEngine.onTrackChange = (track) => {
      setActiveTrack(track);
    };

    return () => {
      ambianceEngine.onTrackChange = null;
    };
  }, []);

  const tracks = [
    { id: 'rain', label: 'Gentle Rain', icon: CloudRain, desc: 'Soft brown noise raindrops' },
    { id: 'ocean', label: 'Ocean Waves', icon: Waves, desc: '8s rhythmic breathing swells' },
    { id: 'bowl', label: 'Tibetan Bowl 432Hz', icon: Music, desc: 'Harmonic theta resonance' },
    { id: 'forest', label: 'Forest Breeze', icon: Trees, desc: 'Canopy breeze & serene chimes' },
    { id: 'celestial', label: 'Celestial Drift', icon: Compass, desc: '528Hz deep alpha dream pad' },
  ];

  const handleSelectTrack = (trackId) => {
    if (!trackId || activeTrack === trackId) {
      ambianceEngine.stop();
    } else {
      ambianceEngine.playTrack(trackId);
    }
    setIsMenuOpen(false);
  };

  const getShieldStatus = (score) => {
    if (score < 40) return { label: 'Optimal Equilibrium', color: 'var(--sage-green)', bg: 'rgba(168, 198, 165, 0.15)' };
    if (score < 70) return { label: 'Mild Stress', color: 'var(--pastel-peach)', bg: 'rgba(245, 198, 165, 0.15)' };
    return { label: 'Elevated Risk', color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)' };
  };

  const status = getShieldStatus(burnoutScore);
  const currentTrackObj = tracks.find((t) => t.id === activeTrack);

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo">
          <Shield size={20} />
        </div>
        <div>
          <div className="app-header__brand-row">
            <h1>MindGuard</h1>
            <span className="app-header__badge">
              AI 2.0
            </span>
          </div>
          <p>Calm check-ins for busy days</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenDashboard}
        className="app-header__status"
        style={{ borderColor: `${status.color}35`, background: status.bg }}
        title="Click to view Burnout Insights"
      >
        <Heart size={14} color={status.color} />
        <span style={{ color: status.color }}>
          {status.label} ({burnoutScore}%)
        </span>
        <Activity size={13} color="var(--text-muted)" />
      </button>

      <div className="app-header__actions">
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`btn-ghost app-header__sound ${activeTrack ? 'active' : ''}`}
        >
          {activeTrack ? <Volume2 size={15} color="var(--sage-green)" /> : <VolumeX size={15} />}
          <span>{currentTrackObj ? currentTrackObj.label : 'Soundscapes'}</span>
          <ChevronDown size={14} style={{ opacity: 0.7 }} />
        </button>

        {isMenuOpen && (
          <div className="app-header__menu glass-panel">
            <div className="app-header__menu-title">
              Select Restorative Music
            </div>

            {tracks.map((t) => {
              const Icon = t.icon;
              const isSelected = activeTrack === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTrack(t.id)}
                  className={`app-header__menu-item ${isSelected ? 'selected' : ''}`}
                >
                  <Icon size={16} color={isSelected ? 'var(--sage-green)' : 'var(--calm-blue)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: isSelected ? '600' : '500' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {t.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--sage-green)', fontWeight: '600' }}>
                      Active
                    </span>
                  )}
                </div>
              );
            })}

            {activeTrack && (
              <div
                onClick={() => handleSelectTrack(null)}
                className="app-header__menu-clear"
              >
                Mute All Sounds
              </div>
            )}
          </div>
        )}

        <button onClick={onOpenDashboard} className="btn-primary app-header__cta">
          <Sparkles size={14} />
          Burnout Radar
        </button>
      </div>
    </header>
  );
}
