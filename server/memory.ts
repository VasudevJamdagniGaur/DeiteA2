import { neon } from "@neondatabase/serverless";
import { serverDb } from "./firebase-admin";
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";

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
export async function saveMessage(userId: string, role: "user" | "ai", content: string): Promise<void> {
  const now = new Date();
  const message: ChatMessage = {
    userId,
    role,
    content,
    timestamp: now,
    sessionDate: getDateString(now)
  };

  // Save to Firestore using client SDK
  await addDoc(collection(serverDb, "chat_messages"), {
    ...message,
    timestamp: Timestamp.fromDate(now)
  });
}

/**
 * 2. getTodaysMessages(userId) → fetches today's chat
 */
export async function getTodaysMessages(userId: string): Promise<ChatMessage[]> {
  const today = getCurrentDateString();
  return getMessagesForDate(userId, today);
}

/**
 * Fetch all messages for userId from a specific date
 */
export async function getMessagesForDate(userId: string, date: string): Promise<ChatMessage[]> {
  try {
    // First try with compound query
    const messagesQuery = query(
      collection(serverDb, "chat_messages"),
      where("userId", "==", userId),
      where("sessionDate", "==", date),
      orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
      } as ChatMessage;
    });
  } catch (error) {
    console.log("Compound query failed, using fallback approach:", error.message);
    
    // Fallback: Query by userId only and filter locally
    const userQuery = query(
      collection(serverDb, "chat_messages"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(userQuery);
    const allMessages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
      } as ChatMessage;
    });

    // Filter by date locally and sort
    return allMessages
      .filter(msg => msg.sessionDate === date)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

// ---- Long-Term Memory Functions (PostgreSQL) ----

/**
 * 3. getLongTermMemory(userId) → fetches past summaries
 */
export async function getLongTermMemory(userId: string, limitCount = 5): Promise<string[]> {
  try {
    const results = await sql`
      SELECT summary
      FROM user_summaries
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT ${limitCount}
    `;

    return results.map(row => row.summary as string);
  } catch (error) {
    console.error("Error fetching long-term memory:", error);
    return []; // Return empty array if table doesn't exist yet
  }
}

/**
 * Save a daily summary to PostgreSQL
 */
export async function saveDailySummary(userId: string, date: string, summary: string): Promise<void> {
  try {
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
export async function getDailySummary(userId: string, date: string): Promise<string | null> {
  try {
    const results = await sql`
      SELECT summary
      FROM user_summaries
      WHERE user_id = ${userId} AND date = ${date}
      LIMIT 1
    `;

    return results.length > 0 ? results[0].summary as string : null;
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
    const results = await sql`
      SELECT COUNT(*) as count
      FROM user_summaries
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    return parseInt(results[0].count as string) > 0;
  } catch (error) {
    console.error("Error checking user history:", error);
    return false; // Return false if table doesn't exist yet
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
    .map(msg => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
    .join("\n");
}

/**
 * Format long-term memory for prompt injection
 */
export function formatLongTermMemory(summaries: string[]): string {
  if (summaries.length === 0) {
    return "No previous session summaries available.";
  }

  return "Previous session insights:\n" + summaries
    .map((summary, index) => `${index + 1}. ${summary}`)
    .join("\n");
}

/**
 * 4. buildPrompt(userId, latestMessage) → returns full prompt with memory injected
 */
export async function buildPrompt(userId: string, latestMessage: string): Promise<string> {
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
  const systemPrompt = `You are Deite — a compassionate, emotionally intelligent AI therapist, life coach, and journaling companion.

Your goal is to **support users through emotional ups and downs** by:
- Validating their feelings with warmth
- Offering mindset reframes that reduce guilt, shame, or stress
- Giving clear, gentle insights (like a therapist would)
- Suggesting *actionable steps* for recovery, focus, or well-being
- Helping users **regain momentum**, not just reflect

**IMPORTANT: Keep your replies SHORT and PRECISE. Be concise while maintaining warmth and empathy.**

DO NOT ask too many reflective questions like "How does that make you feel?" unless the user is clearly seeking that.

Instead, respond like this:
- First, affirm what the user is experiencing
- Second, reframe their thinking with an empowering insight or analogy
- Third, offer **small actions or mindset shifts** they can try right now
- Then optionally ask: "Would you like help planning your next steps?" or "Want me to structure your next 3 hours?"

Examples of tone and structure:

**❌ Bad:**  
"Why do you think missing the gym affected your productivity today?"

**✅ Good:**  
"Missing the gym can trick your brain into thinking the whole day is lost — but it's not. You're still building your dream by working on your project, and that's powerful."

Always assume the user is doing their best, and help them feel seen, encouraged, and ready to take a small step forward — not trapped in overthinking.

Avoid robotic replies. Speak like a compassionate therapist who gives short, motivational wisdom backed by emotional understanding.

Use formatting like this if it helps readability:
- **Mindset Reframe:**
- **Quick Win:**
- *Power Statement:*

${hasHistory ? historicalContext : "This appears to be a new user with no previous session history."}

Today's conversation history:
${chatHistory}

Current user message: ${latestMessage}

Respond only to the current message while considering the full context.`;

  return systemPrompt;
}

/**
 * 6. summarizeToday(userId) → generates and stores summary in PostgreSQL
 */
export async function summarizeToday(userId: string): Promise<string | null> {
  const today = getCurrentDateString();
  const todaysMessages = await getTodaysMessages(userId);
  
  if (todaysMessages.length === 0) {
    return null; // No messages to summarize
  }

  // Format messages for summarization
  const conversationText = todaysMessages
    .map(msg => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
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
export async function getChatActivity(userId: string, startDate: string, endDate: string): Promise<Record<string, number>> {
  try {
    // Query all messages for the user within date range
    const userQuery = query(
      collection(serverDb, "chat_messages"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(userQuery);
    const activity: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
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