import {
  buildComfortResponse,
  buildSomaticAdvice,
  fuseWellnessSignals,
} from './wellnessIntelligence';

class MultimodalAIReasoning {
  constructor() {
    this.conversationHistory = [];
  }

  /**
   * Synthesizes Voice Transcript, Facial Expression, and Vocal Tone into deep empathetic guidance.
   * @param {string} userSpeech - What the user spoke/typed
   * @param {object} facialData - Real-time facial emotion & tension metrics
   * @param {string} vocalEmotion - Detected voice tone
   */
  async synthesizeAndRespond(userSpeech, facialData = {}, vocalEmotion = 'neutral') {
    const text = (userSpeech || '').trim();
    const previousEmotion = this.conversationHistory.filter((entry) => entry.role === 'user').at(-1)?.emotion;
    const fusion = fuseWellnessSignals({
      text,
      backendEmotion: vocalEmotion,
      vocalEmotion,
      facialData,
      previousEmotion,
    });

    this.conversationHistory.push({
      role: 'user',
      text,
      emotion: fusion.emotion,
      timestamp: Date.now(),
    });

    const comfort = buildComfortResponse({
      text,
      emotion: fusion.emotion,
      urgency: fusion.urgency,
      topicFlags: fusion.topicFlags,
      tension: fusion.tension,
      mode: 'combo',
    });
    const response = `${comfort.message} ${comfort.followUp}`.trim();
    this.conversationHistory.push({ role: 'assistant', text: response, timestamp: Date.now() });

    return {
      fusedEmotion: fusion.emotion,
      confidence: fusion.confidence,
      response,
      somaticAdvice:
        comfort.somaticAdvice ||
        buildSomaticAdvice({
          emotion: fusion.emotion,
          topicFlags: fusion.topicFlags,
          tension: fusion.tension,
        }),
    };
  }
}

export const aiReasoningEngine = new MultimodalAIReasoning();
