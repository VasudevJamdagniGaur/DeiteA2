
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
      "https://s9lj2v4xibg99s-11434.proxy.runpod.net/api/generate",
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
    
    // Return a fallback reflection instead of error
    const fallbackReflection = "Had a brief check-in today but didn't dive into anything significant.";
    
    return res.json({
      reflection: fallbackReflection,
      source: "fallback"
    });
  }
});

export default router;
