"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "../components/AuthProvider";
import { useTheme } from "../components/ThemeProvider";
import { saveReflection, getReflection, getDayReflect, saveDayReflect } from "../lib/auth";
import { db } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ArrowLeft, Send, Brain, EyeOff, Eye } from "lucide-react";
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    if (!message.trim() || isLoading || !user) return;

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
      const messagesToSend = [...messages, userMessage];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          messages: messagesToSend.map(msg => ({
            sender: msg.sender === "user" ? "user" : "deite",
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error("Invalid response format");
      }

      const aiMessage: ChatMessage = {
        id: `deite-${Date.now()}`,
        sender: "deite",
        content: data.reply,
        timestamp: new Date(),
      };

      const finalMessages = [...messages, userMessage, aiMessage];
      setMessages(finalMessages);

      // Messages are now automatically saved by the backend
      console.log("Messages saved automatically by backend");

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

  const sendStreamingMessage = async () => {
    if (!message.trim() || isStreaming || !user) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messagesToSend = [...messages, userMessage];
    setMessage("");
    setIsStreaming(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    // Add placeholder for AI response
    const aiMessageId = `deite-${Date.now()}`;
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      sender: "deite",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          messages: messagesToSend.map(msg => ({
            sender: msg.sender === "user" ? "user" : "deite",
            content: msg.content
          }))
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let wordBuffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Process any remaining content in the buffer
            if (wordBuffer.trim()) {
              accumulatedContent += wordBuffer;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.sender === "deite") {
                  lastMessage.content = accumulatedContent;
                }
                return newMessages;
              });
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          wordBuffer += chunk;

          // Split by spaces to get words
          const words = wordBuffer.split(" ");

          // Keep the last word in buffer (might be incomplete)
          wordBuffer = words.pop() || "";

          // Process complete words
          for (const word of words) {
            if (word.trim()) {
              accumulatedContent += (accumulatedContent ? " " : "") + word;

              // Update the bot message with new word
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.sender === "deite") {
                  lastMessage.content = accumulatedContent;
                }
                return newMessages;
              });

              // Add delay between words for streaming effect
              await new Promise((resolve) => setTimeout(resolve, 80));
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Stream aborted");
        return;
      }

      console.error("Streaming error:", err);

      // Fallback to regular API
      try {
        const fallbackResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            messages: [...messages, userMessage].map((msg) => ({
              sender: msg.sender === "user" ? "user" : "deite",
              content: msg.content,
            })),
          }),
        });

        if (!fallbackResponse.ok) throw new Error("Fallback request failed");

        const data = await fallbackResponse.json();

        // Animate the fallback response word by word
        const words = data.reply.split(" ");
        let accumulatedContent = "";

        for (let i = 0; i < words.length; i++) {
          accumulatedContent += (i > 0 ? " " : "") + words[i];

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.sender === "deite") {
              lastMessage.content = accumulatedContent;
            }
            return newMessages;
          });

          // Add delay between words
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);

        // Remove the empty bot message and show error
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsStreaming(false);
      setIsLoading(false); // Ensure isLoading is also set to false
      abortControllerRef.current = null;

      // Auto-save conversation if not in incognito mode
      if (!isIncognito) {
        saveConversation(messages.concat(aiMessage)); // Ensure the final AI message is included
      }
    }
  };

  const saveConversation = async (messagesToSave: ChatMessage[]) => {
    if (!user || isIncognito) return; // Don't save in incognito mode

    try {
      const content = messagesToSave
        .map(msg => `${msg.sender === 'deite' ? 'Deite' : 'You'}: ${msg.content}`)
        .join('\n');

      await saveReflection(user.uid, date, content);

      // Auto-generate day reflect if it doesn't exist yet
      await generateDayReflectIfNeeded(messagesToSave);
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
  };

  const generateDayReflectIfNeeded = async (messagesToSave: ChatMessage[]) => {
    if (!user || isIncognito) return;

    try {
      // Check if day reflect already exists
      const existingDayReflect = await getDayReflect(user.uid, date);

      if (!existingDayReflect && messagesToSave.length >= 4) { // Only if meaningful conversation
        // Generate day reflect
        const response = await fetch("/api/reflection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid, // Include userId
            messages: messagesToSave.map(msg => ({
              sender: msg.sender === "user" ? "user" : "deite",
              content: msg.content
            }))
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.reflection) {
            await saveDayReflect(user.uid, date, data.reflection);
            console.log("Day reflect auto-generated and saved");
          }
        }
      }
    } catch (error) {
      console.error("Error auto-generating day reflect:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Allow Shift+Enter for new lines
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsLoading(false); // Ensure isLoading is also set to false
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
              Deite {isIncognito && <span className="text-sm">🕶️</span>}
            </h1>
            <p className={`text-xs transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {isIncognito ? "Incognito mode - messages won't be saved" : "Your cute AI companion"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsIncognito(!isIncognito)}
          className={`transition-colors duration-300 ${
            isDarkMode
              ? "text-gray-400 hover:text-white hover:bg-gray-800"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          } ${isIncognito ? (isDarkMode ? "text-purple-400" : "text-purple-600") : ""}`}
          title={isIncognito ? "Turn off incognito mode" : "Turn on incognito mode"}
        >
          {isIncognito ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
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

        {isLoading && !isStreaming && (
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
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Deite is thinking...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {isStreaming && (
          <div className="flex items-center justify-center space-x-2 py-2">
            <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Deite is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t transition-colors duration-300 ${
        isDarkMode ? "border-gray-800" : "border-gray-200"
      }`}>
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              disabled={isLoading || isStreaming}
              rows={1}
              className={`min-h-[2.5rem] max-h-[15rem] resize-none rounded-2xl transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
              }`}
              style={{
                height: 'auto',
                overflowY: message.split('\n').length > 10 ? 'scroll' : 'hidden'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                const lineHeight = 1.5; // rem
                const padding = 0.75; // rem (py-3)
                const maxLines = 10;
                const scrollHeight = target.scrollHeight;
                const lineHeightPx = parseFloat(getComputedStyle(target).lineHeight);
                const lines = Math.floor((scrollHeight - (padding * 16 * 2)) / lineHeightPx);

                if (lines <= maxLines) {
                  target.style.height = scrollHeight + 'px';
                } else {
                  target.style.height = (lineHeightPx * maxLines + (padding * 16 * 2)) + 'px';
                }
              }}
            />
          </div>
          {isStreaming ? (
            <Button
              onClick={stopStreaming}
              size="icon"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full h-10 w-10 flex-shrink-0"
            >
              <div className="w-3 h-3 bg-white rounded-sm" />
            </Button>
          ) : (
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full h-10 w-10 flex-shrink-0 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}