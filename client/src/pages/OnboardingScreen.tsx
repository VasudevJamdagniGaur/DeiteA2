
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Brain, MessageCircle, Users, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

interface OnboardingScreenProps {
  onContinue: () => void;
}

export default function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  const features = [
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Deite is private and secure",
      color: "border-teal-200 hover:border-teal-400",
      bgColor: "from-teal-100 to-blue-100",
      iconColor: "text-teal-600",
      emoji: "🔒"
    },
    {
      icon: Brain,
      title: "Channel Thoughts",
      description: "Helps you channel your thoughts",
      color: "border-purple-200 hover:border-purple-400",
      bgColor: "from-purple-100 to-pink-100", 
      iconColor: "text-purple-600",
      emoji: "🧠"
    },
    {
      icon: Users,
      title: "Safe Space",
      description: "Your safe mental space",
      color: "border-green-200 hover:border-green-400",
      bgColor: "from-green-100 to-teal-100",
      iconColor: "text-green-600",
      emoji: "🌸"
    },
    {
      icon: MessageCircle,
      title: "Therapy + Reflection",
      description: "Therapy & reflection combined",
      color: "border-pink-200 hover:border-pink-400",
      bgColor: "from-pink-100 to-purple-100",
      iconColor: "text-pink-600",
      emoji: "💬"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 overflow-y-auto relative">
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-16 left-8"
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Heart className="w-6 h-6 text-pink-400" />
      </motion.div>
      <motion.div 
        className="absolute top-24 right-12"
        animate={{ y: [0, -20, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      >
        <Sparkles className="w-7 h-7 text-purple-400" />
      </motion.div>
      <motion.div 
        className="absolute top-32 left-1/3"
        animate={{ y: [0, -12, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
      >
        <Star className="w-5 h-5 text-blue-400" />
      </motion.div>

      <div className="pt-8 pb-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Welcome to Deite
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Your brain-healing journey starts here
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </p>
        </motion.div>
        
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`bg-gradient-to-br ${feature.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${feature.color} cursor-pointer`}>
                  <div className="text-center">
                    <motion.div 
                      className="w-16 h-16 mx-auto mb-4 bg-white/70 rounded-xl flex items-center justify-center shadow-md"
                      whileHover={{ rotate: 10 }}
                    >
                      <div className="text-2xl">{feature.emoji}</div>
                    </motion.div>
                    <h3 className="font-bold text-gray-800 text-sm mb-2">{feature.title}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Let's go! <Heart className="ml-2 h-5 w-5 animate-bounce" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
