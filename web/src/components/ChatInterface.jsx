// web/src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, HeartPulse } from 'lucide-react';
import { apiClient } from '../services/api';
import { buildComfortResponse } from '../services/wellnessIntelligence';

export default function ChatInterface({ userId = 'user_demo_01', onMoodLogged }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello. I'm MindGuard. Welcome to your safe space. How are you feeling right now mentally and physically?",
      emotion: 'calm',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');

    // 1. Add user message immediately
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 2. Call backend interaction endpoint
      const response = await apiClient.sendTextInteraction(userId, userText);
      const emotion = response.moodLog?.emotion || 'calm';
      const confidence = response.moodLog?.details?.confidence || 0.92;
      const comfort = buildComfortResponse({
        text: userText,
        emotion,
        urgency: response.moodLog?.details?.urgency || 'normal',
        topicFlags: response.moodLog?.details?.topicFlags || {},
        mode: 'text',
      });

      if (onMoodLogged) onMoodLogged(response.moodLog);

      // Attach detected emotion to user message
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, emotion, confidence } : m))
      );

      // 3. Generate empathetic reply
      setTimeout(() => {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `${comfort.message} ${comfort.followUp}`.trim(),
          emotion,
          timestamp: 'Just now',
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 700);
    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
    }
  };

  const handleChip = (promptText) => {
    setInput(promptText);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '620px',
      maxWidth: '820px',
      margin: '0 auto',
      width: '100%',
      padding: '0 16px',
    }}>
      {/* Messages Scroll Area */}
      <div className="glass-panel" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        background: 'rgba(14, 22, 38, 0.6)',
      }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              {!isUser && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6EC1E4 0%, #A8C6A5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Bot size={18} color="#070B14" />
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  background: isUser
                    ? 'linear-gradient(135deg, rgba(110, 193, 228, 0.25) 0%, rgba(168, 198, 165, 0.2) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isUser ? '1px solid rgba(110, 193, 228, 0.35)' : '1px solid var(--border-glass)',
                  padding: '14px 18px',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  color: 'var(--text-primary)',
                  fontSize: '0.94rem',
                  lineHeight: '1.55',
                }}>
                  {msg.text}
                </div>

                {/* Emotion Tag Pill on user messages */}
                {isUser && msg.emotion && (
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge-emotion ${msg.emotion}`}>
                      <HeartPulse size={10} />
                      {msg.emotion} {msg.confidence ? `(${Math.round(msg.confidence * 100)}%)` : ''}
                    </span>
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <User size={16} color="var(--text-secondary)" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6EC1E4 0%, #A8C6A5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={18} color="#070B14" />
            </div>
            <div className="glass-card" style={{ padding: '10px 16px', borderRadius: '18px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                MindGuard is reflecting...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '12px 0 8px 0',
      }}>
        {[
          'My workload has felt unmanageable lately',
          'I feel anxious about an upcoming presentation',
          'I achieved my primary milestone today!',
          'Need a quick grounding exercise',
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChip(chip)}
            className="btn-ghost"
            style={{ fontSize: '0.76rem', whiteSpace: 'nowrap', padding: '5px 12px' }}
          >
            <Sparkles size={11} color="var(--calm-blue)" />
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts, feelings, or stress triggers..."
          className="glass-input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" disabled={!input.trim() || isTyping}>
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>
      <p style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Short messages are enough. The app should adapt to your pace, not the other way around.
      </p>
    </div>
  );
}
