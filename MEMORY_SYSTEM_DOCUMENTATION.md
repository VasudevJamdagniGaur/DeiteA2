# AI Memory System Documentation

## Overview

The AI memory system provides dual-layer memory capabilities for the Deite mental health companion app:

1. **Short-Term Memory**: Stores daily chat messages in Firestore for real-time access
2. **Long-Term Memory**: Stores conversation summaries in PostgreSQL for persistent insights

## Core Functions

### 1. saveMessage(userId, role, content)
**Purpose**: Saves a single chat message to Firestore
```typescript
await saveMessage("user123", "user", "I'm feeling anxious today");
await saveMessage("user123", "ai", "I understand you're feeling anxious...");
```

### 2. getTodaysMessages(userId)
**Purpose**: Retrieves all chat messages from today for a specific user
```typescript
const messages = await getTodaysMessages("user123");
// Returns: ChatMessage[] with role, content, timestamp, sessionDate
```

### 3. getLongTermMemory(userId, limit?)
**Purpose**: Fetches past conversation summaries for context
```typescript
const summaries = await getLongTermMemory("user123", 5);
// Returns: string[] of summarized insights
```

### 4. buildPrompt(userId, latestMessage)
**Purpose**: Constructs AI prompt with both memory types injected
```typescript
const prompt = await buildPrompt("user123", "How can I manage stress?");
// Returns: Complete prompt with conversation history and past insights
```

### 5. generateReply(userId, userMessage)
**Purpose**: Core handler that processes user input and returns AI response
```typescript
const reply = await generateReply("user123", "I need help with anxiety");
// Automatically saves messages and uses memory context
```

### 6. summarizeToday(userId)
**Purpose**: Generates and stores daily summary in PostgreSQL
```typescript
const summary = await summarizeToday("user123");
// Creates summary of day's conversation for long-term memory
```

## API Endpoints

### Chat Endpoints
- `POST /api/chat` - Send message and get AI reply
- `POST /api/summary` - Generate daily summary

### Memory Endpoints
- `GET /api/memory/messages/today/:userId` - Get today's messages
- `GET /api/memory/messages/:userId/:date` - Get messages for specific date
- `GET /api/memory/summaries/:userId` - Get long-term memory summaries
- `GET /api/memory/summary/:userId/:date` - Get summary for specific date
- `GET /api/memory/history/:userId` - Check if user has conversation history
- `POST /api/memory/summarize/:userId` - Generate and save today's summary

## Data Schema

### ChatMessage (Firestore)
```typescript
interface ChatMessage {
  userId: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  sessionDate: string; // YYYY-MM-DD format
}
```

### UserSummary (PostgreSQL)
```sql
CREATE TABLE user_summaries (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Memory Flow

### During Conversation
1. User sends message → `saveMessage()` stores in Firestore
2. System calls `buildPrompt()` → Retrieves today's messages + past summaries
3. AI generates response → `saveMessage()` stores AI reply
4. Response sent to user

### End of Day
1. System calls `summarizeToday()` 
2. Retrieves all messages from today
3. AI generates summary focusing on emotional state and insights
4. Summary stored in PostgreSQL for future context

## Configuration

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - (Optional) For enhanced AI summarization
- Firebase configuration for Firestore access

### Fallback Behavior
- If Anthropic API unavailable, falls back to RunPod/Ollama
- If no long-term memory exists, system provides appropriate context for new users
- If summarization fails, provides basic fallback summary

## Usage Example

```javascript
// In chat route
const reply = await generateReply(userId, userMessage);

// For daily summary (scheduled task)
const summary = await summarizeToday(userId);

// To check user's conversation history
const hasHistory = await hasUserHistory(userId);

// To get memory for custom prompts
const todayMessages = await getTodaysMessages(userId);
const longTermMemory = await getLongTermMemory(userId, 3);
```

## Integration Notes

- Frontend sends `userId` and `message` to `/api/chat`
- System automatically handles memory storage and retrieval
- No changes needed to existing UI components
- Memory system is transparent to users
- Provides continuity across sessions and days