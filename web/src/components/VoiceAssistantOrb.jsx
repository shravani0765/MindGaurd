// web/src/components/VoiceAssistantOrb.jsx
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Radio, HeartPulse } from 'lucide-react';
import { speechService } from '../services/speech';
import { apiClient } from '../services/api';
import { buildComfortResponse } from '../services/wellnessIntelligence';

export default function VoiceAssistantOrb({
  isMicOn,
  onToggleMic,
  showTranscript,
  onMoodLogged,
  userId = 'user_demo_01',
}) {
  const [orbState, setOrbState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState(
    "Hello, I'm MindGuard. Take a gentle breath. Speak freely—I'm listening with full presence."
  );
  const [detectedEmotion, setDetectedEmotion] = useState('calm');
  const [emotionConfidence, setEmotionConfidence] = useState(0.95);

  useEffect(() => {
    if (isMicOn) {
      startVoiceSession();
    } else {
      speechService.stopListening();
      speechService.stopSpeaking();
      setOrbState('idle');
    }

    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, [isMicOn]);

  const startVoiceSession = () => {
    setOrbState('listening');
    speechService.startListening(
      async (result) => {
        setTranscript(result.text);

        // When user pauses or finishes a thought
        if (result.final && result.final.trim().length > 2) {
          handleUserSpeech(result.final);
        }
      },
      (err) => {
        console.warn('Speech err:', err);
        setOrbState('idle');
      },
      (isListening) => {
        if (!isListening && orbState === 'listening') {
          setOrbState('idle');
        }
      }
    );
  };

  const handleUserSpeech = async (userText) => {
    setOrbState('thinking');
    speechService.stopListening();

    try {
      // 1. Send to backend interactions API
      const response = await apiClient.sendTextInteraction(userId, userText);
      const emotion = response.moodLog?.emotion || 'calm';
      const confidence = response.moodLog?.details?.confidence || 0.92;
      const comfort = buildComfortResponse({
        text: userText,
        emotion,
        urgency: response.moodLog?.details?.urgency || 'normal',
        topicFlags: response.moodLog?.details?.topicFlags || {},
        mode: 'voice',
      });
      setDetectedEmotion(emotion);
      setEmotionConfidence(confidence);

      if (onMoodLogged) onMoodLogged(response.moodLog);

      const aiReply = `${comfort.message} ${comfort.followUp}`.trim();
      setLastResponse(aiReply);

      // 3. Speak reply using Web Speech Synthesis
      setOrbState('speaking');
      speechService.speak(aiReply, () => {
        // After AI finishes speaking, resume listening if mic is still active
        if (isMicOn) {
          setOrbState('listening');
          startVoiceSession();
        } else {
          setOrbState('idle');
        }
      });
    } catch (e) {
      console.error('Error handling voice:', e);
      setOrbState('idle');
    }
  };

  const handleQuickPrompt = (promptText) => {
    setTranscript(promptText);
    handleUserSpeech(promptText);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '480px',
      position: 'relative',
      padding: '20px',
      maxWidth: '720px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Detected Emotion Telemetry Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '28px',
      }}>
        <div className={`badge-emotion ${detectedEmotion}`}>
          <HeartPulse size={12} />
          <span>Vocal Emotion: {detectedEmotion} ({Math.round(emotionConfidence * 100)}%)</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          <Radio size={12} color={isMicOn ? 'var(--sage-green)' : 'var(--text-muted)'} />
          <span>{isMicOn ? 'Live Stream Active' : 'Microphone Paused'}</span>
        </div>
      </div>

      {/* Central ChatGPT Orb Stage */}
      <div className="orb-stage" onClick={onToggleMic} style={{ cursor: 'pointer' }}>
        {/* Ripple rings */}
        <div className="orb-ring" style={{ opacity: orbState === 'listening' ? 0.8 : 0.2 }} />
        <div className="orb-ring" style={{ opacity: orbState === 'speaking' ? 0.9 : 0.3 }} />
        <div className="orb-ring" style={{ opacity: orbState === 'thinking' ? 0.7 : 0.1 }} />

        {/* Pulsating glowing core */}
        <div className={`orb-core ${orbState}`} />
      </div>

      {/* State Text Label */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: orbState === 'listening' ? 'var(--pastel-peach)' :
                 orbState === 'speaking' ? 'var(--sage-green-light)' :
                 orbState === 'thinking' ? 'var(--soft-lavender)' : 'var(--calm-blue-light)',
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          {orbState === 'listening' && 'Listening to your voice...'}
          {orbState === 'thinking' && 'Reflecting with mindfulness...'}
          {orbState === 'speaking' && 'MindGuard is speaking...'}
          {orbState === 'idle' && (isMicOn ? 'Ready for your voice' : 'Tap mic to speak')}
        </p>

        {/* Dynamic Sound Wave Bars */}
        {(orbState === 'listening' || orbState === 'speaking') && (
          <div className="audio-visualizer" style={{ marginTop: '12px' }}>
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
            <div className="visualizer-bar" />
          </div>
        )}
      </div>

      {/* Live AI Response Subtitle Bubble */}
      <div className="glass-panel" style={{
        marginTop: '28px',
        padding: '18px 24px',
        width: '100%',
        textAlign: 'center',
        background: 'rgba(14, 22, 38, 0.7)',
        borderColor: 'rgba(110, 193, 228, 0.15)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      }}>
        <p style={{
          fontSize: '0.98rem',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          fontWeight: '400',
        }}>
          "{lastResponse}"
        </p>

        {/* Live Subtitle Transcript (When Enabled) */}
        {showTranscript && transcript && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-glass)',
            fontSize: '0.84rem',
            color: 'var(--calm-blue)',
            fontStyle: 'italic',
          }}>
            You said: "{transcript}"
          </div>
        )}
      </div>

      {/* Mic Control Button */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={onToggleMic}
          className="btn-primary"
          style={{
            background: isMicOn
              ? 'linear-gradient(135deg, #F5C6A5 0%, #F97316 100%)'
              : 'linear-gradient(135deg, #6EC1E4 0%, #A8C6A5 100%)',
            color: '#070B14',
            padding: '12px 28px',
            fontSize: '0.95rem',
          }}
        >
          {isMicOn ? <MicOff size={18} /> : <Mic size={18} />}
          <span>{isMicOn ? 'Pause Listening' : 'Start Voice Chat'}</span>
        </button>
      </div>
      <p style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        You can pause, restart, or speak briefly at any time. Comfort matters more than perfect input.
      </p>

      {/* Quick Calming Prompt Chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '24px',
      }}>
        {[
          'Feeling exhausted from continuous meetings',
          'Guide me through a 2-minute calming breath',
          'How is my emotional burnout trend looking?',
          'Help me disconnect and wind down for the day',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleQuickPrompt(prompt)}
            className="btn-ghost"
            style={{ fontSize: '0.78rem', padding: '6px 14px' }}
          >
            <Sparkles size={12} color="var(--calm-blue)" />
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
