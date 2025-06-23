import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "../components/AuthProvider";
import { useTheme } from "../components/ThemeProvider";
import { saveReflection, getReflection } from "../lib/auth";
import { ArrowLeft, Send, Heart, Sparkles, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "../types";

interface ChatScreenProps {
  date: string;
  onBack: () => void;
}

export default function ChatScreen({ date, onBack }: ChatScreenProps) {
  const { user, profile } = useAuthContext();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadExistingReflection();
  }, [date, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadExistingReflection = async () => {
    if (!user) return;

    try {
      const reflection = await getReflection(user.uid, date);
      if (reflection && reflection.content) {
        // Parse existing messages from content
        const initialMessages = parseMessagesFromContent(reflection.content);
        setMessages(initialMessages);
      } else {
        // Start with Deite's greeting
        setMessages([
          {
            id: "1",
            sender: "deite",
            content: "Hi there! How are you feeling today? I'm here to listen and help you reflect. 🌸",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading reflection:", error);
      // Start with greeting on error
      setMessages([
        {
          id: "1",
          sender: "deite",
          content: "Hi there! How are you feeling today? I'm here to listen and help you reflect. 🌸",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const parseMessagesFromContent = (content: string): ChatMessage[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const messages: ChatMessage[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('Deite: ')) {
        messages.push({
          id: `deite-${index}`,
          sender: "deite",
          content: line.replace('Deite: ', ''),
          timestamp: new Date(),
        });
      } else if (line.startsWith('You: ')) {
        messages.push({
          id: `user-${index}`,
          sender: "user",
          content: line.replace('You: ', ''),
          timestamp: new Date(),
        });
      }
    });

    return messages.length > 0 ? messages : [
      {
        id: "1",
        sender: "deite",
        content: "Hi there! How are you feeling today? I'm here to listen and help you reflect. 🌸",
        timestamp: new Date(),
      },
    ];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Include the new user message in the conversation history
      const updatedMessages = [...messages, userMessage];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: updatedMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error('Invalid response format');
      }

      const deiteResponse: ChatMessage = {
        id: `deite-${Date.now()}`,
        sender: "deite",
        content: data.reply,
        timestamp: new Date(),
      };

      const finalMessages = [...messages, userMessage, deiteResponse];
      setMessages(finalMessages);
      saveConversation(finalMessages);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `deite-${Date.now()}`,
        sender: "deite",
        content: "I apologize, but I'm having trouble responding right now. Please try again. 💙",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (messagesToSave: ChatMessage[]) => {
    if (!user) return;

    try {
      // Convert messages to a simple text format for storage
      const content = messagesToSave
        .map(msg => `${msg.sender === 'deite' ? 'Deite' : 'You'}: ${msg.content}`)
        .join('\n');

      await saveReflection(user.uid, date, content);
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserInitial = () => {
    return profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className={`min-h-screen p-4 flex flex-col transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800" 
        : "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
    }`}>
      {/* Chat Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg p-4 flex items-center space-x-4 relative overflow-hidden">
        {/* Floating decorative elements */}
        <motion.div 
          className="absolute top-2 right-8"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
        </motion.div>
        <motion.div 
          className="absolute bottom-2 right-16"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        >
          <Heart className="w-3 h-3 text-pink-400" />
        </motion.div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-purple-100 transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4 text-purple-600" />
        </Button>
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="font-bold text-purple-600 text-lg">Deite</h2>
            <p className="text-sm text-gray-500">Your brain buddy 🧠💙</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                    message.sender === "user" 
                      ? "bg-gradient-to-br from-blue-400 to-blue-500" 
                      : "bg-gradient-to-br from-purple-400 to-pink-400"
                  }`}>
                    {message.sender === "user" ? getUserInitial() : "🧠"}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-br-md"
                        : "bg-white border-2 border-purple-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-end space-x-2 max-w-xs">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  🧠
                </div>
                <div className="bg-white border-2 border-purple-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white/90 backdrop-blur-sm p-4 border-t-2 border-purple-100">
        <div className="flex items-center space-x-3 max-w-2xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors duration-300 bg-white/80"
            placeholder="Share your thoughts... 💭"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl text-white hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}