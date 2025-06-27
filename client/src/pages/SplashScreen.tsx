
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Heart, Sparkles, Star, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface SplashScreenProps {
  onGetStarted: () => void;
}

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-16 left-8"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Heart className="w-8 h-8 text-pink-400 drop-shadow-lg" />
      </motion.div>
      <motion.div 
        className="absolute top-24 right-12"
        animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      >
        <Sparkles className="w-6 h-6 text-purple-400 drop-shadow-lg" />
      </motion.div>
      <motion.div 
        className="absolute bottom-32 left-16"
        animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
      >
        <Star className="w-7 h-7 text-blue-400 drop-shadow-lg" />
      </motion.div>
      <motion.div 
        className="absolute bottom-40 right-8"
        animate={{ y: [0, -30, 0], rotate: [0, -20, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, delay: 3 }}
      >
        <Heart className="w-5 h-5 text-pink-300 drop-shadow-lg" />
      </motion.div>
      <motion.div 
        className="absolute top-1/3 left-4"
        animate={{ y: [0, -18, 0], rotate: [0, 25, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
      >
        <Sparkles className="w-4 h-4 text-yellow-400 drop-shadow-lg" />
      </motion.div>
      <motion.div 
        className="absolute top-1/2 right-6"
        animate={{ y: [0, -22, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, delay: 2.5 }}
      >
        <Star className="w-6 h-6 text-purple-300 drop-shadow-lg" />
      </motion.div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10"
      >
        {/* Main logo/brain */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: showContent ? 1 : 0, rotate: showContent ? 0 : -180 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="mb-8"
        >
          <motion.div 
            className="relative mx-auto"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Brain className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
            {/* Glowing ring effect */}
            <motion.div 
              className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full opacity-20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Secondary glow */}
            <motion.div 
              className="absolute -inset-2 w-28 h-28 bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-blue-400/30 rounded-full blur-md"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-6"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            Deite
          </h1>
          <motion.div 
            className="flex items-center justify-center gap-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <p className="text-gray-300 text-lg font-medium">Your mindful AI companion</p>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mb-12"
        >
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Embark on a colorful journey of self-discovery and mental wellness 🌈
          </p>
        </motion.div>

        {/* Get started button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white px-12 py-6 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105"
          >
            <span className="flex items-center gap-3">
              Get Started
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </span>
          </Button>
        </motion.div>

        {/* Loading indicator */}
        <motion.div 
          className="flex justify-center items-center space-x-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <motion.div 
            className="w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="w-3 h-3 bg-pink-400 rounded-full shadow-lg shadow-pink-400/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div 
            className="w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </motion.div>
      </motion.div>

      {/* Bottom decorative text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-gray-500 flex items-center justify-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          Made with love for your mental health
          <Heart className="w-4 h-4 text-pink-400" />
        </p>
      </motion.div>
    </div>
  );
}
