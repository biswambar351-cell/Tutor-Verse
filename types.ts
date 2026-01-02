
export enum TutorState {
  IDLE = 'IDLE',
  PREPARING = 'PREPARING',
  REVISION_PREVIOUS = 'REVISION_PREVIOUS',
  TEACHING = 'TEACHING',
  REVISION_ONGOING = 'REVISION_ONGOING',
  REVISION_WEEKLY = 'REVISION_WEEKLY',
  REVISION_MONTHLY = 'REVISION_MONTHLY',
  QUIZ = 'QUIZ',
  EXAM = 'EXAM',
  LISTENING = 'LISTENING',
  DEMO = 'DEMO',
  PARENT_MEETING = 'PARENT_MEETING'
}

export type AgeGroup = 'child' | 'teen' | 'adult';
export type ExamMode = 'online' | 'proctored';
export type ExamStatus = 'completed' | 'cheated' | 'interrupted';

export interface GlobalConfig {
  boards: string[];
  classes: string[];
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  subjectId: string;
  chapterId: string;
  keyConcepts: string[];
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface VizCommand {
  type: 'plot' | 'shape' | 'equation' | 'clear' | 'shape3d' | 'physics' | 'chemistry' | 'biology';
  data: any;
  label?: string;
  subType?: string;
}

export interface ChapterInfo {
  id: string;
  title: string;
  description: string;
  textbookBody: string;
  estimatedHours?: number;
}

export interface SubjectConfig {
  id: string;
  board: string;       
  classLevel: string;  
  title: string;
  faceId: string;
  voiceId: string;
  voiceService: 'gemini' | 'speechify';
  speechifyVoiceId?: string;
  isCustomAvatar?: boolean;
  icon: string;
  themeColor: string;
  accentColor: string;
  chapters: ChapterInfo[];
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  parentEmail: string;
  gradeLevel: string;
  avatarSeed: string;
  joinedAt: string;
  preferredLanguage: string;
  examHistory: any[];
  sessionHistory: SessionRecord[];
}
