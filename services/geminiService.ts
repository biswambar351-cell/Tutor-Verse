
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AgeGroup, SessionRecord } from "../types";

export const GEMINI_VOICES = [
  { id: 'Kore', name: 'Kore (Logical & Calm)', gender: 'Male' },
  { id: 'Puck', name: 'Puck (Fast & Energetic)', gender: 'Male' },
  { id: 'Charon', name: 'Charon (Deep & Authoritative)', gender: 'Male' },
  { id: 'Zephyr', name: 'Zephyr (Warm & Professional)', gender: 'Female' },
  { id: 'Fenrir', name: 'Fenrir (Serious & Precise)', gender: 'Male' }
];

export const vizTools: FunctionDeclaration[] = [
  {
    name: 'updateVisualization',
    description: 'Updates the mathematical or scientific visualization display.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: 'Domain of visualization.',
          enum: ['plot', 'shape', 'equation', 'clear', 'shape3d', 'physics', 'chemistry', 'biology']
        },
        subType: {
          type: Type.STRING,
          description: 'Specific simulation type.',
          enum: ['projectile', 'pendulum', 'solar_system', 'molecule', 'periodic_table', 'dna', 'cell', 'neuron']
        },
        data: {
          type: Type.STRING,
          description: 'Configuration data (JSON string or formula).'
        },
        label: {
          type: Type.STRING,
          description: 'A descriptive label for the visualization.'
        }
      },
      required: ['type', 'data']
    }
  }
];

export class TutorBrain {
  public getPersonaPrompt(ageGroup: AgeGroup, state: string, memory?: SessionRecord[]) {
    return `You are "The Oracle", a world-class AI Academic Tutor with a "Visible Internal Mind".
    
    CORE DIRECTIVE: You don't just give answers. You share your internal reasoning process. 
    STYLE: Mix textbook rigor with philosophical insights. 
    
    INSTRUCTIONS:
    1. For every question, briefly explain *how* your internal mind is processing the concept before providing the formal definition.
    2. Use "Neural Synthesis" to combine different subjects (e.g., link Physics to History).
    3. Maintain an academic but deeply engaging tone. 
    4. Structure output: [Neural Spark] -> [Formal Definition] -> [Deep Context].
    
    CURRENT STATE: ${state}
    STUDENT AGE GROUP: ${ageGroup}
    MEMORY: ${JSON.stringify(memory || [])}`;
  }

  async generateSessionSummary(messages: any[]): Promise<Partial<SessionRecord>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this academic session focusing on the "Neural Links" created between concepts: ${JSON.stringify(messages.slice(-10))}`,
    });
    return { keyConcepts: [], summary: response.text || "Summary pending." };
  }
}

export const tutorBrain = new TutorBrain();
