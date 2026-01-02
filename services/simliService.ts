
/**
 * Simli Service
 * Direct integration with Simli API (v1) using raw WebRTC.
 */

export class SimliClient {
  private static instance: SimliClient;
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private stream: MediaStream | null = null;

  static getInstance() {
    if (!SimliClient.instance) {
      SimliClient.instance = new SimliClient();
    }
    return SimliClient.instance;
  }

  async connect(faceId: string, onStream: (s: MediaStream) => void): Promise<void> {
    const apiKey = process.env.SIMLI_API_KEY;
    
    if (!apiKey || apiKey.includes('PLACEHOLDER')) {
      console.error("[Simli] Neural Link failed: SIMLI_API_KEY is missing or invalid in environment.");
      return;
    }

    try {
      const sessionResponse = await fetch('https://api.simli.ai/v1/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          face_id: faceId || '550e8400-e29b-41d4-a716-446655440000', // Default fallback
          is_sync: true
        })
      });

      if (!sessionResponse.ok) throw new Error("Simli Session Initialization Failed");

      const { session_token } = await sessionResponse.json();

      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      this.dc = this.pc.createDataChannel('datachannel', { ordered: true });
      
      this.pc.ontrack = (event) => {
        if (event.track.kind === 'video') {
          this.stream = new MediaStream([event.track]);
          onStream(this.stream);
        }
      };

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      
      console.log(`[Simli] Link established for face: ${faceId.substring(0,8)}...`);
    } catch (e) {
      console.error("[Simli] WebRTC Error:", e);
    }
  }

  sendAudioData(audioData: Uint8Array) {
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(audioData);
    }
  }

  disconnect() {
    this.pc?.close();
    this.pc = null;
    this.dc = null;
    this.stream = null;
  }
}

export const simliClient = SimliClient.getInstance();
