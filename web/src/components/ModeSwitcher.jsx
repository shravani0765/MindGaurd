// web/src/components/ModeSwitcher.jsx
import React from 'react';
import { Mic, MessageSquare, Video, Layers, MicOff, VideoOff, FileText } from 'lucide-react';

export default function ModeSwitcher({
  currentMode,
  onModeChange,
  isMicOn,
  onToggleMic,
  isCamOn,
  onToggleCam,
  showTranscript,
  onToggleTranscript,
}) {
  const modes = [
    { id: 'text', label: 'Journal', icon: MessageSquare },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'combo', label: 'Blend', icon: Layers },
  ];

  return (
    <div className="mode-switcher">
      <div className="mode-tabs-container">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={`mode-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="stream-toggle-bar">
        <span className="stream-label">
          Active Streams:
        </span>

        <button
          type="button"
          onClick={onToggleMic}
          className={`btn-ghost ${isMicOn ? 'active' : ''}`}
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title={isMicOn ? 'Mute Microphone' : 'Enable Microphone'}
        >
          {isMicOn ? <Mic size={13} /> : <MicOff size={13} />}
          <span>Mic {isMicOn ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleCam}
          className={`btn-ghost ${isCamOn ? 'active' : ''}`}
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title={isCamOn ? 'Disable Camera' : 'Enable Camera'}
        >
          {isCamOn ? <Video size={13} /> : <VideoOff size={13} />}
          <span>Camera {isCamOn ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleTranscript}
          className={`btn-ghost ${showTranscript ? 'active' : ''}`}
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title={showTranscript ? 'Hide Live Transcript' : 'Show Live Transcript'}
        >
          <FileText size={13} />
          <span>Transcript {showTranscript ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
}
