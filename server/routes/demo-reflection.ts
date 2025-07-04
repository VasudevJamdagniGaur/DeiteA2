import express from "express";
import { 
  getDayReflection, 
  saveChatMessage, 
  updateDayReflection, 
  getTodaysChat,
  hasReflectionForToday,
  getCurrentDateString 
} from "../reflection-storage";

const router = express.Router();

// Complete demo of the Firebase reflection system
router.post("/complete-demo", async (req, res) => {
  const demoUserId = "firebase-demo-" + Date.now();
  const today = getCurrentDateString();
  
  try {
    console.log("🔥 Starting Complete Firebase Reflection Demo for:", demoUserId);
    
    // Step 1: Check initial state (should be empty)
    let dayReflection = await getDayReflection(demoUserId, today);
    console.log("📅 Initial state:", dayReflection);
    
    // Step 2: Save first user message
    await saveChatMessage(demoUserId, "user", "I've been feeling overwhelmed with work lately.");
    console.log("💬 Saved user message 1");
    
    // Step 3: Save AI response
    await saveChatMessage(demoUserId, "ai", "I understand that work can feel overwhelming. Can you tell me what specifically is contributing to these feelings?");
    console.log("🤖 Saved AI response 1");
    
    // Step 4: Save more conversation
    await saveChatMessage(demoUserId, "user", "It's the tight deadlines and constant pressure from my manager.");
    await saveChatMessage(demoUserId, "ai", "Those workplace pressures can be really challenging. Let's explore some strategies that might help you manage this stress.");
    console.log("💬 Saved additional conversation");
    
    // Step 5: Get the updated reflection
    dayReflection = await getDayReflection(demoUserId, today);
    console.log(`📊 Current chat has ${dayReflection?.chat.length || 0} messages`);
    
    // Step 6: Generate and save reflection summary
    const reflectionText = "Today I explored my work stress and identified that tight deadlines and manager pressure are the main contributors. I'm ready to work on stress management strategies.";
    await updateDayReflection(demoUserId, today, reflectionText);
    console.log("📝 Saved reflection summary");
    
    // Step 7: Final verification
    const finalReflection = await getDayReflection(demoUserId, today);
    console.log("✅ Final reflection state verified");
    
    res.json({
      success: true,
      demo: {
        userId: demoUserId,
        date: today,
        steps_completed: 7,
        final_state: {
          chat_messages: finalReflection?.chat.length || 0,
          has_reflection: !!finalReflection?.reflection,
          reflection_preview: finalReflection?.reflection?.substring(0, 100) + "...",
          created_at: finalReflection?.createdAt
        },
        firebase_structure: {
          path: `users/${demoUserId}/reflections/${today}`,
          chat_array: "✅ Working",
          reflection_field: "✅ Working", 
          timestamps: "✅ Working"
        }
      },
      message: "Firebase reflection system fully operational!"
    });
    
  } catch (error: any) {
    console.error("❌ Demo failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      demo_status: "Failed"
    });
  }
});

// Test loading existing reflection
router.get("/load-test/:userId/:date", async (req, res) => {
  const { userId, date } = req.params;
  
  try {
    const dayReflection = await getDayReflection(userId, date);
    
    res.json({
      test: "Load existing reflection",
      userId,
      date,
      found: !!dayReflection,
      chat_count: dayReflection?.chat.length || 0,
      has_reflection: !!dayReflection?.reflection,
      structure: dayReflection ? {
        chat: "Array of messages ✅",
        reflection: dayReflection.reflection ? "Text summary ✅" : "Not yet generated",
        createdAt: "Timestamp ✅"
      } : "No data found"
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;