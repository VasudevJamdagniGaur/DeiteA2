
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Heart, Sparkles, Star, ArrowRight } from "lucide-react";

interface SplashScreenProps {
  onGetStarted: () => void;
}

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-20 left-16"
        animate={{ y: [0, -30, 0], rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <Heart className="w-12 h-12 text-pink-400/60" />
      </motion.div>
      <motion.div 
        className="absolute top-32 right-20"
        animate={{ y: [0, -25, 0], rotate: [0, -360] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      >
        <Sparkles className="w-10 h-10 text-yellow-400/60" />
      </motion.div>
      <motion.div 
        className="absolute bottom-32 left-12"
        animate={{ y: [0, -20, 0], rotate: [0, 360] }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }}
      >
        <Star className="w-8 h-8 text-blue-400/60" />
      </motion.div>
      <motion.div 
        className="absolute bottom-40 right-16"
        animate={{ y: [0, -35, 0], rotate: [0, -360] }}
        transition={{ duration: 9, repeat: Infinity, delay: 3 }}
      >
        <Brain className="w-14 h-14 text-purple-400/60" />
      </motion.div>

      {/* Animated rays pattern background */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, 
            hsl(300, 70%, 80%), 
            hsl(280, 70%, 85%), 
            hsl(240, 70%, 85%), 
            hsl(200, 70%, 80%), 
            hsl(180, 70%, 85%), 
            hsl(160, 70%, 80%), 
            hsl(120, 70%, 85%), 
            hsl(60, 70%, 80%), 
            hsl(20, 70%, 85%), 
            hsl(340, 70%, 80%), 
            hsl(300, 70%, 80%))`
        }}
      />

      <div className="text-center z-10">
        {/* Main logo/brain */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div 
            className="w-32 h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center mx-auto shadow-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 20px 25px -5px rgba(0, 0, 0, 0.1)", 
                "0 25px 50px -12px rgba(147, 51, 234, 0.25)",
                "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="w-16 h-16 text-white" />
          </motion.div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-6"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-4">
            Deite
          </h1>
          <p className="text-xl text-gray-700 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Your mindful AI companion
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mb-12"
        >
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Embark on a colorful journey of self-discovery and mental wellness 🌈
          </p>
        </motion.div>

        {/* Get started button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
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
      </div>

      {/* Bottom decorative text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-gray-500 flex items-center justify-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          Made with love for your mental health
          <Heart className="w-4 h-4 text-pink-500" />
        </p>
      </motion.div>
    </div>
  );
}
