
import express from "express";
import axios from "axios";

const router = express.Router();

// Generate reflection from conversation messages
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Build conversation context
    const conversationText = messages
      .map(msg => `${msg.sender === 'deite' ? 'Deite' : 'User'}: ${msg.content}`)
      .join('\n');

    const reflectionPrompt = `Based on this conversation between a user and Deite (an AI mental health companion), write a short, encouraging journal reflection from the user's perspective about their day and emotional state.

Conversation:
${conversationText}

Write a short, factual journal entry (2-3 sentences maximum):`;

    console.log("Making request to RunPod with prompt:", reflectionPrompt.substring(0, 200) + "...");

    const response = await axios.post(
      "https://vd9c6swyw3scdf-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3:70b",
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

export default router;
