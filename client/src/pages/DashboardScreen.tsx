import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "../components/AuthProvider";
import { getReflection, signOut } from "../lib/auth";
import { CalendarPopup } from "../components/CalendarPopup";
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
  Moon,
  Calendar,
  Star,
  Flower2,
  User,
  LogOut,
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const dateString = format(currentDate, "yyyy-MM-dd");
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className={`min-h-screen p-4 transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800" 
        : "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
    }`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with cute brain illustration */}
        <div className="text-center py-8 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            <motion.div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDarkMode 
                  ? "bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg shadow-purple-500/50" 
                  : "bg-gradient-to-br from-pink-200 to-purple-200"
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className={`w-8 h-8 ${isDarkMode ? "text-white" : "text-purple-600"}`} />
            </motion.div>
          </div>
          <div className="mt-8">
            <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2 ${
              isDarkMode 
                ? "from-purple-400 via-pink-400 to-blue-400" 
                : "from-purple-600 via-pink-500 to-blue-500"
            }`}>
              Welcome back to Deite
            </h1>
            <p className={`flex items-center justify-center gap-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}>
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
            <Heart className={`w-6 h-6 ${isDarkMode ? "text-pink-400 drop-shadow-lg" : "text-pink-400"}`} />
          </motion.div>
          <motion.div
            className="absolute top-8 right-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Flower2 className={`w-5 h-5 ${isDarkMode ? "text-purple-400 drop-shadow-lg" : "text-purple-400"}`} />
          </motion.div>

          {/* User avatar and theme toggle */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isDarkMode 
                    ? "bg-white/10 text-yellow-400 hover:bg-white/20" 
                    : "bg-white/50 text-purple-600 hover:bg-white/70"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-10 h-10 bg-gradient-to-br from-slate-700 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/20 hover:shadow-xl transition-all duration-300 p-0"
                  >
                    <span>{getUserInitial()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className={`w-48 ${
                    isDarkMode 
                      ? "bg-slate-800 border-purple-500/30 text-white" 
                      : "bg-white border-purple-100"
                  }`}
                >
                  <DropdownMenuItem className={`cursor-pointer ${
                    isDarkMode 
                      ? "hover:bg-purple-500/20 focus:bg-purple-500/20" 
                      : "hover:bg-purple-50 focus:bg-purple-50"
                  }`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>User Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className={isDarkMode ? "bg-purple-500/30" : "bg-purple-100"} />
                  <DropdownMenuItem 
                    className={`cursor-pointer ${
                      isDarkMode 
                        ? "hover:bg-red-500/20 focus:bg-red-500/20 text-red-400" 
                        : "hover:bg-red-50 focus:bg-red-50 text-red-600"
                    }`}
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Date Selector - Cute Card */}
        <Card className={`backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? "bg-slate-800/80 border-purple-500/30 shadow-purple-500/10 hover:shadow-purple-500/20" 
            : "bg-white/80 border-purple-100"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${
                  isDarkMode 
                    ? "hover:bg-purple-500/20 text-purple-400" 
                    : "hover:bg-purple-100 text-purple-600"
                }`}
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div 
                className="text-center relative cursor-pointer hover:bg-purple-500/10 rounded-lg p-3 transition-all duration-200"
                onClick={() => setShowCalendar(true)}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className={`w-4 h-4 ${isDarkMode ? "text-purple-400" : "text-purple-500"}`} />
                  <span className={`text-sm font-medium ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}>
                    Selected Date
                  </span>
                  {!isToday && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 px-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 text-yellow-400 hover:text-yellow-300 transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        goToToday()
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-xs font-medium">Today</span>
                      </div>
                    </Button>
                  )}
                </div>
                <div className={`text-lg font-semibold transition-colors ${
                  isDarkMode ? "text-white hover:text-purple-200" : "text-gray-800 hover:text-purple-600"
                }`}>
                  {format(currentDate, "EEEE, MMMM d, yyyy")}
                </div>
                <div className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Click to open calendar
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${
                  isDarkMode 
                    ? "hover:bg-purple-500/20 text-purple-400" 
                    : "hover:bg-purple-100 text-purple-600"
                }`}
                onClick={handleNextDay}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Reflection - Super Cute */}
        <Card className={`border-2 shadow-lg ${
          isDarkMode 
            ? "bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-500/30 shadow-emerald-500/10" 
            : "bg-gradient-to-br from-green-50 to-teal-50 border-green-200"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode 
                  ? "bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/30" 
                  : "bg-gradient-to-br from-green-200 to-teal-200"
              }`}>
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-white" />
                ) : (
                  <Sun className="w-5 h-5 text-green-600" />
                )}
              </div>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}>
                {isDarkMode ? "Daily Brain Boost" : "Day Reflect"}
              </h2>
            </div>

            {!hasReflection ? (
              <div className="text-center py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}>
                  <BookOpen className={`h-6 w-6 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                </div>
                <p className={`mb-4 italic ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>
                  No entries yet - let's create some magic! ✨
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Mood Summary
                  </span>
                  <div className="flex gap-1">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        isDarkMode 
                          ? "bg-emerald-400 shadow-sm shadow-emerald-400" 
                          : "bg-green-400"
                      }`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        isDarkMode 
                          ? "bg-emerald-400 shadow-sm shadow-emerald-400" 
                          : "bg-green-400"
                      }`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        isDarkMode 
                          ? "bg-emerald-400 shadow-sm shadow-emerald-400" 
                          : "bg-green-400"
                      }`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>

                {isGeneratingReflection ? (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`animate-spin w-4 h-4 border-2 border-t-transparent rounded-full ${
                      isDarkMode ? "border-emerald-500" : "border-green-500"
                    }`}></div>
                    <p className={`italic ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Generating your reflection...
                    </p>
                  </div>
                ) : journalReflection ? (
                  <p className={`mb-4 leading-relaxed ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}>
                    {journalReflection} 🌟
                  </p>
                ) : (
                  <p className={`mb-4 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    Today feels like a wonderful day for reflection! Your brain
                    is making amazing progress. 🌟
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={`bg-gradient-to-r text-white ${
                    isDarkMode 
                      ? "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30" 
                      : "from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600"
                  }`}>
                    ✨ Grateful
                  </Badge>
                  <Badge className={`bg-gradient-to-r text-white ${
                    isDarkMode 
                      ? "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30" 
                      : "from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600"
                  }`}>
                    🎯 Focused
                  </Badge>
                  <Badge className={`bg-gradient-to-r text-white ${
                    isDarkMode 
                      ? "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/30" 
                      : "from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
                  }`}>
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
          <p className={`flex items-center justify-center gap-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            <Brain className={`w-4 h-4 ${isDarkMode ? "text-purple-400" : "text-purple-500"}`} />
            Your brain deserves all the love and care!
            <Heart className={`w-4 h-4 ${isDarkMode ? "text-pink-400" : "text-pink-500"}`} />
          </p>
        </div>
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <CalendarPopup
          selectedDate={currentDate}
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
