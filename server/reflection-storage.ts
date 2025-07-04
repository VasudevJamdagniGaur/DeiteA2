import { serverDb } from "./firebase-admin";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from "firebase/firestore";

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface DayReflection {
  chat: ChatMessage[];
  reflection?: string;
  createdAt: Date;
}

/**
 * Get the current date string in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get or create a day's reflection document
 */
export async function getDayReflection(userId: string, date: string): Promise<DayReflection | null> {
  try {
    const reflectionRef = doc(serverDb, `users/${userId}/reflections/${date}`);
    const docSnap = await getDoc(reflectionRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        chat: data.chat || [],
        reflection: data.reflection,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting day reflection:", error);
    return null;
  }
}

/**
 * Save a new chat message to today's reflection
 */
export async function saveChatMessage(userId: string, role: "user" | "ai", content: string): Promise<void> {
  const today = getCurrentDateString();
  const reflectionRef = doc(serverDb, `users/${userId}/reflections/${today}`);
  
  const message = {
    role,
    content,
    timestamp: Timestamp.fromDate(new Date())
  };
  
  try {
    // Check if document exists
    const docSnap = await getDoc(reflectionRef);
    
    if (docSnap.exists()) {
      // Update existing document with new message
      await updateDoc(reflectionRef, {
        chat: arrayUnion(message)
      });
    } else {
      // Create new document
      await setDoc(reflectionRef, {
        chat: [message],
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
}

/**
 * Update the reflection summary for a specific day
 */
export async function updateDayReflection(userId: string, date: string, reflection: string): Promise<void> {
  const reflectionRef = doc(serverDb, `users/${userId}/reflections/${date}`);
  
  try {
    await updateDoc(reflectionRef, {
      reflection: reflection
    });
  } catch (error) {
    console.error("Error updating day reflection:", error);
    throw error;
  }
}

/**
 * Get today's chat messages
 */
export async function getTodaysChat(userId: string): Promise<ChatMessage[]> {
  const today = getCurrentDateString();
  const dayReflection = await getDayReflection(userId, today);
  return dayReflection?.chat || [];
}

/**
 * Check if a reflection already exists for today
 */
export async function hasReflectionForToday(userId: string): Promise<boolean> {
  const today = getCurrentDateString();
  const dayReflection = await getDayReflection(userId, today);
  return dayReflection !== null && !!dayReflection.reflection;
}

/**
 * Get reflection history for a user (last N days)
 */
export async function getReflectionHistory(userId: string, days: number = 7): Promise<Array<{date: string, reflection: string}>> {
  const history: Array<{date: string, reflection: string}> = [];
  
  // Get the last N days
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayReflection = await getDayReflection(userId, dateString);
    if (dayReflection && dayReflection.reflection) {
      history.push({
        date: dateString,
        reflection: dayReflection.reflection
      });
    }
  }
  
  return history;
}