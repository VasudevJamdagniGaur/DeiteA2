import express from "express";
import { 
  saveMessage, 
  getTodaysMessages, 
  getLongTermMemory, 
  buildPrompt,
  summarizeToday,
  hasUserHistory 
} from '../memory';
import { generateReply } from '../ai';

const router = express.Router();

// Test endpoint to verify memory system is working
router.post("/test-memory", async (req, res) => {
  const testUserId = "test-user-" + Date.now();
  
  try {
    console.log("Testing AI Memory System for user:", testUserId);

    // Test 1: Save some test messages
    await saveMessage(testUserId, "user", "I've been feeling anxious about my job interview tomorrow.");
    await saveMessage(testUserId, "ai", "I understand you're feeling anxious about your job interview. Can you tell me what specifically worries you most?");
    await saveMessage(testUserId, "user", "I'm worried I won't be able to answer their technical questions properly.");

    // Test 2: Get today's messages
    const todaysMessages = await getTodaysMessages(testUserId);
    console.log(`Found ${todaysMessages.length} messages for today`);

    // Test 3: Check user history
    const hasHistory = await hasUserHistory(testUserId);
    console.log(`User has history: ${hasHistory}`);

    // Test 4: Get long-term memory
    const longTermMemory = await getLongTermMemory(testUserId);
    console.log(`Found ${longTermMemory.length} long-term memories`);

    // Test 5: Build prompt
    const prompt = await buildPrompt(testUserId, "How can I prepare better for the interview?");
    console.log(`Prompt built successfully, length: ${prompt.length} characters`);

    // Test 6: Generate AI reply
    const reply = await generateReply(testUserId, "How can I prepare better for the interview?");
    console.log(`AI reply generated: ${reply.substring(0, 100)}...`);

    // Test 7: Generate summary
    const summary = await summarizeToday(testUserId);
    console.log(`Summary generated: ${summary}`);

    res.json({
      success: true,
      results: {
        messagesCount: todaysMessages.length,
        hasHistory,
        longTermMemoryCount: longTermMemory.length,
        promptLength: prompt.length,
        aiReplyPreview: reply.substring(0, 100),
        summary
      }
    });

  } catch (error) {
    console.error("Memory test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test endpoint to verify the system is working
router.get("/ping", (req, res) => {
  res.json({ 
    message: "Memory system is online", 
    timestamp: new Date().toISOString() 
  });
});

export default router;