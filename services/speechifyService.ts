
/**
 * Speechify Service
 * This service handles high-quality TTS using Speechify's API.
 */

export const PREMIUM_VOICES = [
  { id: 'henry', name: 'Henry (Formal)', gender: 'Male' },
  { id: 'kristy', name: 'Kristy (Clear)', gender: 'Female' },
  { id: 'olivia', name: 'Olivia (Warm)', gender: 'Female' },
  { id: 'joe', name: 'Joe (Direct)', gender: 'Male' },
  { id: 'snoop', name: 'Snoop (Cool)', gender: 'Male' }
];

export const generateSpeechifyAudio = async (
  text: string, 
  voiceId: string = 'henry'
): Promise<ArrayBuffer | null> => {
  const apiKey = process.env.SPEECHIFY_API_KEY;
  
  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    console.warn("[Speechify] API Key missing in environment.");
    return null;
  }

  try {
    const response = await fetch('https://api.switt.ai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: `<speak>${text}</speak>`,
        voice_id: voiceId,
        audio_format: 'mp3'
      })
    });

    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch (error) {
    console.error("[Speechify] Network Error:", error);
    return null;
  }
};

export const decodeToPCM = async (
  arrayBuffer: ArrayBuffer,
  audioContext: AudioContext
): Promise<{ audioBuffer: AudioBuffer; pcmData: Uint8Array }> => {
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  const pcm16 = new Int16Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    audioBuffer,
    pcmData: new Uint8Array(pcm16.buffer)
  };
};
