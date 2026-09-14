// web/src/services/api.js
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api');

async function requestJson(path, options = {}, fallback) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Request failed with ${response.status}`);
    }
    return data;
  } catch (error) {
    if (fallback) {
      return fallback(error);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  async sendTextInteraction(userId, text) {
    const data = await requestJson(
      '/interactions/text',
      {
        method: 'POST',
        body: JSON.stringify({ userId, text }),
      },
      (error) => {
        console.warn('API error sending text interaction, falling back to local reasoning:', error);
        return mockAnalysis('text', text);
      }
    );

    return { ...data, moodLog: normalizeMoodLog(data.moodLog) };
  },

  async sendVoiceInteraction(userId, audioBase64) {
    const data = await requestJson(
      '/interactions/voice',
      {
        method: 'POST',
        body: JSON.stringify({ userId, audioBase64 }),
      },
      (error) => {
        console.warn('API error sending voice interaction:', error);
        return mockAnalysis('voice');
      }
    );

    return { ...data, moodLog: normalizeMoodLog(data.moodLog) };
  },

  async sendVideoInteraction(userId, videoBase64) {
    const data = await requestJson(
      '/interactions/video',
      {
        method: 'POST',
        body: JSON.stringify({ userId, videoBase64 }),
      },
      (error) => {
        console.warn('API error sending video interaction:', error);
        return mockAnalysis('video');
      }
    );

    return { ...data, moodLog: normalizeMoodLog(data.moodLog) };
  },

  async getBurnoutRisk(userId) {
    return requestJson(
      `/mood/burnout-risk?userId=${encodeURIComponent(userId)}`,
      {},
      () => ({ burnoutRisk: 28, level: 'Low', status: 'Healthy equilibrium', trend: 'steady' })
    );
  },

  async getMoodHistory(userId) {
    const data = await requestJson(
      `/mood/history?userId=${encodeURIComponent(userId)}`,
      {},
      () => []
    );
    return Array.isArray(data) ? data.map(normalizeMoodLog) : [];
  },
};

function normalizeMoodLog(moodLog) {
  if (!moodLog) {
    return null;
  }

  return {
    id: moodLog.id || moodLog._id || `mood_${Date.now()}`,
    userId: moodLog.userId || moodLog.client_user_id || 'user_demo_01',
    emotion: moodLog.emotion || 'neutral',
    sourceMode: moodLog.sourceMode || moodLog.source_mode || 'text',
    timestamp: moodLog.timestamp || new Date().toISOString(),
    details: moodLog.details || {},
  };
}

function mockAnalysis(mode, text = '') {
  let emotion = 'calm';
  const lower = text.toLowerCase();
  if (/anxious|panic|worried|racing/.test(lower)) {
    emotion = 'anxious';
  } else if (/stress|overwhelm|burnout|deadline|pressure/.test(lower)) {
    emotion = 'stressed';
  } else if (/tired|exhausted|drained|no energy|sleepy/.test(lower)) {
    emotion = 'fatigued';
  } else if (/happy|great|good|peace|relaxed|grateful|joy/.test(lower)) {
    emotion = 'happy';
  } else {
    emotion = 'neutral';
  }

  return {
    message: 'Interaction processed',
    moodLog: normalizeMoodLog({
      id: 'mock_' + Date.now(),
      emotion,
      sourceMode: mode,
      timestamp: new Date().toISOString(),
      details: { confidence: 0.92, urgency: 'normal', topicFlags: {} },
    }),
  };
}
