import { ref, set, get, update, remove, onValue, off, push, DatabaseReference } from "firebase/database";
import { db } from "./config";
import { User } from "firebase/auth";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  skills: string[];
  selectedRole?: string;
  roleRequirements?: {
    requiredSkills: string[];
    description: string;
    responsibilities: string[];
  };
  resumeText?: string;
  createdAt: number;
  updatedAt: number;
}

export const createUserProfile = async (user: User, additionalData?: any) => {
  if (!user || !db) return;

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    const { displayName, email } = user;
    const now = Date.now();
    try {
      await set(userRef, {
        uid: user.uid,
        displayName: displayName || additionalData?.displayName || "",
        email: email || "",
        skills: [],
        createdAt: now,
        updatedAt: now,
        ...additionalData,
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }
  return userRef;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) return null;
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const updateUserSkills = async (uid: string, skills: string[]) => {
  if (!db) return { success: false, error: "Database not initialized" };
  try {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, {
      skills,
      updatedAt: Date.now(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserRole = async (
  uid: string,
  selectedRole: string,
  roleRequirements: any
) => {
  if (!db) return { success: false, error: "Database not initialized" };
  try {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, {
      selectedRole,
      roleRequirements,
      updatedAt: Date.now(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserResume = async (uid: string, resumeText: string) => {
  if (!db) return { success: false, error: "Database not initialized" };
  try {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, {
      resumeText,
      updatedAt: Date.now(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!db) return { success: false, error: "Database not initialized" };
  try {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Interview Reports
export interface InterviewReport {
  id: string;
  uid: string;
  role?: string | null;
  question: string;
  transcript?: string | null;
  evaluation: any;
  mediaUrl?: string | null;
  createdAt: number;
  updatedAt: number;
}

export const createInterviewReport = async (payload: {
  uid: string;
  role?: string | null;
  question: string;
  transcript?: string | null;
  evaluation: any;
  mediaUrl?: string | null;
}) => {
  if (!db) {
    console.warn("Realtime Database not initialized - cannot save interview report");
    return { success: false, error: "Database not initialized" };
  }

  try {
    const reportsRef = ref(db, "interviewReports");
    const newReportRef = push(reportsRef);
    const now = Date.now();
    
    await set(newReportRef, {
      id: newReportRef.key,
      uid: payload.uid,
      role: payload.role || null,
      question: payload.question,
      transcript: payload.transcript || null,
      evaluation: payload.evaluation || null,
      mediaUrl: payload.mediaUrl || null,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id: newReportRef.key };
  } catch (error: any) {
    console.error("Error creating interview report:", error);
    return { success: false, error: error.message };
  }
};

export const getUserInterviewReports = async (uid: string): Promise<InterviewReport[]> => {
  if (!db) return [];
  try {
    const reportsRef = ref(db, "interviewReports");
    const snapshot = await get(reportsRef);
    if (snapshot.exists()) {
      const reports = snapshot.val();
      return Object.values(reports).filter((report: any) => report.uid === uid) as InterviewReport[];
    }
    return [];
  } catch (error) {
    console.error("Error getting interview reports:", error);
    return [];
  }
};

// Real-time listener for user profile
export const subscribeToUserProfile = (
  uid: string,
  callback: (profile: UserProfile | null) => void
): (() => void) => {
  if (!db) {
    callback(null);
    return () => {};
  }

  const userRef = ref(db, `users/${uid}`);
  const handleValue = (snapshot: any) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as UserProfile);
    } else {
      callback(null);
    }
  };

  onValue(userRef, handleValue);

  // Return unsubscribe function
  return () => {
    off(userRef, "value", handleValue);
  };
};

