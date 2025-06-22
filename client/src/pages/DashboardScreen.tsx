import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "../components/AuthProvider";
import { getReflection, signOut } from "../lib/auth";
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  BookOpen,
  Sparkles,
  Brain,
  Heart,
  Sun,
  Calendar,
  Star,
  Flower2,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, subDays } from "date-fns";

interface DashboardScreenProps {
  onStartReflection: (date: string) => void;
}

export default function DashboardScreen({
  onStartReflection,
}: DashboardScreenProps) {
  const { user, profile } = useAuthContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hasReflection, setHasReflection] = useState(false);
  const [reflectionPreview, setReflectionPreview] = useState("");
  const [journalReflection, setJournalReflection] = useState("");
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);

  const dateString = format(currentDate, "yyyy-MM-dd");

  useEffect(() => {
    if (user) {
      checkReflection();
    }
  }, [user, currentDate]);

  const checkReflection = async () => {
    if (!user) return;

    try {
      const reflection = await getReflection(user.uid, dateString);
      if (reflection && reflection.content) {
        setHasReflection(true);
        setReflectionPreview(
          reflection.content?.substring(0, 100) + "..." || "",
        );

        // Generate journal reflection from messages
        await generateJournalReflection(reflection.content);
      } else {
        setHasReflection(false);
        setReflectionPreview("");
        setJournalReflection("");
      }
    } catch (error) {
      console.error("Error checking reflection:", error);
      setHasReflection(false);
      setJournalReflection("");
    }
  };

  const parseMessagesFromContent = (content: string) => {
    const lines = content.split("\n");
    return lines
      .map((line, index) => {
        const [sender, ...contentParts] = line.split(": ");
        return {
          id: (index + 1).toString(),
          sender: sender.toLowerCase() === "deite" ? "deite" : "user",
          content: contentParts.join(": "),
          timestamp: new Date(),
        };
      })
      .filter((msg) => msg.content && msg.content.trim() !== "");
  };

  const generateJournalReflection = async (content: string) => {
    if (!content || isGeneratingReflection) return;

    setIsGeneratingReflection(true);
    try {
      const messages = parseMessagesFromContent(content);
      if (messages.length === 0) return;

      const response = await fetch("/api/reflection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (response.ok) {
        const data = await response.json();
        setJournalReflection(data.reflection);
      }
    } catch (error) {
      console.error("Error generating reflection:", error);
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const handlePreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserInitial = () => {
    return (
      profile?.name?.charAt(0).toUpperCase() ||
      user?.email?.charAt(0).toUpperCase() ||
      "U"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with cute brain illustration */}
        <div className="text-center py-8 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-8 h-8 text-purple-600" />
            </motion.div>
          </div>
          <div className="mt-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2">
              Welcome back to Deite
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Continue your brain-healing journey
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </p>
          </div>

          {/* Floating cute elements */}
          <motion.div
            className="absolute top-4 left-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-6 h-6 text-pink-400" />
          </motion.div>
          <motion.div
            className="absolute top-8 right-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Flower2 className="w-5 h-5 text-purple-400" />
          </motion.div>

          {/* User avatar */}
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/20">
              <span>{getUserInitial()}</span>
            </div>
          </div>
        </div>

        {/* Date Selector - Cute Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-purple-100"
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="w-4 h-4 text-purple-600" />
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-600 font-medium">
                    Selected Date
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  {format(currentDate, "EEEE, MMMM d, yyyy")}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-purple-100"
                onClick={handleNextDay}
              >
                <ChevronRight className="w-4 h-4 text-purple-600" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Reflection - Super Cute */}
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-200 to-teal-200 rounded-full flex items-center justify-center">
                <Sun className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Day Reflect</h2>
            </div>

            {!hasReflection ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-400 mb-4 italic">
                  No entries yet - let's create some magic! ✨
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Mood Summary
                  </span>
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>

                {isGeneratingReflection ? (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600 italic">
                      Generating your reflection...
                    </p>
                  </div>
                ) : journalReflection ? (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {journalReflection} 🌟
                  </p>
                ) : (
                  <p className="text-gray-700 mb-4">
                    Today feels like a wonderful day for reflection! Your brain
                    is making amazing progress. 🌟
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600">
                    ✨ Grateful
                  </Badge>
                  <Badge className="bg-gradient-to-r from-purple-400 to-purple-500 text-white hover:from-purple-500 hover:to-purple-600">
                    🎯 Focused
                  </Badge>
                  <Badge className="bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600">
                    🧘 Calm
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat with Deite Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative"
        >
          <Button
            className="w-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-bold py-6 px-8 rounded-3xl shadow-xl border-0 text-lg relative overflow-hidden group"
            onClick={() => onStartReflection(dateString)}
          >
            <div className="absolute top-2 right-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-white/80" />
              </motion.div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span>{hasReflection ? "Continue Chat with Deite" : "Chat with Deite"}</span>
            </div>
          </Button>
        </motion.div>

        {/* Footer cute message */}
        <div className="text-center py-4">
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            Your brain deserves all the love and care!
            <Heart className="w-4 h-4 text-pink-500" />
          </p>
        </div>
      </div>
    </div>
  );
}
