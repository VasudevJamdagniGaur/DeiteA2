
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { saveUserProfile } from "../lib/auth";
import { useAuthContext } from "../components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Heart, Sparkles, Brain, Star, User } from "lucide-react";

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

export default function ProfileSetupScreen({ onComplete }: ProfileSetupScreenProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuthContext();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error("No user found");
      return;
    }

    console.log("Starting profile save for user:", user.uid);
    setLoading(true);

    try {
      const profileData = {
        uid: user.uid,
        name,
        age: parseInt(age),
        gender: gender as "male" | "female" | "other",
      };
      
      console.log("Saving profile:", profileData);
      await saveUserProfile(profileData);
      console.log("Profile saved successfully");

      // Refresh the profile state to trigger navigation
      console.log("Refreshing profile state...");
      await refreshProfile();
      console.log("Profile state refreshed");

      toast({
        title: "Profile saved! 🎉",
        description: "Welcome to your mindful journey with Deite.",
      });

      console.log("Profile setup complete, calling onComplete");
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        onComplete();
      }, 100);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: "female", label: "Female 👩", color: "from-pink-400 to-purple-400" },
    { value: "male", label: "Male 👨", color: "from-blue-400 to-teal-400" },
    { value: "other", label: "Other 🌈", color: "from-purple-400 to-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 flex flex-col justify-center relative overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-20 left-8"
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Heart className="w-6 h-6 text-pink-400" />
      </motion.div>
      <motion.div 
        className="absolute top-16 right-12"
        animate={{ y: [0, -20, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      >
        <Sparkles className="w-7 h-7 text-purple-400" />
      </motion.div>
      <motion.div 
        className="absolute bottom-24 left-16"
        animate={{ y: [0, -12, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
      >
        <Star className="w-5 h-5 text-blue-400" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="text-center mb-8">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-teal-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-green-500 to-blue-500 bg-clip-text text-transparent mb-2">
            About You
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Help us personalize your brain-healing experience
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </p>
        </div>
        
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-teal-100">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="block text-teal-700 font-semibold mb-2">
                  Your Name ✨
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-teal-200 focus:border-teal-400 focus:outline-none transition-colors duration-300 bg-white/80"
                  placeholder="What should we call you? 😊"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="age" className="block text-teal-700 font-semibold mb-2">
                  Age 🎂
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-teal-200 focus:border-teal-400 focus:outline-none transition-colors duration-300 bg-white/80"
                  placeholder="Your age"
                  min="13"
                  max="120"
                  required
                />
              </div>
              
              <div>
                <Label className="block text-teal-700 font-semibold mb-3">Gender 🌟</Label>
                <div className="flex flex-col gap-3">
                  {genderOptions.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={gender === option.value}
                        onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                        className="sr-only"
                        required
                      />
                      <motion.div
                        className={`p-4 text-center rounded-2xl border-2 transition-all duration-300 font-medium shadow-md ${
                          gender === option.value
                            ? `border-teal-400 bg-gradient-to-r ${option.color} text-white shadow-lg scale-105`
                            : "border-teal-200 bg-white/80 hover:border-teal-300 text-gray-700"
                        }`}
                        whileHover={{ scale: gender === option.value ? 1.05 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.div>
                    </label>
                  ))}
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-teal-600 hover:to-green-600 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue to Dashboard 🚀
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
