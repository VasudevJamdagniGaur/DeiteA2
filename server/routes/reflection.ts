import express from "express";
import { 
  getDayReflection, 
  saveChatMessage, 
  updateDayReflection, 
  getTodaysChat,
  hasReflectionForToday,
  getReflectionHistory,
  getCurrentDateString 
} from "../reflection-storage";
import { generateReply } from "../ai";

const router = express.Router();

// Get today's reflection (load existing or create new)
router.get("/today/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const today = getCurrentDateString();
    const dayReflection = await getDayReflection(userId, today);
    
    if (dayReflection) {
      res.json({
        date: today,
        chat: dayReflection.chat,
        reflection: dayReflection.reflection,
        createdAt: dayReflection.createdAt
      });
    } else {
      // No reflection exists for today yet
      res.json({
        date: today,
        chat: [],
        reflection: null,
        createdAt: null
      });
    }
  } catch (error) {
    console.error("Error getting today's reflection:", error);
    res.status(500).json({ error: "Failed to get today's reflection" });
  }
});

// Get reflection for a specific date
router.get("/date/:userId/:date", async (req, res) => {
  const { userId, date } = req.params;
  
  try {
    const dayReflection = await getDayReflection(userId, date);
    
    if (dayReflection) {
      res.json({
        date,
        chat: dayReflection.chat,
        reflection: dayReflection.reflection,
        createdAt: dayReflection.createdAt
      });
    } else {
      res.status(404).json({ error: "No reflection found for this date" });
    }
  } catch (error) {
    console.error("Error getting reflection for date:", error);
    res.status(500).json({ error: "Failed to get reflection" });
  }
});

// Send a new message and get AI response
router.post("/chat/:userId", async (req, res) => {
  const { userId } = req.params;
  const { message } = req.body;
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Message is required" });
  }
  
  try {
    // Save user message
    await saveChatMessage(userId, "user", message);
    
    // Get AI response using the existing generateReply function
    const aiResponse = await generateReply(userId, message);
    
    // Save AI response
    await saveChatMessage(userId, "ai", aiResponse);
    
    // Return the AI response
    res.json({
      userMessage: message,
      aiResponse: aiResponse,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// Generate reflection summary for today (only if not already exists)
router.post("/summarize/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Check if reflection already exists
    const hasExistingReflection = await hasReflectionForToday(userId);
    
    if (hasExistingReflection) {
      const today = getCurrentDateString();
      const dayReflection = await getDayReflection(userId, today);
      return res.json({
        message: "Reflection already exists for today",
        reflection: dayReflection?.reflection,
        generated: false
      });
    }
    
    // Get today's chat
    const todaysChat = await getTodaysChat(userId);
    
    if (todaysChat.length === 0) {
      return res.json({
        message: "No chat messages to summarize",
        reflection: null,
        generated: false
      });
    }
    
    // Generate reflection summary using AI
    const chatHistory = todaysChat.map(msg => 
      `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
    ).join('\n');
    
    const prompt = `Based on the following conversation, create a concise daily reflection summary that captures the main emotions, concerns, and insights discussed. Keep it personal and meaningful, as if writing in a journal:

${chatHistory}

Write a brief reflection (2-3 sentences) that summarizes the key emotional themes and any progress or insights from this conversation.`;
    
    const reflection = await generateReply(userId, prompt);
    
    // Save the reflection
    const today = getCurrentDateString();
    await updateDayReflection(userId, today, reflection);
    
    res.json({
      message: "Reflection generated successfully",
      reflection: reflection,
      generated: true
    });
    
  } catch (error) {
    console.error("Error generating reflection:", error);
    res.status(500).json({ error: "Failed to generate reflection" });
  }
});

// Get reflection history
router.get("/history/:userId/:days?", async (req, res) => {
  const { userId, days } = req.params;
  const numberOfDays = days ? parseInt(days) : 7;
  
  try {
    const history = await getReflectionHistory(userId, numberOfDays);
    
    res.json({
      userId,
      days: numberOfDays,
      history: history
    });
    
  } catch (error) {
    console.error("Error getting reflection history:", error);
    res.status(500).json({ error: "Failed to get reflection history" });
  }
});

export default router;