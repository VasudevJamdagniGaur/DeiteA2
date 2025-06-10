import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { saveUserProfile } from "../lib/auth";
import { useAuthContext } from "../components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
        title: "Profile saved!",
        description: "Welcome to your mindful journey with Deite.",
      });

      console.log("Calling onComplete to navigate to dashboard");
      onComplete();
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
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-mint/30 to-peach/30 p-6 flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="text-center mb-8">
          <h1 className="font-nunito font-bold text-3xl text-navy mb-2">About You</h1>
          <p className="text-gray-600">Help us personalize your experience</p>
        </div>
        
        <Card className="bg-white rounded-3xl shadow-2xl border border-white/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="block text-navy font-nunito font-semibold mb-2">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-mint focus:outline-none transition-colors duration-300"
                  placeholder="What should we call you?"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="age" className="block text-navy font-nunito font-semibold mb-2">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-mint focus:outline-none transition-colors duration-300"
                  placeholder="Your age"
                  min="13"
                  max="120"
                  required
                />
              </div>
              
              <div>
                <Label className="block text-navy font-nunito font-semibold mb-3">Gender</Label>
                <div className="flex flex-wrap gap-3">
                  {genderOptions.map((option) => (
                    <label key={option.value} className="flex-1">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={gender === option.value}
                        onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                        className="sr-only"
                        required
                      />
                      <div
                        className={`p-3 text-center rounded-2xl border-2 cursor-pointer transition-colors duration-300 font-medium ${
                          gender === option.value
                            ? "border-mint bg-mint/10"
                            : "border-gray-200 hover:border-mint"
                        }`}
                      >
                        {option.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-navy text-white py-4 rounded-2xl font-nunito font-bold text-lg hover:bg-navy/90 transition-colors duration-300 shadow-lg disabled:opacity-50"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
