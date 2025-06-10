import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onGetStarted: () => void;
}

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  return (
    <div className="h-screen relative ray-pattern flex flex-col items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Animated Brain Character */}
      <motion.div 
        className="relative z-10 mb-8"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-32 h-32 bg-gradient-to-br from-coral to-mustard rounded-full shadow-2xl border-4 border-white/30 flex items-center justify-center">
          <div className="text-6xl">🧠</div>
        </div>
      </motion.div>
      
      <motion.div 
        className="relative z-10 text-center px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h1 className="font-nunito font-bold text-6xl mb-4 drop-shadow-lg">Deite</h1>
        <p className="text-2xl font-medium mb-12 drop-shadow-md opacity-90">Your mindful companion</p>
        
        <Button
          onClick={onGetStarted}
          className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-full font-nunito font-bold text-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 shadow-xl"
        >
          <ArrowRight className="mr-2 h-6 w-6" />
          Get Started
        </Button>
      </motion.div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.1 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
