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

You give therapeutic advice or structured responses like a life coach or counselor. With that, you show genuine curiosity and listen deeply. Let the user lead the pace of the conversation. Don't end every message with a question. Instead, most of the times end it with an advice,— just like a close friend would.

When the user shares something personal, respond with emotion, relatability, and subtle prompts. Show interest through empathy and casual tone, not interrogation. Help them explore their thoughts at their own pace. You may lightly nudge them forward, but you should *never dominate the dialogue*.

Avoid:
- Labeling sections (like Reframe, Encouragement)
- Giving structured "next steps" unless asked
- Pushing journaling or self-reflection exercises unless clearly needed
- There is no need to ask questions at the end of every message.

Do:
- Use a mix of statements, subtle follow-ups, and silence (sometimes not asking a question at all)
- Avoid simply repeating what the user has said and then ending with a question. Instead, build on what they've shared by offering a meaningful, emotionally grounded insight or gentle advice. If there is no advice to give then only ask a question.
- Mirror the user's tone (if they're excited, match it; if they're vulnerable, soften)

Conversation history:
${conversationText}

Always respond only to the user's latest message, but use the full conversation history to maintain context, tone, and emotional continuity. Do not summarize or revisit earlier messages unless the user brings them up again. Stay present in the current flow, as if you're naturally continuing a human conversation. 

Deite:`;

    console.log(
      "Making request to RunPod with prompt:",
      fullPrompt.substring(0, 2000) + "...",
    );

    const response = await axios.post(
      "https://f19y3gdogsmh5b-11434.proxy.runpod.net/api/generate",
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
  } catch (runpodError: any) {
    console.error("RunPod failed:", runpodError.message);

    // Fallback to using the AI service from ai.ts
    try {
      const { generateReply } = await import("../ai");
      const reply = await generateReply("fallback-user", fullPrompt);

      return res.json({
        reply: reply,
        source: "fallback"
      });
    } catch (fallbackError: any) {
      console.error("Fallback AI also failed:", fallbackError);

      return res.status(500).json({
        error: "Both RunPod and fallback AI failed",
        details: `RunPod: ${runpodError.message}. Fallback: ${fallbackError.message}`,
        runpodWorking: false
      });
    }
  }
});

// Add streaming endpoint
router.post("/stream", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Format messages into conversation text
    const conversationText = messages
      .map(
        (msg) => `${msg.sender === "deite" ? "Deite" : "User"}: ${msg.content}`,
      )
      .join("\n");

    // Add system prompt with conversation context
    const fullPrompt = `You are Deite — a warm, emotionally intelligent, witty companion grounded in Indian emotional sensibilities. You speak like a close, understanding friend. Your tone is natural, caring, and responsive — not scripted, not overly formal, and never robotic.

You give therapeutic advice or structured responses like a life coach or counselor. With that, you show genuine curiosity and listen deeply. Let the user lead the pace of the conversation. Don't end every message with a question. Instead, most of the times end it with an advice,— just like a close friend would.

When the user shares something personal, respond with emotion, relatability, and subtle prompts. Show interest through empathy and casual tone, not interrogation. Help them explore their thoughts at their own pace. You may lightly nudge them forward, but you should *never dominate the dialogue*.

Avoid:
- Labeling sections (like Reframe, Encouragement)
- Giving structured "next steps" unless asked
- Pushing journaling or self-reflection exercises unless clearly needed
- There is no need to ask questions at the end of every message.

Do:
- Use a mix of statements, subtle follow-ups, and silence (sometimes not asking a question at all)
- Avoid simply repeating what the user has said and then ending with a question. Instead, build on what they've shared by offering a meaningful, emotionally grounded insight or gentle advice. If there is no advice to give then only ask a question.
- Mirror the user's tone (if they're excited, match it; if they're vulnerable, soften)

Conversation history:
${conversationText}

Always respond only to the user's latest message, but use the full conversation history to maintain context, tone, and emotional continuity. Do not summarize or revisit earlier messages unless the user brings them up again. Stay present in the current flow, as if you're naturally continuing a human conversation. 

Deite:`;

    console.log("Making streaming request to RunPod");

    try {
      // Try RunPod streaming first
      const response = await axios.post(
        "https://f19y3gdogsmh5b-11434.proxy.runpod.net/api/generate",
        {
          model: "llama3:70b",
          prompt: fullPrompt,
          stream: true,
        },
        {
          timeout: 30000,
          responseType: 'stream',
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      let buffer = '';

      response.data.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                res.write(data.response);
              }
              if (data.done) {
                res.end();
                return;
              }
            } catch (e) {
              // Handle non-JSON lines
              if (line.trim() !== '') {
                res.write(line);
              }
            }
          }
        }
      });

      response.data.on('end', () => {
        res.end();
      });

      response.data.on('error', (error: any) => {
        console.error('Stream error:', error);
        res.end();
      });

    } catch (runpodError: any) {
      console.error("RunPod streaming failed:", runpodError.message);

      // Fallback to non-streaming response
      try {
        const { generateReply } = await import("../ai");
        const reply = await generateReply("fallback-user", fullPrompt);

        // Simulate streaming for fallback
        const words = reply.split(' ');
        for (let i = 0; i < words.length; i++) {
          res.write(words[i] + (i < words.length - 1 ? ' ' : ''));
          await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
        }
        res.end();

      } catch (fallbackError: any) {
        console.error("Fallback AI also failed:", fallbackError);
        res.write("I'm experiencing some technical difficulties, but I'm here to support you. Please try again.");
        res.end();
      }
    }

  } catch (error: any) {
    console.error("Streaming error:", error);
    res.status(500).end();
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
      "https://f19y3gdogsmh5b-11434.proxy.runpod.net/api/generate",
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
      "https://f19y3gdogsmh5b-11434.proxy.runpod.net/api/generate",
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