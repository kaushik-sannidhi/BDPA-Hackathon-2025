import { create } from "zustand";
import { openDB } from "idb";

export interface AnswerFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keyPoints: string[];
}

export interface AnswerRecord {
  id: string;
  question: string;
  transcript: string;
  videoUrl?: string;
  feedback: AnswerFeedback;
  role: string;
  timestamp: number;
}

interface AppState {
  answeredQuestions: AnswerRecord[];
  addAnsweredQuestion: (answer: AnswerRecord) => void;
  loadAnsweredQuestions: () => Promise<void>;
  deleteAllAnsweredQuestions: () => Promise<void>;
  
  // Other state from original store
  resumeSkills: string[];
  selectedRole: string;
  setResumeSkills: (skills: string[]) => void;
  setSelectedRole: (role: string) => void;
  interviewState: "idle" | "prepping" | "live" | "reviewing";
  setInterviewState: (state: "idle" | "prepping" | "live" | "reviewing") => void;
}

// --- IndexedDB utilities ---
const DB_NAME = "resume-coach-db";
const DB_VERSION = 2; // Bump version for schema change
const STORE_NAME = "answeredQuestions";

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('sessions')) {
          db.deleteObjectStore('sessions');
        }
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      }
    },
  });
}

async function addSingleAnswerToDB(question: AnswerRecord) {
    const db = await getDB();
    await db.put(STORE_NAME, question);
}

async function loadAnsweredQuestionsFromDB(): Promise<AnswerRecord[]> {
  const db = await getDB();
  return (await db.getAll(STORE_NAME)) || [];
}

async function clearAllAnsweredQuestionsFromDB() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

// --- Zustand Store ---
export const useAppStore = create<AppState>((set) => ({
  answeredQuestions: [],
  interviewState: "idle",
  resumeSkills: [],
  selectedRole: "Frontend",

  setInterviewState: (state) => set({ interviewState: state }),
  setResumeSkills: (skills) => set({ resumeSkills: skills }),
  setSelectedRole: (role) => set({ selectedRole: role }),

  addAnsweredQuestion: async (answer) => {
    set((state) => ({
      answeredQuestions: [...state.answeredQuestions, answer],
    }));
    await addSingleAnswerToDB(answer);
  },

  loadAnsweredQuestions: async () => {
    const questions = await loadAnsweredQuestionsFromDB();
    set({ answeredQuestions: questions });
  },

  deleteAllAnsweredQuestions: async () => {
    await clearAllAnsweredQuestionsFromDB();
    set({ answeredQuestions: [] });
  },
}));