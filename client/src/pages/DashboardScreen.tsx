import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "../components/AuthProvider";
import { getReflection, signOut } from "../lib/auth";
import { Settings, ChevronLeft, ChevronRight, MessageCircle, BookOpen, Smile } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-soft-teal/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="font-nunito font-bold text-3xl text-navy">Blish</h1>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="p-2 rounded-full bg-coral/10 text-coral hover:bg-coral/20 transition-colors duration-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-peach to-coral rounded-full flex items-center justify-center text-white font-bold">
              <span>{getUserInitial()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 max-w-md mx-auto">
        {/* Date Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white rounded-3xl shadow-2xl mb-6 border border-white/50">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousDay}
                  className="p-3 rounded-full bg-soft-teal/10 text-soft-teal hover:bg-soft-teal/20 transition-colors duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center">
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-br from-coral to-mustard rounded-full flex items-center justify-center text-white shadow-xl mb-2 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold">{format(currentDate, "d")}</div>
                      <div className="text-xs uppercase">{format(currentDate, "MMM")}</div>
                    </div>
                  </motion.div>
                  <p className="text-navy font-nunito font-semibold">
                    {format(currentDate, "EEEE, MMMM d")}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextDay}
                  className="p-3 rounded-full bg-soft-teal/10 text-soft-teal hover:bg-soft-teal/20 transition-colors duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
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
          <Card className="bg-white rounded-3xl shadow-2xl border border-white/50 mb-6">
            <CardContent className="p-8">
              <h2 className="font-nunito font-bold text-2xl text-navy mb-6">Day Reflect</h2>
              
              {!hasReflection ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 mb-6 italic">No entries yet</p>
                  <Button
                    onClick={() => onStartReflection(dateString)}
                    className="bg-coral text-white px-8 py-4 rounded-2xl font-nunito font-bold text-lg hover:bg-coral/90 transition-colors duration-300 shadow-lg hover:shadow-xl animate-bounce-gentle"
                  >
                    Chat with Deite <MessageCircle className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Journal Reflection */}
                  {isGeneratingReflection ? (
                    <div className="bg-gradient-to-r from-mint/20 to-peach/20 rounded-2xl p-6 mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-coral border-t-transparent rounded-full"></div>
                        <p className="text-gray-600 italic">Generating your reflection...</p>
                      </div>
                    </div>
                  ) : journalReflection ? (
                    <div className="bg-gradient-to-r from-mint/20 to-peach/20 rounded-2xl p-6 mb-6">
                      <div className="flex items-center mb-3">
                        <BookOpen className="h-5 w-5 text-soft-teal mr-2" />
                        <h3 className="font-nunito font-semibold text-navy">Today's Reflection</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{journalReflection}</p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-mint/20 to-peach/20 rounded-2xl p-6 mb-6">
                      <p className="text-gray-700 mb-2">{reflectionPreview}</p>
                      <p className="text-sm text-gray-500">Tap to continue your conversation with Deite</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => onStartReflection(dateString)}
                    className="w-full bg-mustard text-white py-4 rounded-2xl font-nunito font-bold text-lg hover:bg-mustard/90 transition-colors duration-300 shadow-lg"
                  >
                    Continue Reflecting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-mint/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">😊</div>
              <p className="font-nunito font-semibold text-navy">Mood Check</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-peach/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">📖</div>
              <p className="font-nunito font-semibold text-navy">My Journal</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
