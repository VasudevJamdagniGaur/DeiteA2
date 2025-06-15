import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use the exact same format as the working curl request
    const response = await axios.post('https://n7fk3drszp7b6y-11434.proxy.runpod.net/api/generate', {
      model: "llama3",
      prompt: message,
      stream: false
    });

    // Return the exact response format from the API
    return res.json({
      reply: response.data.response
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      error: 'Failed to get response from AI'
    });
  }
});

// Add reflection endpoint
router.post('/reflection', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // Format messages into a conversation for the AI to summarize
    const conversationText = messages
      .map(msg => `${msg.sender === 'deite' ? 'Therapist' : 'Me'}: ${msg.content}`)
      .join('\n');

    const reflectionPrompt = `Please write a personal journal entry based on this therapeutic conversation. Write it in first person as if the person is reflecting on their day and thoughts. Make it sound natural, personal, and introspective. Focus on the key emotions, insights, and experiences shared. Keep it concise but meaningful.

Conversation:
${conversationText}

Journal Entry:`;

    const response = await axios.post('https://n7fk3drszp7b6y-11434.proxy.runpod.net/api/generate', {
      model: "llama3",
      prompt: reflectionPrompt,
      stream: false
    });

    return res.json({
      reflection: response.data.response
    });

  } catch (error) {
    console.error('Reflection error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate reflection'
    });
  }
});

// Add a test endpoint to verify the router is working
router.get('/chat/test', (req, res) => {
  res.json({ status: 'Chat router is working' });
});

export default router;