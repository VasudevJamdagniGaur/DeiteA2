
import { neon } from "@neondatabase/serverless";
import { adminDb } from "./firebase-admin";

// PostgreSQL connection for structured data
const sql = neon(process.env.DATABASE_URL!);

// ---- Interfaces ----
export interface ChatMessage {
  userId: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  sessionDate: string; // YYYY-MM-DD format
}

export interface DailySummary {
  userId: string;
  date: string; // YYYY-MM-DD format
  summary: string;
  createdAt: Date;
}

// ---- Short-term memory: chat_messages (Firestore for real-time) ----

/**
 * Save a single chat message to Firestore
 */
export async function saveMessage(msg: ChatMessage) {
  await adminDb.collection("chat_messages").add({
    ...msg,
    timestamp: msg.timestamp
  });
}

/**
 * Fetch all messages for userId from a specific date
 */
export async function fetchMessagesForDate(userId: string, date: string): Promise<ChatMessage[]> {
  const snapshot = await adminDb
    .collection("chat_messages")
    .where("userId", "==", userId)
    .where("sessionDate", "==", date)
    .orderBy("timestamp", "asc")
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      timestamp: data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp)
    } as ChatMessage;
  });
}

/**
 * Fetch today's messages for a user
 */
export async function fetchTodayMessages(userId: string): Promise<ChatMessage[]> {
  const today = new Date().toISOString().slice(0, 10);
  return fetchMessagesForDate(userId, today);
}

/**
 * Get recent conversation context (last N messages from today)
 */
export async function getConversationContext(userId: string, limitCount = 10): Promise<ChatMessage[]> {
  const todayMessages = await fetchTodayMessages(userId);
  return todayMessages.slice(-limitCount);
}

// ---- Long-term memory: daily summaries (PostgreSQL for structured queries) ----

/**
 * Save a daily summary to PostgreSQL
 */
export async function saveDailySummary(summary: DailySummary) {
  await sql`
    INSERT INTO reflections (uid, date, content, created_at, updated_at)
    VALUES (${summary.userId}, ${summary.date}, ${summary.summary}, NOW(), NOW())
    ON CONFLICT (uid, date) 
    DO UPDATE SET 
      content = EXCLUDED.content,
      updated_at = NOW()
  `;
}

/**
 * Get the last N daily summaries for context
 */
export async function fetchLastSummaries(userId: string, limitCount = 5): Promise<string[]> {
  const results = await sql`
    SELECT content
    FROM reflections
    WHERE uid = ${userId}
    ORDER BY date DESC
    LIMIT ${limitCount}
  `;

  return results.map(row => row.content as string);
}

/**
 * Get daily summary for a specific date
 */
export async function getDailySummary(userId: string, date: string): Promise<string | null> {
  const results = await sql`
    SELECT content
    FROM reflections
    WHERE uid = ${userId} AND date = ${date}
    LIMIT 1
  `;

  return results.length > 0 ? results[0].content as string : null;
}

/**
 * Check if user has any previous reflections (for context building)
 */
export async function hasUserReflections(userId: string): Promise<boolean> {
  const results = await sql`
    SELECT COUNT(*) as count
    FROM reflections
    WHERE uid = ${userId}
  `;

  return parseInt(results[0].count as string) > 0;
}

/**
 * Get user's reflection history for the past N days
 */
export async function getReflectionHistory(userId: string, days = 7): Promise<Array<{date: string, content: string}>> {
  const results = await sql`
    SELECT date, content
    FROM reflections
    WHERE uid = ${userId}
    AND date >= CURRENT_DATE - INTERVAL '${days} days'
    ORDER BY date DESC
  `;

  return results.map(row => ({
    date: row.date as string,
    content: row.content as string
  }));
}

// ---- Utility functions ----

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Build conversation context string for AI prompts
 */
export function buildConversationContext(messages: ChatMessage[]): string {
  if (messages.length === 0) return "";
  
  return messages
    .map(msg => `${msg.sender}: ${msg.text}`)
    .join("\n");
}

/**
 * Build historical context from past summaries
 */
export function buildHistoricalContext(summaries: string[]): string {
  if (summaries.length === 0) return "";
  
  return "Previous reflections:\n" + summaries
    .map((summary, index) => `${index + 1}. ${summary}`)
    .join("\n");
}
