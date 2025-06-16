import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Format messages into conversation text
    const conversationText = messages
      .map(
        (msg) =>
          `${msg.sender === "deite" ? "Deite" : "User"}: ${msg.content}`
      )
      .join("\n");

    // Add system prompt with conversation context
    const fullPrompt = `You are Deite, an AI mental health companion. Use the **entire conversation history** to understand context, but **only respond to the latest user message**. Your tone should be concise, supportive, emotionally intelligent, and grounded. Avoid repeating or responding to older messages again.

Conversation history:
${conversationText}

Only reply to the latest message from the user in this context. Do not summarize or revisit old messages. 

Deite:`;

    const response = await axios.post(
      "https://aryiopfqwg111a-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3",
        prompt: fullPrompt,
        stream: false,
      },
    );

    return res.json({
      reply: response.data.response,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      error: "Failed to get response from AI",
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

    const response = await axios.post(
      "https://aryiopfqwg111a-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3",
        prompt: reflectionPrompt,
        stream: false,
      },
    );

    return res.json({
      reflection: response.data.response,
    });
  } catch (error) {
    console.error("Reflection error:", error);
    return res.status(500).json({
      error: "Failed to generate reflection",
    });
  }
});

// Add a test endpoint to verify the router is working
router.get("/chat/test", (req, res) => {
  res.json({ status: "Chat router is working" });
});

export default router;
