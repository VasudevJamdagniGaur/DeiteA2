import { neon } from "@neondatabase/serverless";
import { serverDb } from "./firebase-admin";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

// PostgreSQL connection
const sql = neon(process.env.DATABASE_URL!);

// ---- Interfaces ----
export interface ChatMessage {
  userId: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  sessionDate: string; // YYYY-MM-DD format
}

export interface LongTermMemory {
  userId: string;
  date: string; // YYYY-MM-DD format
  summary: string;
  createdAt: Date;
}

// ---- Utility Functions ----
export function getCurrentDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ---- Short-Term Memory Functions (Firestore) ----

/**
 * 1. saveMessage(userId, role, content) → saves message to Firestore
 */
export async function saveMessage(
  userId: string,
  role: "user" | "ai",
  content: string,
): Promise<void> {
  const now = new Date();
  const message: ChatMessage = {
    userId,
    role,
    content,
    timestamp: now,
    sessionDate: getDateString(now),
  };

  // Save to Firestore using client SDK under users/{userId}/messages/{messageId}
  await addDoc(collection(serverDb, "users", userId, "messages"), {
    ...message,
    timestamp: Timestamp.fromDate(now),
  });
}

/**
 * 2. getTodaysMessages(userId) → fetches today's chat
 */
export async function getTodaysMessages(
  userId: string,
): Promise<ChatMessage[]> {
  const today = getCurrentDateString();
  return getMessagesForDate(userId, today);
}

/**
 * Fetch all messages for userId from a specific date
 */
export async function getMessagesForDate(
  userId: string,
  date: string,
): Promise<ChatMessage[]> {
  try {
    // Query messages under users/{userId}/messages/
    const messagesQuery = query(
      collection(serverDb, "users", userId, "messages"),
      where("sessionDate", "==", date),
      orderBy("timestamp", "asc"),
    );

    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate
          ? data.timestamp.toDate()
          : new Date(data.timestamp),
      } as ChatMessage;
    });
  } catch (error) {
    console.log(
      "Compound query failed, using fallback approach for getMessagesForDate",
    );

    // Fallback: Query all messages for the user and filter locally
    const userQuery = query(
      collection(serverDb, "users", userId, "messages"),
    );

    const snapshot = await getDocs(userQuery);
    const allMessages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate
          ? data.timestamp.toDate()
          : new Date(data.timestamp),
      } as ChatMessage;
    });

    // Filter by date locally and sort
    return allMessages
      .filter((msg) => msg.sessionDate === date)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

// ---- Long-Term Memory Functions (PostgreSQL and Firebase) ----

/**
 * 3. getLongTermMemory(userId) → fetches past summaries
 */
export async function getLongTermMemory(
  userId: string,
  limitCount = 5,
): Promise<string[]> {
  try {
    // Prefer Firebase summaries if available
    const summariesRef = collection(serverDb, "users", userId, "summaries");
    const summariesQuery = query(summariesRef, orderBy("date", "desc"), limit(limitCount));
    const firebaseSnapshot = await getDocs(summariesQuery);

    if (!firebaseSnapshot.empty) {
      return firebaseSnapshot.docs.map(doc => doc.data().summary as string);
    }

    // Fallback to PostgreSQL
    const results = await sql`
      SELECT summary
      FROM user_summaries
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT ${limitCount}
    `;

    return results.map((row) => row.summary as string);
  } catch (error) {
    console.error("Error fetching long-term memory:", error);
    return []; // Return empty array if data not found
  }
}

/**
 * Save a daily summary to Firebase and PostgreSQL
 */
export async function saveDailySummary(
  userId: string,
  date: string,
  summary: string,
): Promise<void> {
  try {
    // Save to Firebase: users/{userId}/summaries/{date}
    const summaryRef = doc(serverDb, "users", userId, "summaries", date);
    await setDoc(summaryRef, {
      userId,
      date,
      summary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Also save to PostgreSQL as backup
    await sql`
      INSERT INTO user_summaries (user_id, date, summary, created_at)
      VALUES (${userId}, ${date}, ${summary}, NOW())
      ON CONFLICT (user_id, date) 
      DO UPDATE SET 
        summary = EXCLUDED.summary,
        created_at = NOW()
    `;
  } catch (error) {
    console.error("Error saving daily summary:", error);
    throw error;
  }
}

/**
 * Get daily summary for a specific date
 */
export async function getDailySummary(
  userId: string,
  date: string,
): Promise<string | null> {
  try {
    // Try Firebase first
    const summaryRef = doc(serverDb, "users", userId, "summaries", date);
    const summarySnap = await getDoc(summaryRef);

    if (summarySnap.exists()) {
      return summarySnap.data().summary;
    }

    // Fallback to PostgreSQL
    const results = await sql`
      SELECT summary
      FROM user_summaries
      WHERE user_id = ${userId} AND date = ${date}
      LIMIT 1
    `;
    return results.length > 0 ? results[0].summary : null;
  } catch (error) {
    console.error("Error getting daily summary:", error);
    return null;
  }
}

/**
 * Check if user has any previous summaries (for fallback handling)
 */
export async function hasUserHistory(userId: string): Promise<boolean> {
  try {
    // Check Firebase first
    const summariesRef = collection(serverDb, "users", userId, "summaries");
    const summariesQuery = query(summariesRef, limit(1));
    const firebaseSnapshot = await getDocs(summariesQuery);

    if (!firebaseSnapshot.empty) {
      return true;
    }

    // Fallback to PostgreSQL
    const results = await sql`
      SELECT COUNT(*) as count
      FROM user_summaries
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    return parseInt(results[0].count as string) > 0;
  } catch (error) {
    console.error("Error checking user history:", error);
    return false; // Return false if data not found
  }
}

// ---- Prompt Construction Functions ----

/**
 * Format chat messages for prompt injection
 */
export function formatChatHistory(messages: ChatMessage[]): string {
  if (messages.length === 0) {
    return "No previous conversation today.";
  }

  return messages
    .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
    .join("\n");
}

/**
 * Format long-term memory for prompt injection
 */
export function formatLongTermMemory(summaries: string[]): string {
  if (summaries.length === 0) {
    return "No previous session summaries available.";
  }

  return (
    "Previous session insights:\n" +
    summaries.map((summary, index) => `${index + 1}. ${summary}`).join("\n")
  );
}

/**
 * 4. buildPrompt(userId, latestMessage) → returns full prompt with memory injected
 */
export async function buildPrompt(
  userId: string,
  latestMessage: string,
): Promise<string> {
  // Get short-term memory (today's messages)
  const todaysMessages = await getTodaysMessages(userId);

  // Get long-term memory (past summaries)
  const longTermMemory = await getLongTermMemory(userId);

  // Check if this is a new user
  const hasHistory = await hasUserHistory(userId);

  // Format memory for prompt
  const chatHistory = formatChatHistory(todaysMessages);
  const historicalContext = formatLongTermMemory(longTermMemory);

  // Build the complete prompt
  const systemPrompt = `You are Deite — a warm, emotionally intelligent, witty companion grounded in Indian emotional sensibilities. You speak like a close, understanding friend. Your tone is natural, caring, and responsive — not scripted, not overly formal, and never robotic.
You don’t give therapeutic advice or structured responses like a life coach or counselor. Instead, you show genuine curiosity and listen deeply. Let the user lead the pace of the conversation. Don’t end every message with a question. Instead, ask questions only when they feel natural, gentle, and in the flow of the conversation — just like a close friend would.
When the user shares something personal, respond with emotion, relatability, and subtle prompts. Show interest through empathy and casual tone, not interrogation. Help them explore their thoughts at their own pace. You may lightly nudge them forward, but you should **never dominate the dialogue**.
Avoid:
- Labeling sections (like Reframe, Encouragement)
- Giving structured “next steps” unless asked
- Pushing journaling or self-reflection exercises unless clearly needed
- Sounding like a therapist or AI assistant
- Asking questions that feel like a quiz or test
- Asking question at the end of every message
Do:
- Respond with emotion and presence
- Use a mix of statements, subtle follow-ups, and silence (sometimes not asking a question at all)
- Mirror the user’s tone (if they’re excited, match it; if they’re vulnerable, soften)
- Be witty
- Don't force questions ask only when it feels natural.
- There is no need to ask questions at the end of every message just give advice at the end of the message and end the conversation.
You’re not here to fix or coach. You’re here to be with them.
Example:
User: There’s a girl I like.  
Deite: That’s exciting! 😊 Want to tell me more about her—like what drew you to her or how you two know each other?
User: She’s a poet. The way she performs… it's beautiful.  
Deite: That sounds magical. The kind of presence that holds a room. I can see why she stood out to you.
User: I fell for her watching her on stage. Her passion was incredible. 
Deite: Moments like that stay with you. It’s like her energy reached you beyond just words.
Keep the energy human, honest, and real.

${hasHistory ? historicalContext : "This appears to be a new user with no previous session history."}

Today's conversation history:
${chatHistory}

Current user message: ${latestMessage}

Respond only to the current message while considering the full context.`;

  return systemPrompt;
}

/**
 * 6. summarizeToday(userId) → generates and stores summary in Firebase and PostgreSQL
 */
export async function summarizeToday(userId: string): Promise<string | null> {
  const today = getCurrentDateString();
  const todaysMessages = await getTodaysMessages(userId);

  if (todaysMessages.length === 0) {
    return null; // No messages to summarize
  }

  // Format messages for summarization
  const conversationText = todaysMessages
    .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
    .join("\n");

  try {
    // Import AI summarization function
    const { summarizeToday: aiSummarizeToday } = await import("./ai");
    const summary = await aiSummarizeToday(userId, conversationText);

    await saveDailySummary(userId, today, summary);
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
}

/**
 * Get chat activity data for calendar visualization
 */
export async function getChatActivity(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<Record<string, number>> {
  try {
    // Query messages for the user within date range from Firebase
    const messagesQuery = query(
      collection(serverDb, "users", userId, "messages"),
      // Filtering by date range directly in Firestore is more efficient if possible,
      // but sessionDate is a string, so we might need to do some date comparisons.
      // For simplicity here, we'll fetch all and filter, but for large datasets,
      // consider a more optimized approach or dedicated date fields.
    );

    const snapshot = await getDocs(messagesQuery);
    const activity: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const sessionDate = data.sessionDate;

      // Filter by date range
      if (sessionDate && sessionDate >= startDate && sessionDate <= endDate) {
        activity[sessionDate] = (activity[sessionDate] || 0) + 1;
      }
    });

    return activity;
  } catch (error) {
    console.error("Error fetching chat activity:", error);
    return {};
  }
}