import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const createUserProfile = async (user: User, additionalData?: any) => {
  if (!user) return;

  const userRef = doc(db!, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email } = user;
    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        email,
        skills: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...additionalData,
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }
  return userRef;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db!, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const updateUserSkills = async (uid: string, skills: string[]) => {
  try {
    const userRef = doc(db!, "users", uid);
    await updateDoc(userRef, {
      skills,
      updatedAt: serverTimestamp(),
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
  try {
    const userRef = doc(db!, "users", uid);
    await updateDoc(userRef, {
      selectedRole,
      roleRequirements,
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserResume = async (uid: string, resumeText: string) => {
  try {
    const userRef = doc(db!, "users", uid);
    await updateDoc(userRef, {
      resumeText,
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// New: createInterviewReport - stores the AI evaluation and user's response
export const createInterviewReport = async (payload: {
  uid: string;
  role?: string | null;
  question: string;
  transcript?: string | null;
  evaluation: any; // structured feedback from AI
  mediaUrl?: string | null; // optional URL if media is stored elsewhere
}) => {
  if (!db) {
    console.warn("Firestore not initialized - cannot save interview report");
    return { success: false, error: "Firestore not initialized" };
  }

  try {
    const reportsCol = collection(db!, "interviewReports");
    const docRef = await addDoc(reportsCol, {
      uid: payload.uid,
      role: payload.role || null,
      question: payload.question,
      transcript: payload.transcript || null,
      evaluation: payload.evaluation || null,
      mediaUrl: payload.mediaUrl || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error creating interview report:", error);
    return { success: false, error: error.message };
  }
};
