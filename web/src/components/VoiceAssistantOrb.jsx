// web/src/components/VoiceAssistantOrb.jsx
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Radio, HeartPulse, ShieldCheck } from 'lucide-react';
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
  const [orbState, setOrbState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState(
    "Hello, I'm MindGuard. Take one slow breath and say only what feels easy to share."
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

  const stateCopy = getStateCopy(orbState, isMicOn);

  return (
    <div className="voice-shell">
      <div className="experience-panel">
        <div className="experience-panel__header">
          <div>
            <span className="eyebrow">Voice Check-In</span>
            <h3>Talk it through at your own pace.</h3>
            <p>You can speak in short fragments. The app should meet you gently, not rush you.</p>
          </div>

          <div className="experience-panel__status-row">
            <div className={`badge-emotion ${detectedEmotion}`}>
              <HeartPulse size={12} />
              <span>{formatLabel(detectedEmotion)} {Math.round(emotionConfidence * 100)}%</span>
            </div>
            <div className="experience-panel__status">
              <ShieldCheck size={14} />
              <span>Private session</span>
            </div>
          </div>
        </div>

        <div className="voice-shell__main">
          <div className="voice-shell__stage glass-panel">
            <button type="button" className="voice-shell__orb-button" onClick={onToggleMic}>
              <div className="orb-stage">
                <div className="orb-ring" style={{ opacity: orbState === 'listening' ? 0.55 : 0.12 }} />
                <div className="orb-ring" style={{ opacity: orbState === 'speaking' ? 0.5 : 0.12 }} />
                <div className="orb-ring" style={{ opacity: orbState === 'thinking' ? 0.45 : 0.08 }} />
                <div className={`orb-core ${orbState}`} />
              </div>
            </button>

            <div className="voice-shell__state">
              <div className="voice-shell__live">
                <Radio size={13} />
                <span>{isMicOn ? 'Microphone active' : 'Microphone paused'}</span>
              </div>
              <h4>{stateCopy.title}</h4>
              <p>{stateCopy.body}</p>
            </div>
          </div>

          <div className="voice-shell__cards">
            <div className="combo-card combo-card--primary">
              <span className="combo-card__label">MindGuard response</span>
              <p>{lastResponse}</p>
            </div>

            {showTranscript && (
              <div className="combo-card">
                <span className="combo-card__label">Live transcript</span>
                <p>{transcript ? `"${transcript}"` : 'Your latest spoken words will appear here.'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="voice-shell__actions">
          <button type="button" onClick={onToggleMic} className="btn-primary">
            {isMicOn ? <MicOff size={18} /> : <Mic size={18} />}
            <span>{isMicOn ? 'Pause voice mode' : 'Start voice mode'}</span>
          </button>
        </div>

        <div className="chip-cloud">
          {[
            'Feeling exhausted from continuous meetings',
            'Guide me through a 2-minute calming breath',
            'How is my emotional burnout trend looking',
            'Help me disconnect and wind down for the day',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleQuickPrompt(prompt)}
              className="btn-ghost"
            >
              <Sparkles size={12} color="var(--calm-blue)" />
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getStateCopy(orbState, isMicOn) {
  if (orbState === 'listening') {
    return {
      title: 'Listening now',
      body: 'Speak naturally. Short pauses are okay and you do not need to explain everything at once.',
    };
  }

  if (orbState === 'thinking') {
    return {
      title: 'Reflecting on your check-in',
      body: 'MindGuard is turning your words into a calm, practical next step.',
    };
  }

  if (orbState === 'speaking') {
    return {
      title: 'Responding gently',
      body: 'The voice reply is playing now and will return to listening when it finishes.',
    };
  }

  return {
    title: isMicOn ? 'Ready when you are' : 'Voice mode is paused',
    body: 'Start the microphone whenever talking feels easier than typing.',
  };
}

function formatLabel(value) {
  return (value || 'neutral')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
