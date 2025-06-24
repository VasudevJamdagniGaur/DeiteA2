import express from "express";
import { 
  saveMessage, 
  getTodaysMessages, 
  getLongTermMemory, 
  buildPrompt,
  summarizeToday 
} from '../memory';
import { generateReply } from '../ai';

const router = express.Router();

// Demo endpoint to showcase the complete AI memory system
router.post("/memory-demo", async (req, res) => {
  const demoUserId = "demo-user-" + Date.now();
  
  try {
    console.log("🧠 Starting AI Memory System Demo for:", demoUserId);

    // Demo conversation sequence
    const conversation = [
      { role: "user", message: "I've been feeling really anxious about my job interview tomorrow." },
      { role: "ai", message: "I understand you're feeling anxious about your interview. That's completely normal. What specifically about the interview is making you most worried?" },
      { role: "user", message: "I'm worried I won't be able to answer their technical questions properly." },
      { role: "ai", message: "Those concerns are valid. Let's work through some strategies to help you feel more prepared and confident." },
      { role: "user", message: "What can I do to prepare better?" }
    ];

    // Step 1: Simulate conversation and save messages
    console.log("📝 Saving conversation messages...");
    for (let i = 0; i < conversation.length - 1; i++) {
      const msg = conversation[i];
      await saveMessage(demoUserId, msg.role as "user" | "ai", msg.message);
    }

    // Step 2: Get today's messages (short-term memory)
    const todaysMessages = await getTodaysMessages(demoUserId);
    console.log(`📋 Retrieved ${todaysMessages.length} messages from today`);

    // Step 3: Get long-term memory (will be empty for new user)
    const longTermMemory = await getLongTermMemory(demoUserId);
    console.log(`🧠 Retrieved ${longTermMemory.length} long-term memories`);

    // Step 4: Build prompt with memory context
    const latestUserMessage = conversation[conversation.length - 1].message;
    const fullPrompt = await buildPrompt(demoUserId, latestUserMessage);
    console.log(`🔧 Built prompt with ${fullPrompt.length} characters`);

    // Step 5: Generate AI response with memory context
    const aiResponse = await generateReply(demoUserId, latestUserMessage);
    console.log(`🤖 Generated AI response: ${aiResponse.substring(0, 100)}...`);

    // Step 6: Generate daily summary for long-term memory
    const summary = await summarizeToday(demoUserId);
    console.log(`📊 Generated summary: ${summary}`);

    // Step 7: Verify long-term memory now contains the summary
    const updatedLongTermMemory = await getLongTermMemory(demoUserId);
    console.log(`🔄 Updated long-term memory count: ${updatedLongTermMemory.length}`);

    res.json({
      success: true,
      demo: {
        userId: demoUserId,
        steps: {
          "1_messages_saved": conversation.length - 1,
          "2_todays_messages": todaysMessages.length,
          "3_initial_long_term_memory": longTermMemory.length,
          "4_prompt_length": fullPrompt.length,
          "5_ai_response_preview": aiResponse.substring(0, 100) + "...",
          "6_summary_generated": summary,
          "7_updated_long_term_memory": updatedLongTermMemory.length
        },
        conversation_flow: conversation,
        memory_system_status: "✅ Fully Operational"
      }
    });

  } catch (error) {
    console.error("❌ Memory demo failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      demo_status: "❌ Failed"
    });
  }
});

// Simple demo of individual memory functions
router.get("/memory-functions/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [todaysMessages, longTermMemory] = await Promise.all([
      getTodaysMessages(userId),
      getLongTermMemory(userId, 3)
    ]);

    res.json({
      userId,
      todaysMessages: {
        count: todaysMessages.length,
        messages: todaysMessages.map(m => ({
          role: m.role,
          content: m.content.substring(0, 50) + "...",
          timestamp: m.timestamp
        }))
      },
      longTermMemory: {
        count: longTermMemory.length,
        summaries: longTermMemory.map(s => s.substring(0, 80) + "...")
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;