import { create } from "zustand";

export type InterviewState = "idle" | "prepping" | "live" | "reviewing";

export interface SessionMetrics {
  eyeContact: number; // percentage
  smile: number; // percentage
  posture: number; // percentage (based on head pose)
  speakingRatio: number; // percentage
  fillerWords: number; // count per minute
  timestamp: number;
}

export interface SessionSummary {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  metrics: SessionMetrics[];
  role: string;
  skills: string[];
  feedback?: {
    bullets: string[];
    tips: string[];
  };
}

interface AppState {
  interviewState: InterviewState;
  currentSession: SessionSummary | null;
  sessions: SessionSummary[];
  resumeSkills: string[];
  selectedRole: string;
  setInterviewState: (state: InterviewState) => void;
  startSession: (role: string, skills: string[]) => void;
  addMetrics: (metrics: SessionMetrics) => void;
  endSession: () => void;
  setResumeSkills: (skills: string[]) => void;
  setSelectedRole: (role: string) => void;
  loadSessions: () => Promise<void>;
  deleteAllSessions: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  interviewState: "idle",
  currentSession: null,
  sessions: [],
  resumeSkills: [],
  selectedRole: "Frontend",
  setInterviewState: (state) => set({ interviewState: state }),
  startSession: (role, skills) => {
    const session: SessionSummary = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      metrics: [],
      role,
      skills,
    };
    set({ currentSession: session, interviewState: "prepping" });
  },
  addMetrics: (metrics) => {
    const { currentSession } = get();
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          metrics: [...currentSession.metrics, metrics],
        },
      });
    }
  },
  endSession: async () => {
    const { currentSession } = get();
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: Date.now(),
        duration: Date.now() - currentSession.startTime,
      };
      // Save to IndexedDB
      await saveSessionToDB(endedSession);
      set({
        currentSession: null,
        interviewState: "reviewing",
        sessions: [...get().sessions, endedSession],
      });
    }
  },
  setResumeSkills: (skills) => set({ resumeSkills: skills }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  loadSessions: async () => {
    const sessions = await loadSessionsFromDB();
    set({ sessions });
  },
  deleteAllSessions: async () => {
    await clearAllSessionsFromDB();
    set({ sessions: [], currentSession: null });
  },
}));

// IndexedDB utilities
const DB_NAME = "resume-coach-db";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

async function getDB() {
  const { openDB } = await import("idb");
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

async function saveSessionToDB(session: SessionSummary) {
  const db = await getDB();
  await db.put(STORE_NAME, session);
}

async function loadSessionsFromDB(): Promise<SessionSummary[]> {
  const db = await getDB();
  return (await db.getAll(STORE_NAME)) || [];
}

async function clearAllSessionsFromDB() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

