import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { signIn, signUp } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
          title: "Account created!",
          description: "Welcome to Deite. Let's set up your profile.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to Deite.",
        });
      }
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
    <div className="h-screen bg-gradient-to-br from-soft-teal/30 to-cream p-6 flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="text-center mb-8">
          <h1 className="font-nunito font-bold text-3xl text-navy mb-2">Join Deite</h1>
          <p className="text-gray-600">Create your account or sign in</p>
        </div>
        
        <Card className="bg-white rounded-3xl shadow-2xl border border-white/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-navy font-nunito font-semibold mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-soft-teal focus:outline-none transition-colors duration-300"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-navy font-nunito font-semibold mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-soft-teal focus:outline-none transition-colors duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-coral text-white py-4 rounded-2xl font-nunito font-bold text-lg hover:bg-coral/90 transition-colors duration-300 shadow-lg disabled:opacity-50"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  variant="outline"
                  className="w-full bg-mustard text-white py-4 rounded-2xl font-nunito font-bold text-lg hover:bg-mustard/90 transition-colors duration-300 shadow-lg border-0"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
