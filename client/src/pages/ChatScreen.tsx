"use client"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  const handleGoBack = () => {
    window.history.back()
  }

  const [message, setMessage] = useState("")

  const darkThemeClasses = `bg-gray-900 text-white`
  const lightThemeClasses = `bg-white text-gray-900`
  const themeClasses = isDarkMode ? darkThemeClasses : lightThemeClasses

  const handleMessageSend = () => {
    if (message.trim()) {
      // Handle sending message logic here
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  const handleEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMessageSend()
    }
  }

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto transition-colors duration-300 ${themeClasses}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${
        isDarkMode 
          ? "border-gray-800" 
          : "border-gray-200"
      }`}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack}
          className={`transition-colors duration-300 ${
            isDarkMode 
              ? "text-gray-400 hover:text-white hover:bg-gray-800" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div className="text-center">
            <h1 className={`text-lg font-semibold transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Deite
            </h1>
            <p className={`text-xs transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              Your brain buddy 🧠💙
            </p>
          </div>
        </div>

        <div className="w-8"></div> {/* Spacer for center alignment */}
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin transition-colors duration-300 ${
        isDarkMode 
          ? "scrollbar-track-slate-800 scrollbar-thumb-purple-600 hover:scrollbar-thumb-purple-500" 
          : "scrollbar-track-pink-100 scrollbar-thumb-pink-300 hover:scrollbar-thumb-pink-400"
      }`}>
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 shadow-lg">
            <AvatarFallback className="bg-transparent text-white font-semibold">
              <Brain className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className={`rounded-2xl rounded-tl-md p-4 max-w-[80%] border transition-colors duration-300 ${
            isDarkMode 
              ? "bg-gray-800 border-gray-700" 
              : "bg-gray-50 border-gray-200"
          }`}>
            <p className={`text-sm leading-relaxed transition-colors duration-300 ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}>
              Hi there! How are you feeling today? I'm here to listen and help you reflect. 💜
            </p>
          </div>
        </div>

        {/* Welcome message */}
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 shadow-lg">
            <AvatarFallback className="bg-transparent text-white font-semibold">
              <Brain className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className={`rounded-2xl rounded-tl-md p-4 max-w-[80%] border transition-colors duration-300 ${
            isDarkMode 
              ? "bg-gray-800 border-gray-700" 
              : "bg-gray-50 border-gray-200"
          }`}>
            <p className={`text-sm leading-relaxed transition-colors duration-300 ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}>
              You can share anything that's on your mind - your thoughts, feelings, worries, or even good moments from your day. I'm here to support your mental wellness journey! ✨
            </p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t transition-colors duration-300 ${
        isDarkMode 
          ? "border-gray-800" 
          : "border-gray-200"
      }`}>
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleEnterPress}
              placeholder="Share your thoughts..."
              className={`rounded-full pr-12 transition-colors duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" 
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
          <Button
            size="icon"
            onClick={handleMessageSend}
            disabled={!message.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 rounded-full h-10 w-10 flex-shrink-0 shadow-lg transition-all duration-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}