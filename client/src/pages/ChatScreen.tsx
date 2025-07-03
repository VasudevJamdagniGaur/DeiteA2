"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "../components/AuthProvider";
import { useTheme } from "../components/ThemeProvider";
import { saveReflection, getReflection } from "../lib/auth";
import { ArrowLeft, Send, Brain } from "lucide-react";
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
  const [message, setMessage] = useState("");
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
        const initialMessages = parseMessagesFromContent(reflection.content);
        setMessages(initialMessages);
      } else {
        setMessages([
          {
            id: "1",
            sender: "deite",
            content: "Hi there! How are you feeling today? I'm here to listen and help you reflect. 💜",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading reflection:", error);
      setMessages([
        {
          id: "1",
          sender: "deite",
          content: "Hi there! How are you feeling today? I'm here to listen and help you reflect. 💜",
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
        content: "Hi there! How are you feeling today? I'm here to listen and help you reflect. 💜",
        timestamp: new Date(),
      },
    ];
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const updatedMessages = [...messages, userMessage];

      const response = await fetch("/api/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: updatedMessages.map(msg => ({
            sender: msg.sender,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error('Invalid response format: missing reply');
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
    <div className={`flex flex-col h-screen max-w-md mx-auto transition-colors duration-300 ${
      isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${
        isDarkMode ? "border-gray-800" : "border-gray-200"
      }`}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className={`transition-colors duration-300 ${
            isDarkMode 
              ? "text-gray-400 hover:text-white hover:bg-gray-800" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center justify-center flex-1">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              isDarkMode 
                ? "bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg shadow-purple-500/50" 
                : "bg-gradient-to-br from-pink-200 to-purple-200"
            }`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className={`w-4 h-4 ${isDarkMode ? "text-white" : "text-purple-600"}`} />
          </motion.div>
          <div className="text-center">
            <h1 className={`text-lg font-semibold transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Deite
            </h1>
            <p className={`text-xs transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              Your cute AI companion
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-3 ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <Avatar className={`w-10 h-10 flex-shrink-0 ${
                msg.sender === "user" 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                  : isDarkMode
                    ? "bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg shadow-purple-500/30"
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
              }`}>
                <AvatarFallback className="bg-transparent text-white font-semibold">
                  {msg.sender === "user" ? getUserInitial() : <Brain className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>

              <div className={`rounded-2xl p-4 max-w-[80%] transition-colors duration-300 ${
                msg.sender === "user"
                  ? isDarkMode
                    ? "bg-blue-600 text-white rounded-tr-md"
                    : "bg-blue-500 text-white rounded-tr-md"
                  : isDarkMode
                    ? "bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-md"
                    : "bg-gray-100 border border-gray-200 text-gray-900 rounded-tl-md"
              }`}>
                <p className="text-sm leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <Avatar className={`w-10 h-10 flex-shrink-0 ${
              isDarkMode
                ? "bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg shadow-purple-500/30"
                : "bg-gradient-to-br from-purple-500 to-pink-500"
            }`}>
              <AvatarFallback className="bg-transparent text-white font-semibold">
                <Brain className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className={`rounded-2xl rounded-tl-md p-4 max-w-[80%] transition-colors duration-300 ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-gray-100 border border-gray-200"
            }`}>
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-500 rounded-full"
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
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t transition-colors duration-300 ${
        isDarkMode ? "border-gray-800" : "border-gray-200"
      }`}>
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              disabled={isLoading}
              className={`rounded-full pr-12 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
              }`}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full h-10 w-10 flex-shrink-0 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}