import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Sparkles, Brain, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate password confirmation for sign up
        if (password !== confirmPassword) {
          toast({
            title: "Password mismatch",
            description: "Please make sure both passwords match.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <Heart className="absolute top-20 left-8 w-6 h-6 text-pink-300 opacity-60" />
      <Sparkles className="absolute top-32 right-12 w-5 h-5 text-purple-300 opacity-50" />
      <Sparkles className="absolute bottom-40 left-12 w-4 h-4 text-yellow-300 opacity-60" />
      <Sparkles className="absolute bottom-32 right-16 w-4 h-4 text-yellow-300 opacity-50" />

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-purple-600 mb-2">Join Deite</h1>
          <p className="text-gray-600 text-sm">Your brain-healing journey starts here</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-600 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 text-gray-900 placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-600 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 text-gray-900 placeholder:text-gray-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-purple-600 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 text-gray-900 placeholder:text-gray-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 rounded-xl"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            <Button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              variant="outline"
              className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-600 font-medium py-3 rounded-xl bg-transparent"
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}