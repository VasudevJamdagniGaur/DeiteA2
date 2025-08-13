import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  where,
  Timestamp
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile, DailyReflection, ChatMessage } from "../types";

// Auth functions
export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return signOut(auth);
};

// Export signOut as alias to logOut
export { logOut as signOut };

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Profile functions
export const saveUserProfile = async (profile: UserProfile) => {
  const userRef = doc(db, "users", profile.uid);
  await setDoc(userRef, {
    ...profile,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

export const getProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

// Alias for getUserProfile (if imported elsewhere)
export const getUserProfile = getProfile;

// Daily reflection functions using new structure
export const saveReflection = async (uid: string, date: string, content: string) => {
  try {
    // Convert messages content to the new structure format
    const messagesArray = parseMessagesFromContent(content);

    // Save individual messages to new structure
    for (const message of messagesArray) {
      await addDoc(collection(db, "users", uid, "days", date, "chats"), {
        role: message.sender === "user" ? "user" : "ai",
        content: message.content,
        timestamp: Timestamp.fromDate(message.timestamp),
        sessionDate: date,
      });
    }

    console.log(`Reflection saved for user ${uid} on ${date}`);
  } catch (error) {
    console.error("Error saving reflection:", error);
    throw error;
  }
};

export const getReflection = async (uid: string, date: string): Promise<DailyReflection | null> => {
  try {
    // Get chats from new structure
    const chatsQuery = query(
      collection(db, "users", uid, "days", date, "chats"),
      orderBy("timestamp", "asc")
    );

    const chatsSnapshot = await getDocs(chatsQuery);

    if (chatsSnapshot.empty) {
      return null;
    }

    const messages: ChatMessage[] = chatsSnapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: `${data.role}-${index}`,
        sender: data.role === "user" ? "user" : "deite",
        content: data.content,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
      };
    });

    // Convert back to old content format for compatibility
    const content = messages
      .map(msg => `${msg.sender === "user" ? "You" : "Deite"}: ${msg.content}`)
      .join("\n");

    return {
      id: `${uid}-${date}`,
      uid,
      date,
      content,
      messages,
      createdAt: messages[0]?.timestamp || new Date(),
      updatedAt: messages[messages.length - 1]?.timestamp || new Date(),
    };
  } catch (error) {
    console.error("Error getting reflection:", error);
    return null;
  }
};

// Day reflect functions (for the new reflection system)
export const saveDayReflect = async (uid: string, date: string, reflectionText: string) => {
  try {
    await addDoc(collection(db, "users", uid, "days", date, "reflections"), {
      text: reflectionText,
      timestamp: Timestamp.fromDate(new Date()),
      generated: false,
    });
    console.log(`Day reflection saved for user ${uid} on ${date}`);
  } catch (error) {
    console.error("Error saving day reflection:", error);
    throw error;
  }
};

export const getDayReflect = async (uid: string, date: string): Promise<{ text: string } | null> => {
  try {
    const reflectionsQuery = query(
      collection(db, "users", uid, "days", date, "reflections"),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(reflectionsQuery);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return {
        text: data.text
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting day reflection:", error);
    return null;
  }
};

// Helper function to parse messages from old content format
const parseMessagesFromContent = (content: string): ChatMessage[] => {
  const lines = content.split('\n').filter(line => line.trim());
  const messages: ChatMessage[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith('Deite: ')) {
      messages.push({
        id: `deite-${index}`,
        sender: "deite",
        content: line.replace('Deite: ', ''),
        timestamp: new Date(),
      });
    } else if (line.startsWith('You: ')) {
      messages.push({
        id: `user-${index}`,
        sender: "user",
        content: line.replace('You: ', ''),
        timestamp: new Date(),
      });
    }
  });

  return messages.length > 0 ? messages : [{
    id: "1",
    sender: "deite",
    content: "Hi there! How are you feeling today? I'm here to listen and help you reflect. 💜",
    timestamp: new Date(),
  }];
};

// Get all reflections for a user (for calendar view)
export const getAllReflections = async (uid: string): Promise<DailyReflection[]> => {
  try {
    // This is a simplified version - in practice, you'd need to query all days
    // For now, return empty array as the calendar will be updated separately
    return [];
  } catch (error) {
    console.error("Error getting all reflections:", error);
    return [];
  }
};