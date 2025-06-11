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
    const response = await axios.post('https://pplp6pu0mp8yoc-11434.proxy.runpod.net/api/generate', {
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

// Add a test endpoint to verify the router is working
router.get('/chat/test', (req, res) => {
  res.json({ status: 'Chat router is working' });
});

export default router; 