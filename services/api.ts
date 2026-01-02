
import { SubjectConfig, GlobalConfig, StudentProfile } from '../types';

const CMS_SUBJECTS_KEY = 'tutorverse_backend_subjects';
const STUDENTS_KEY = 'tutorverse_students_registry';
const ACTIVE_SESSION_KEY = 'tutorverse_active_session';

const DEFAULT_SUBJECTS: SubjectConfig[] = [
  {
    id: 'math_10_cbse',
    board: 'CBSE',
    classLevel: 'Grade 10',
    title: 'Mathematics',
    faceId: '550e8400-e29b-41d4-a716-446655440000',
    voiceId: 'Kore',
    voiceService: 'gemini',
    speechifyVoiceId: 'henry',
    icon: 'fa-infinity',
    themeColor: 'from-blue-600 to-indigo-700',
    accentColor: 'text-blue-400',
    chapters: [{ id: 'm1', title: 'Polynomials', description: 'Algebraic foundations.', textbookBody: '...' }]
  },
  {
    id: 'sci_10_cbse',
    board: 'CBSE',
    classLevel: 'Grade 10',
    title: 'Science',
    faceId: '550e8400-e29b-41d4-a716-446655440001',
    voiceId: 'Zephyr',
    voiceService: 'gemini',
    speechifyVoiceId: 'kristy',
    icon: 'fa-flask',
    themeColor: 'from-emerald-600 to-teal-700',
    accentColor: 'text-emerald-400',
    chapters: [{ id: 's1', title: 'Chemical Reactions', description: 'Matter transformations.', textbookBody: '...' }]
  },
  {
    id: 'hist_10_cbse',
    board: 'CBSE',
    classLevel: 'Grade 10',
    title: 'History',
    faceId: '550e8400-e29b-41d4-a716-446655440002',
    voiceId: 'Charon',
    voiceService: 'gemini',
    speechifyVoiceId: 'joe',
    icon: 'fa-landmark',
    themeColor: 'from-amber-600 to-orange-700',
    accentColor: 'text-amber-400',
    chapters: [{ id: 'h1', title: 'World War I', description: 'Global conflicts.', textbookBody: '...' }]
  },
  {
    id: 'lit_9_icse',
    board: 'ICSE',
    classLevel: 'Grade 9',
    title: 'Literature',
    faceId: '550e8400-e29b-41d4-a716-446655440003',
    voiceId: 'Puck',
    voiceService: 'gemini',
    speechifyVoiceId: 'olivia',
    icon: 'fa-book-open',
    themeColor: 'from-rose-600 to-pink-700',
    accentColor: 'text-rose-400',
    chapters: [{ id: 'l1', title: 'The Merchant of Venice', description: 'Shakespearean drama.', textbookBody: '...' }]
  }
];

export const NeuralAPI = {
  async getSubjects(): Promise<SubjectConfig[]> {
    const saved = localStorage.getItem(CMS_SUBJECTS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  },
  async saveSubjects(subjects: SubjectConfig[]): Promise<void> {
    localStorage.setItem(CMS_SUBJECTS_KEY, JSON.stringify(subjects));
  },
  async getGlobalConfig(): Promise<GlobalConfig> {
    return { boards: ['CBSE', 'ICSE'], classes: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] };
  }
};

export const StudentAPI = {
  getRegistry: (): StudentProfile[] => JSON.parse(localStorage.getItem(STUDENTS_KEY) || '[]'),
  setActiveSession: (s: StudentProfile | null) => s ? localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(s)) : localStorage.removeItem(ACTIVE_SESSION_KEY),
  getActiveSession: (): StudentProfile | null => JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY) || 'null'),
  register: async (name: string, email: string, password?: string, parentEmail?: string, gradeLevel?: string): Promise<StudentProfile> => {
    const registry = StudentAPI.getRegistry();
    const student: StudentProfile = {
      id: `stud_${Date.now()}`,
      fullName: name, email, password,
      parentEmail: parentEmail || '',
      gradeLevel: gradeLevel || 'Grade 10',
      avatarSeed: Math.random().toString(36).substring(7),
      joinedAt: new Date().toISOString(),
      preferredLanguage: 'English',
      examHistory: [],
      sessionHistory: []
    };
    localStorage.setItem(STUDENTS_KEY, JSON.stringify([...registry, student]));
    return student;
  },
  login: async (email: string, password?: string): Promise<StudentProfile> => {
    const registry = StudentAPI.getRegistry();
    const student = registry.find((s: StudentProfile) => s.email === email && s.password === password);
    if (!student) throw new Error("Invalid credentials.");
    return student;
  },
  initiatePasswordRecovery: async (email: string): Promise<string> => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  resetPassword: async (email: string, recoveryCode: string, expectedCode: string, newPassword: string): Promise<void> => {
    if (recoveryCode !== expectedCode) throw new Error("Invalid code.");
    const registry = StudentAPI.getRegistry();
    const studentIndex = registry.findIndex((s: StudentProfile) => s.email === email);
    if (studentIndex === -1) throw new Error("Not found.");
    registry[studentIndex].password = newPassword;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(registry));
  }
};
