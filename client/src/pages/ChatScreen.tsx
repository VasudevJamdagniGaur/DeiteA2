
"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "../components/AuthProvider";
import { saveReflection, getReflection } from "../lib/auth";
import { ArrowLeft, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "../types";

interface ChatScreenProps {
  date: string;
  onBack: () => void;
}

export default function ChatScreen({ date, onBack }: ChatScreenProps) {
  const { user, profile } = useAuthContext();
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
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">D</span>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">Deite</h1>
            <p className="text-xs text-gray-600">Your brain buddy 🧠💙</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {message.sender === "deite" ? (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                    <AvatarFallback className="bg-transparent text-white font-semibold">🧠</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md p-4 max-w-[80%] border border-gray-200">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl rounded-tr-md p-4 max-w-[80%]">
                    <p className="text-white text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">{getUserInitial()}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
              <AvatarFallback className="bg-transparent text-white font-semibold">🧠</AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 rounded-2xl rounded-tl-md p-4 max-w-[80%] border border-gray-200">
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
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              className="bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 rounded-full pr-12 focus:border-purple-500 focus:ring-purple-500"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full h-10 w-10 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
