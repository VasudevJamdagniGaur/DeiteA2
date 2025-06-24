
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { signIn, signUp } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Heart, Sparkles, Brain, Star } from "lucide-react";

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: "Account created! 🎉",
          description: "Welcome to Deite. Let's set up your profile.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back! 💙",
          description: "Successfully signed in to Deite.",
        });
      }
      
      // Let the auth state change trigger navigation
      console.log("Authentication successful, letting auth state handle navigation");
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 flex flex-col justify-center relative overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-16 left-8"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Heart className="w-8 h-8 text-pink-400" />
      </motion.div>
      <motion.div 
        className="absolute top-32 right-12"
        animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      >
        <Sparkles className="w-6 h-6 text-purple-400" />
      </motion.div>
      <motion.div 
        className="absolute bottom-32 left-12"
        animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
      >
        <Star className="w-7 h-7 text-blue-400" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="text-center mb-8">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Join Deite
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Your brain-healing journey starts here
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </p>
        </div>
        
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-purple-100">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-purple-700 font-semibold mb-2">
                  Email ✨
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors duration-300 bg-white/80"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-purple-700 font-semibold mb-2">
                  Password 🔒
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors duration-300 bg-white/80 text-gray-900"
                  placeholder="••••••••"
                  style={{ WebkitTextSecurity: 'disc' }}
                  required
                />
              </div>
              
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? "Create Account 🎉" : "Sign In 💙"}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-blue-400 to-teal-400 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-teal-500 transition-all duration-300 shadow-lg border-0"
                >
                  {isSignUp ? "Already have an account? Sign In 💙" : "Need an account? Sign Up ✨"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
