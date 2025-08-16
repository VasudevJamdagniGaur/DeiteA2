// Direct RunPod integration for mobile apps (no local server needed)

import { mobileHttpRequest, isMobileApp } from './mobile-network';

// RunPod configuration for direct mobile access
const MOBILE_RUNPOD_CONFIG = {
  url: "https://g0r8vprssr0m80-11434.proxy.runpod.net/api/generate",
  model: "llama3:70b",
  timeout: 60000,
};

// Build therapeutic prompt for Deite
const buildDeitePrompt = (messages: any[], userMessage: string): string => {
  const systemPrompt = `You are Deite — a warm, emotionally intelligent, witty companion grounded in Indian emotional sensibilities. You speak like a close, understanding friend. Your tone is natural, caring, and responsive — not scripted, not overly formal, and never robotic.

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

Conversation history:`;

  // Build conversation context
  const conversationHistory = messages
    .slice(-10) // Keep last 10 messages for context
    .map(msg => `${msg.sender === 'user' ? 'User' : 'Deite'}: ${msg.content}`)
    .join('\n');

  return `${systemPrompt}\n${conversationHistory}\nUser: ${userMessage}\nDeite:`;
};

// Direct mobile chat function
export const mobileDirectChat = async (messages: any[], userId: string): Promise<{ reply: string; source: string }> => {
  console.log('📱 Mobile Direct Chat: Starting direct RunPod request');
  
  if (!messages || messages.length === 0) {
    throw new Error('Messages are required');
  }

  // Get the latest user message
  const userMessages = messages.filter(msg => msg.sender === 'user');
  const latestUserMessage = userMessages[userMessages.length - 1];

  if (!latestUserMessage) {
    throw new Error('No user message found');
  }

  console.log('📱 Latest user message:', latestUserMessage.content);

  // Build the prompt
  const fullPrompt = buildDeitePrompt(messages, latestUserMessage.content);
  
  console.log('📱 Making direct RunPod request...');
  console.log('📱 RunPod URL:', MOBILE_RUNPOD_CONFIG.url.split('@')[1]); // Hide credentials in logs

  try {
    const response = await mobileHttpRequest(MOBILE_RUNPOD_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MOBILE_RUNPOD_CONFIG.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          keep_alive: -1,
          num_predict: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`RunPod HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📱 RunPod response received');

    if (!data.response) {
      throw new Error('No response from RunPod');
    }

    return {
      reply: data.response,
      source: 'mobile-direct-runpod'
    };

  } catch (error: any) {
    console.error('📱 Direct RunPod request failed:', error);
    
    // Provide a fallback response
    return {
      reply: "I'm here to listen and support you. I'm experiencing some technical difficulties right now, but please tell me what's on your mind and I'll do my best to help.",
      source: 'mobile-fallback'
    };
  }
};

// Mobile health check for direct RunPod
export const mobileDirectHealthCheck = async (): Promise<boolean> => {
  console.log('📱 Mobile Direct Health Check: Testing RunPod connection');
  
  try {
    const response = await mobileHttpRequest(MOBILE_RUNPOD_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MOBILE_RUNPOD_CONFIG.model,
        prompt: 'Health check - respond with OK',
        stream: false,
        options: {
          keep_alive: -1,
          num_predict: 10,
        },
      }),
    });

    const isHealthy = response.ok;
    console.log(`📱 Mobile health check result: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    return isHealthy;
    
  } catch (error) {
    console.error('📱 Mobile health check failed:', error);
    return false;
  }
};

// Reflection generation for mobile
export const mobileDirectReflection = async (messages: any[]): Promise<string> => {
  console.log('📱 Mobile Direct Reflection: Generating day reflection');
  
  if (!messages || messages.length === 0) {
    return "Had a brief check-in today but didn't dive into anything significant.";
  }

  // Format messages for reflection
  const conversationText = messages
    .map(msg => `${msg.sender === 'deite' ? 'Deite' : 'Me'}: ${msg.content}`)
    .join('\n');

  const reflectionPrompt = `Based on the user's chat messages, generate a concise and realistic daily journal entry. Follow these guidelines:

1. IGNORE simple greetings like "hey", "hi", "hello" or similar brief responses
2. For information lookups or research (like asking about events, people, places), just mention the user showed interest in learning about the topic - don't include the full details provided
3. Focus on meaningful emotional content, concerns, insights, or personal discussions
4. Write in a grounded, honest tone — like a real person journaling about their day
5. Only use content actually discussed in messages, don't invent events
6. Keep it brief and factual (2-3 sentences maximum)
7. If the user didn't share much, respond with: "Had a brief check-in today but didn't dive into anything significant."
8. Try to keep the day reflection as precise and factual as possible
9. Don't sound robotic or overly formal, write like a real person journaling about their day

Conversation:
${conversationText}

Write a short, factual journal entry (2-3 sentences maximum):`;

  try {
    const response = await mobileHttpRequest(MOBILE_RUNPOD_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MOBILE_RUNPOD_CONFIG.model,
        prompt: reflectionPrompt,
        stream: false,
        options: {
          keep_alive: -1,
          num_predict: 300,
          temperature: 0.7,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || "Had a brief check-in today but didn't dive into anything significant.";
    }
  } catch (error) {
    console.error('📱 Mobile reflection generation failed:', error);
  }

  return "Had a brief check-in today but didn't dive into anything significant.";
};
