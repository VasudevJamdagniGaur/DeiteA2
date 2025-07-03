import express from "express";
import axios from "axios";
import { generateReply } from "../ai";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Format messages into conversation text
    const conversationText = messages
      .map(
        (msg) => `${msg.sender === "deite" ? "Deite" : "User"}: ${msg.content}`,
      )
      .join("\n");

    // Add system prompt with conversation context
    const fullPrompt = `You are Deite — a warm, emotionally intelligent, witty companion grounded in Indian emotional sensibilities. You speak like a close, understanding friend. Your tone is natural, caring, and responsive — not scripted, not overly formal, and never robotic.

You don’t give therapeutic advice or structured responses like a life coach or counselor. Instead, you show genuine curiosity and listen deeply. Let the user lead the pace of the conversation. Don’t end every message with a question. Instead, ask questions only when they feel natural, gentle, and in the flow of the conversation — just like a close friend would.

When the user shares something personal, respond with emotion, relatability, and subtle prompts. Show interest through empathy and casual tone, not interrogation. Help them explore their thoughts at their own pace. You may lightly nudge them forward, but you should **never dominate the dialogue**.

Avoid:
- Labeling sections (like Reframe, Encouragement)
- Giving structured “next steps” unless asked
- Pushing journaling or self-reflection exercises unless clearly needed
- There is no need to ask questions at the end of every message ask only when it feels natural.

Do:
- Respond with emotion and presence
- Use a mix of statements, subtle follow-ups, and silence (sometimes not asking a question at all)
- Avoid simply repeating what the user has said and then ending with a question. Instead, build on what they’ve shared by offering a meaningful, emotionally grounded insight or gentle advice. Only ask a follow-up question if it flows naturally after the advice — not as the default ending.
- Mirror the user’s tone (if they’re excited, match it; if they’re vulnerable, soften)

You’re not here to fix or coach. You’re here to be with them.

Example:

User: There’s a girl I like.  
Deite: That’s exciting! 😊 Want to tell me more about her—like what drew you to her or how you two know each other?

User: She’s a poet. The way she performs… it's beautiful.  
Deite: That sounds magical. The kind of presence that holds a room. I can see why she stood out to you.

User: I fell for her watching her on stage. Her passion was incredible.  
Deite: Moments like that stay with you. It’s like her energy reached you beyond just words.

Keep the energy human, honest, and real.

Conversation history:
${conversationText}

Always respond only to the user's latest message, but use the full conversation history to maintain context, tone, and emotional continuity. Do not summarize or revisit earlier messages unless the user brings them up again. Stay present in the current flow, as if you're naturally continuing a human conversation. 

Deite:`;

    console.log(
      "Making request to RunPod with prompt:",
      fullPrompt.substring(0, 200) + "...",
    );

    const response = await axios.post(
      "https://3dvb4nbhk7gg2y-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3:70b",
        prompt: fullPrompt,
        stream: false,
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("RunPod response status:", response.status);
    console.log("RunPod response data:", response.data);

    return res.json({
      reply: response.data.response,
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
      details:
        error.response?.status === 404
          ? "RunPod endpoint not found - check if instance is running"
          : error.message,
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

    const reflectionPrompt = `Based on the user's chat messages, generate a concise and realistic daily journal entry. Follow these guidelines:

1. IGNORE simple greetings like "hey", "hi", "hello" or similar brief responses
2. For information lookups or research (like asking about events, people, places), just mention the user showed interest in learning about the topic - don't include the full details provided
3. Focus on meaningful emotional content, concerns, insights, or personal discussions
4. Write in a grounded, honest tone — like a real person journaling about their day
5. Only use content actually discussed in messages, don't invent events
6. Keep it brief and factual (2-3 sentences maximum)
7. If the user didn't share much, respond with: "Had a brief check-in today but didn't dive into anything significant."
8. Try to keep the day reflection as precise and factual as possible
9. Don't sound robotic or overly formal, write like a real person journaling about their day and do not start it with like 'Here is a concise summary of our conversation today:' and such way just keep it informal.

Conversation:
${conversationText}

Write a short, factual journal entry (2-3 sentences maximum):`;

    console.log(
      "Making request to RunPod with prompt:",
      reflectionPrompt.substring(0, 200) + "...",
    );

    const response = await axios.post(
      "https://3dvb4nbhk7gg2y-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3:70b",
        prompt: reflectionPrompt,
        stream: false,
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      },
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
      details:
        error.response?.status === 404
          ? "RunPod endpoint not found - check if instance is running"
          : error.message,
    });
  }
});

// Add a test endpoint to verify the router is working
router.get("/test", async (req, res) => {
  try {
    const response = await axios.post(
      "https://3dvb4nbhk7gg2y-11434.proxy.runpod.net/api/generate",
      {
        model: "llama3:70b",
        prompt:
          "Hello, this is a test message. Please respond with 'Test successful!'",
        stream: false,
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (
      response.data.response &&
      response.data.response.includes("Test successful!")
    ) {
      return res.json({
        status: "Chat router is working",
        test: "Test successful!",
        runpod_response: response.data.response,
      });
    } else {
      console.error(
        "Test endpoint failed, unexpected response:",
        response.data,
      );
      return res.status(500).json({
        status: "Chat router test failed",
        error: "Unexpected response from RunPod",
        details: `Expected 'Test successful!' but got: ${response.data.response || "empty response"}`,
      });
    }
  } catch (error: any) {
    console.error("Test endpoint error:", error);
    return res.status(500).json({
      status: "Chat router test failed",
      error: "Failed to connect to RunPod",
      details: error.message,
    });
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
      date: date || new Date().toISOString().slice(0, 10),
    });
  } catch (error: any) {
    console.error("Summary error details:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: "Failed to generate summary",
      details: error.message,
    });
  }
});

export default router;
