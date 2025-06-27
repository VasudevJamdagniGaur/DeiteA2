import express from "express";
import { 
  getTodaysMessages, 
  getLongTermMemory, 
  getMessagesForDate,
  getDailySummary,
  hasUserHistory,
  summarizeToday 
} from "../memory";

const router = express.Router();

// Get today's messages for a user
router.get("/messages/today/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await getTodaysMessages(userId);
    
    res.json({
      messages: messages,
      count: messages.length
    });
  } catch (error: any) {
    console.error("Error fetching today's messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get messages for a specific date
router.get("/messages/:userId/:date", async (req, res) => {
  try {
    const { userId, date } = req.params;
    const messages = await getMessagesForDate(userId, date);
    
    res.json({
      messages: messages,
      date: date,
      count: messages.length
    });
  } catch (error: any) {
    console.error("Error fetching messages for date:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get long-term memory summaries for a user
router.get("/summaries/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const summaries = await getLongTermMemory(userId, limit);
    
    res.json({
      summaries: summaries,
      count: summaries.length
    });
  } catch (error: any) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({ error: "Failed to fetch summaries" });
  }
});

// Get daily summary for a specific date
router.get("/summary/:userId/:date", async (req, res) => {
  try {
    const { userId, date } = req.params;
    const summary = await getDailySummary(userId, date);
    
    if (!summary) {
      return res.status(404).json({ error: "No summary found for this date" });
    }
    
    res.json({
      summary: summary,
      date: date
    });
  } catch (error: any) {
    console.error("Error fetching daily summary:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// Check if user has conversation history
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const hasHistory = await hasUserHistory(userId);
    
    res.json({
      hasHistory: hasHistory
    });
  } catch (error: any) {
    console.error("Error checking user history:", error);
    res.status(500).json({ error: "Failed to check history" });
  }
});

// Generate and save today's summary
router.post("/summarize/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const summary = await summarizeToday(userId);
    
    if (!summary) {
      return res.status(404).json({ error: "No messages found to summarize" });
    }
    
    res.json({
      summary: summary,
      date: new Date().toISOString().slice(0, 10)
    });
  } catch (error: any) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;