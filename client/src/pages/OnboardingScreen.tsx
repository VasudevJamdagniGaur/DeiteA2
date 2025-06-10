import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Brain, MessageCircle, Users } from "lucide-react";
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
      color: "border-soft-teal/20 hover:border-soft-teal/40",
    },
    {
      icon: Brain,
      title: "Channel Thoughts",
      description: "Helps you channel your thoughts",
      color: "border-peach/20 hover:border-peach/40",
    },
    {
      icon: Users,
      title: "Safe Space",
      description: "Your safe mental space",
      color: "border-mustard/20 hover:border-mustard/40",
    },
    {
      icon: MessageCircle,
      title: "Therapy + Reflection",
      description: "Therapy & reflection combined",
      color: "border-coral/20 hover:border-coral/40",
    },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-cream via-mint/30 to-soft-teal/30 p-6 overflow-y-auto">
      <div className="pt-8 pb-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="font-nunito font-bold text-3xl text-navy mb-2">Welcome to Deite</h1>
          <p className="text-lg text-gray-600">Your journey to better mental health starts here</p>
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
              >
                <Card className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${feature.color}`}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="font-nunito font-bold text-navy text-sm mb-2">{feature.title}</h3>
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
            className="w-full bg-coral text-white py-4 rounded-2xl font-nunito font-bold text-lg hover:bg-coral/90 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Let's go! <Heart className="ml-2 h-5 w-5 animate-bounce-gentle" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
