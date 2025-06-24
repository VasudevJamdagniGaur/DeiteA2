// Test script to verify memory system functionality
import { 
  saveMessage, 
  getTodaysMessages, 
  getLongTermMemory, 
  buildPrompt,
  summarizeToday,
  hasUserHistory 
} from './memory';
import { generateReply } from './ai';

async function testMemorySystem() {
  const testUserId = "test-user-123";
  
  console.log("🧠 Testing AI Memory System");
  console.log("============================\n");

  try {
    // Test 1: Save some test messages
    console.log("1. Testing saveMessage...");
    await saveMessage(testUserId, "user", "I've been feeling anxious about my job interview tomorrow.");
    await saveMessage(testUserId, "ai", "I understand you're feeling anxious about your job interview. That's completely normal. Can you tell me what specifically is making you feel most worried?");
    await saveMessage(testUserId, "user", "I'm worried I won't be able to answer their technical questions properly.");
    console.log("✅ Messages saved successfully\n");

    // Test 2: Fetch today's messages
    console.log("2. Testing getTodaysMessages...");
    const todaysMessages = await getTodaysMessages(testUserId);
    console.log(`✅ Found ${todaysMessages.length} messages for today`);
    todaysMessages.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.role}: ${msg.content.substring(0, 50)}...`);
    });
    console.log("");

    // Test 3: Check user history
    console.log("3. Testing hasUserHistory...");
    const hasHistory = await hasUserHistory(testUserId);
    console.log(`✅ User has history: ${hasHistory}\n`);

    // Test 4: Get long-term memory
    console.log("4. Testing getLongTermMemory...");
    const longTermMemory = await getLongTermMemory(testUserId);
    console.log(`✅ Found ${longTermMemory.length} long-term memories`);
    longTermMemory.forEach((memory, i) => {
      console.log(`   ${i + 1}. ${memory.substring(0, 80)}...`);
    });
    console.log("");

    // Test 5: Build prompt
    console.log("5. Testing buildPrompt...");
    const prompt = await buildPrompt(testUserId, "How can I prepare better for the interview?");
    console.log("✅ Prompt built successfully");
    console.log(`   Prompt length: ${prompt.length} characters`);
    console.log(`   Preview: ${prompt.substring(0, 150)}...\n`);

    // Test 6: Generate AI reply
    console.log("6. Testing generateReply...");
    const reply = await generateReply(testUserId, "How can I prepare better for the interview?");
    console.log("✅ AI reply generated successfully");
    console.log(`   Reply: ${reply.substring(0, 100)}...\n`);

    // Test 7: Generate summary
    console.log("7. Testing summarizeToday...");
    const summary = await summarizeToday(testUserId);
    console.log("✅ Summary generated successfully");
    console.log(`   Summary: ${summary}\n`);

    // Test 8: Verify long-term memory after summary
    console.log("8. Testing getLongTermMemory after summary...");
    const updatedLongTermMemory = await getLongTermMemory(testUserId);
    console.log(`✅ Found ${updatedLongTermMemory.length} long-term memories after summary`);
    updatedLongTermMemory.forEach((memory, i) => {
      console.log(`   ${i + 1}. ${memory.substring(0, 80)}...`);
    });

    console.log("\n🎉 All memory system tests passed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testMemorySystem();
}

export { testMemorySystem };