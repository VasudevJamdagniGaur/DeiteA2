import express from "express";
import axios from "axios";
import {
  saveMessage,
  fetchTodayMessages,
  fetchLastSummaries,
  getCurrentDateString,
  buildConversationContext,
  buildHistoricalContext,
  ChatMessage,
} from "../db";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { userId, userInput } = req.body;

    if (!userId || !userInput) {
      return res.status(400).json({ error: "userId and userInput are required" });
    }

    // 1. Save incoming user message
    await saveMessage({
      userId,
      sender: "user",
      text: userInput,
      timestamp: new Date(),
      sessionDate: getCurrentDateString(),
    });

    // 2. Build short-term context (today's conversation)
    const todayMessages = await fetchTodayMessages(userId);
    const shortTermContext = buildConversationContext(todayMessages);

    // 3. Build long-term summary context (historical summaries)
    const summaries = await fetchLastSummaries(userId);
    const longTermContext = buildHistoricalContext(summaries);

    // 4. Build enhanced prompt with both contexts
    const fullPrompt = `You are Deite, a compassionate AI mental health companion. You have access to the user's conversation history and past reflections to provide personalized support.

${longTermContext}

Today's conversation:
${shortTermContext}

User: ${userInput}

Provide a supportive, empathetic response that acknowledges the user's current state while drawing on relevant context from their history. Keep your response concise, grounded, and focused on the user's current needs.

Deite:`;

    console.log("Making request to RunPod with enhanced context prompt:", fullPrompt.substring(0, 200) + "...");

    const response = await axios.post(
      "https://3hqchney1c4dte-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3",
        prompt: fullPrompt,
        stream: false,
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const aiReply = response.data.response;

    // 5. Save the AI's reply
    await saveMessage({
      userId,
      sender: "ai",
      text: aiReply,
      timestamp: new Date(),
      sessionDate: getCurrentDateString(),
    });

    console.log("RunPod response status:", response.status);
    console.log("Saved conversation to database");

    return res.json({
      reply: aiReply,
    });
  } catch (error: any) {
    console.error("Chat error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });

    return res.status(500).json({
      error: "Failed to get response from AI",
      details: error.response?.status === 404 ? "RunPod endpoint not found - check if instance is running" : error.message
    });
  }
});

// Add reflection endpoint
router.post("/reflection", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get today's messages from database
    const todayMessages = await fetchTodayMessages(userId);
    
    if (todayMessages.length === 0) {
      return res.status(400).json({ error: "No messages found for today to generate reflection" });
    }

    // Format messages into a conversation for the AI to summarize
    const conversationText = buildConversationContext(todayMessages);

    const reflectionPrompt = `Based on the user's chat messages, generate a concise and realistic daily journal entry. Do not invent or exaggerate events. Summarize the main emotions, concerns, and insights discussed during the conversation. Write in a grounded, honest tone — like a real person journaling about their day. Only use the content actually discussed in the messages. Do not make up metaphors or fictional events. The tone should be factual. Keep it brief and to the point.

Conversation:
${conversationText}

Write a short, factual journal entry (2-3 sentences maximum):`;

    console.log("Making request to RunPod for reflection:", reflectionPrompt.substring(0, 200) + "...");

    const response = await axios.post(
      "https://3hqchney1c4dte-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3",
        prompt: reflectionPrompt,
        stream: false,
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const reflectionText = response.data.response;

    // Save the daily summary to database
    const { saveDailySummary } = await import("../db");
    await saveDailySummary({
      userId,
      date: getCurrentDateString(),
      summary: reflectionText,
      createdAt: new Date(),
    });

    console.log("RunPod response status:", response.status);
    console.log("Saved daily reflection to database");

    return res.json({
      reflection: reflectionText,
    });
  } catch (error: any) {
    console.error("Reflection error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });
    return res.status(500).json({
      error: "Failed to generate reflection",
      details: error.response?.status === 404 ? "RunPod endpoint not found - check if instance is running" : error.message,
    });
  }
});

// Add a test endpoint to verify the router is working
router.get("/chat/test", async (req, res) => {
  try {
    const response = await axios.post(
      "https://3hqchney1c4dte-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3",
        prompt: "Hello, this is a test message. Please respond with 'Test successful!'",
        stream: false,
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data.response.includes("Test successful!")) {
      return res.json({ status: "Chat router is working", test: "Test successful!" });
    } else {
      console.error("Test endpoint failed, unexpected response:", response.data);
      return res.status(500).json({ status: "Chat router test failed", error: "Unexpected response from RunPod" });
    }
  } catch (error: any) {
    console.error("Test endpoint error:", error);
    return res.status(500).json({ status: "Chat router test failed", error: "Failed to connect to RunPod", details: error.message });
  }
});

export default router;