import express from "express";
import axios from "axios";
import { generateReply } from "../ai";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }

    console.log("Processing chat request for user:", userId);

    // Use the new memory-enhanced AI system
    const reply = await generateReply(userId, message);

    return res.json({
      reply: reply,
    });
  } catch (error: any) {
    console.error("Chat error details:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: "Failed to get response from AI",
      details: error.message
    });
  }
});

// Add reflection endpoint
router.post("/reflection", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Format messages into a conversation for the AI to summarize
    const conversationText = messages
      .map(
        (msg) =>
          `${msg.sender === "deite" ? "Therapist" : "Me"}: ${msg.content}`,
      )
      .join("\n");

    const reflectionPrompt = `Based on the user's chat messages, generate a concise and realistic daily journal entry. Do not invent or exaggerate events. Summarize the main emotions, concerns, and insights discussed during the conversation. Write in a grounded, honest tone — like a real person journaling about their day. Only use the content actually discussed in the messages. Do not make up metaphors or fictional events. The tone should be factual. Keep it brief and to the point.

Conversation:
${conversationText}

Write a short, factual journal entry (2-3 sentences maximum):`;

    console.log("Making request to RunPod with prompt:", reflectionPrompt.substring(0, 200) + "...");

    const response = await axios.post(
      "https://84fpv7rxmxkqcc-11434.proxy.runpod.net/api/generate",
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

    console.log("RunPod response status:", response.status);
    console.log("RunPod response data:", response.data);

    return res.json({
      reflection: response.data.response,
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
      "https://84fpv7rxmxkqcc-11434.proxy.runpod.net/api/generate",
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

// Add summary endpoint for end-of-day processing
router.post("/summary", async (req, res) => {
  try {
    const { userId, date } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { summarizeToday } = await import("../memory");
    const summary = await summarizeToday(userId);

    if (!summary) {
      return res.status(404).json({ error: "No messages found for today" });
    }

    return res.json({
      summary: summary,
      date: date || new Date().toISOString().slice(0, 10)
    });
  } catch (error: any) {
    console.error("Summary error details:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: "Failed to generate summary",
      details: error.message
    });
  }
});

export default router;