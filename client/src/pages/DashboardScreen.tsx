
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "../components/AuthProvider";
import { getReflection, signOut } from "../lib/auth";
import { Settings, ChevronLeft, ChevronRight, MessageCircle, BookOpen, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, subDays } from "date-fns";

interface DashboardScreenProps {
  onStartReflection: (date: string) => void;
}

export default function DashboardScreen({ onStartReflection }: DashboardScreenProps) {
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
        setReflectionPreview(reflection.content?.substring(0, 100) + "..." || "");
        
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
    const lines = content.split('\n');
    return lines.map((line, index) => {
      const [sender, ...contentParts] = line.split(': ');
      return {
        id: (index + 1).toString(),
        sender: sender.toLowerCase() === 'deite' ? 'deite' : 'user',
        content: contentParts.join(': '),
        timestamp: new Date(),
      };
    }).filter(msg => msg.content && msg.content.trim() !== '');
  };

  const generateJournalReflection = async (content: string) => {
    if (!content || isGeneratingReflection) return;
    
    setIsGeneratingReflection(true);
    try {
      const messages = parseMessagesFromContent(content);
      if (messages.length === 0) return;

      const response = await fetch('/api/reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (response.ok) {
        const data = await response.json();
        setJournalReflection(data.reflection);
      }
    } catch (error) {
      console.error('Error generating reflection:', error);
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
    return profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-emerald-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-700 font-serif">Blish</h1>
            <p className="text-slate-600 text-sm">Your mindful journal</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-10 h-10 rounded-full bg-white/50 hover:bg-white/70"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center text-slate-700 font-bold">
              <span>{getUserInitial()}</span>
            </div>
          </div>
        </div>
        
        {/* Date Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-6 bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousDay}
                  className="w-8 h-8 rounded-full hover:bg-rose-100"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </Button>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-700 mb-1">{format(currentDate, "d")}</div>
                  <div className="text-sm text-slate-600">{format(currentDate, "MMM")}</div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"  
                  onClick={handleNextDay}
                  className="w-8 h-8 rounded-full hover:bg-rose-100"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Button>
              </div>
              <div className="text-center">
                <p className="text-slate-600 font-medium">
                  {format(currentDate, "EEEE, MMMM d")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Day Reflect Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="mb-6 bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-rose-400 mr-3" />
                <h2 className="text-xl font-semibold text-slate-700 font-serif">Day Reflect</h2>
              </div>
              
              {hasReflection && (
                <div>
                  {/* Journal Reflection */}
                  {isGeneratingReflection ? (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full"></div>
                        <p className="text-slate-600 italic">Generating your reflection...</p>
                      </div>
                    </div>
                  ) : journalReflection ? (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-6">
                      <div className="flex items-center mb-3">
                        <BookOpen className="h-5 w-5 text-rose-400 mr-2" />
                        <h3 className="font-medium text-slate-700">Today's Reflection</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{journalReflection}</p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-6">
                      <p className="text-slate-600 mb-2">{reflectionPreview}</p>
                      <p className="text-sm text-slate-500">Tap to continue your conversation with Deite</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => onStartReflection(dateString)}
                    className="w-full bg-gradient-to-r from-rose-300 to-pink-300 hover:from-rose-400 hover:to-pink-400 text-white border-0 rounded-xl py-3 font-medium shadow-md transition-all duration-300"
                  >
                    Continue Reflecting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Chat with Deite Button */}
        <Button 
          onClick={() => onStartReflection(dateString)}
          className="w-full h-14 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-lg rounded-2xl shadow-lg border-0 transition-all duration-300 transform hover:scale-105 mb-6"
        >
          <MessageCircle className="w-5 h-5 mr-3" />
          Chat with Deite
          <Heart className="w-4 h-4 ml-2 fill-white" />
        </Button>

        
      </div>
    </div>
  );
}
