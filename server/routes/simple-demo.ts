import express from "express";

const router = express.Router();

// Simple working demo that shows the memory system architecture
router.post("/working-demo", async (req, res) => {
  try {
    // Import memory functions
    const { 
      saveMessage, 
      getTodaysMessages, 
      getLongTermMemory, 
      buildPrompt,
      summarizeToday 
    } = await import('../memory');

    const demoUserId = "simple-demo-" + Date.now();
    console.log("Starting simple memory demo for:", demoUserId);

    // Step 1: Save messages directly
    console.log("1. Saving messages...");
    await saveMessage(demoUserId, "user", "I've been feeling anxious about my job interview.");
    await saveMessage(demoUserId, "ai", "I understand your anxiety. Can you tell me what specifically worries you?");
    await saveMessage(demoUserId, "user", "I'm worried about the technical questions.");

    // Step 2: Get today's messages
    console.log("2. Retrieving today's messages...");
    const todaysMessages = await getTodaysMessages(demoUserId);
    console.log(`Found ${todaysMessages.length} messages`);

    // Step 3: Get long-term memory
    console.log("3. Getting long-term memory...");
    const longTermMemory = await getLongTermMemory(demoUserId);
    console.log(`Found ${longTermMemory.length} long-term memories`);

    // Step 4: Build prompt
    console.log("4. Building prompt...");
    const prompt = await buildPrompt(demoUserId, "How can I prepare better?");
    console.log(`Built prompt with ${prompt.length} characters`);

    // Step 5: Generate summary
    console.log("5. Generating summary...");
    const summary = await summarizeToday(demoUserId);
    console.log(`Generated summary: ${summary}`);

    res.json({
      success: true,
      demo_results: {
        userId: demoUserId,
        steps_completed: 5,
        messages_saved: 3,
        messages_retrieved: todaysMessages.length,
        long_term_memories: longTermMemory.length,
        prompt_length: prompt.length,
        summary_generated: !!summary,
        summary_preview: summary?.substring(0, 100) + "..."
      },
      memory_system_status: "Working with fallback queries"
    });

  } catch (error) {
    console.error("Simple demo error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      step_reached: "Error occurred during demonstration"
    });
  }
});

// Test individual memory functions
router.get("/test-functions", async (req, res) => {
  try {
    const { 
      saveMessage, 
      getCurrentDateString,
      hasUserHistory 
    } = await import('../memory');

    const testUserId = "function-test-" + Date.now();
    
    // Test saving a message
    await saveMessage(testUserId, "user", "Test message for function verification");
    
    // Test date function
    const currentDate = getCurrentDateString();
    
    // Test user history check
    const hasHistory = await hasUserHistory(testUserId);

    res.json({
      functions_tested: {
        saveMessage: "Success",
        getCurrentDateString: currentDate,
        hasUserHistory: hasHistory
      },
      test_user_id: testUserId
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      functions_tested: "Failed"
    });
  }
});

export default router;