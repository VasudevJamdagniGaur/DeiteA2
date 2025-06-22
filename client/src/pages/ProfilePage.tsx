
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "../components/AuthProvider";
import { saveUserProfile, signOut } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  User, 
  Mail, 
  Calendar,
  LogOut,
  Sparkles,
  Heart,
  Brain
} from "lucide-react";

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, profile, refreshProfile } = useAuthContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(profile?.gender || "");

  const handleEdit = () => {
    setIsEditing(true);
    // Reset form to current values
    setName(profile?.name || "");
    setAge(profile?.age?.toString() || "");
    setGender(profile?.gender || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setName(profile?.name || "");
    setAge(profile?.age?.toString() || "");
    setGender(profile?.gender || "");
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const updatedProfile = {
        ...profile,
        name,
        age: parseInt(age),
        gender: gender as "male" | "female" | "other",
      };

      await saveUserProfile(updatedProfile);
      await refreshProfile();
      
      setIsEditing(false);
      toast({
        title: "Profile updated! ✨",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "See you soon! 👋",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserInitial = () => {
    return (
      profile?.name?.charAt(0).toUpperCase() ||
      user?.email?.charAt(0).toUpperCase() ||
      "U"
    );
  };

  const genderOptions = [
    { value: "female", label: "Female 👩", color: "from-pink-400 to-purple-400" },
    { value: "male", label: "Male 👨", color: "from-blue-400 to-teal-400" },
    { value: "other", label: "Other 🌈", color: "from-purple-400 to-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-purple-600 hover:bg-purple-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          {/* Floating decorative elements */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Heart className="w-6 h-6 text-pink-400" />
          </motion.div>
        </div>

        {/* Profile Header */}
        <div className="text-center py-6 relative">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-slate-700 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl font-bold text-white">{getUserInitial()}</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Manage your account details
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </p>

          {/* Floating brain decoration */}
          <motion.div
            className="absolute top-4 right-8"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Brain className="w-6 h-6 text-purple-400" />
          </motion.div>
        </div>

        {/* Profile Details Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Profile Details</h2>
            </div>
            
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 font-medium">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
              </Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <span className="text-gray-800">{user?.email}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Read-only
                </Badge>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 font-medium">
                <User className="w-4 h-4 text-gray-500" />
                Name
              </Label>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="border-2 border-purple-200 focus:border-purple-400"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-800">{profile?.name || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 font-medium">
                <Calendar className="w-4 h-4 text-gray-500" />
                Age
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  min="13"
                  max="120"
                  className="border-2 border-purple-200 focus:border-purple-400"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-800">{profile?.age || "Not set"}</span>
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Gender</Label>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  {genderOptions.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={gender === option.value}
                        onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                        className="sr-only"
                      />
                      <motion.div
                        className={`p-3 text-center rounded-lg border-2 transition-all duration-300 font-medium ${
                          gender === option.value
                            ? `border-purple-400 bg-gradient-to-r ${option.color} text-white shadow-lg`
                            : "border-purple-200 bg-white hover:border-purple-300 text-gray-700"
                        }`}
                        whileHover={{ scale: gender === option.value ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-800">
                    {profile?.gender ? 
                      genderOptions.find(opt => opt.value === profile.gender)?.label || profile.gender 
                      : "Not set"
                    }
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Sign Out</h3>
                <p className="text-sm text-gray-600">
                  You'll need to sign in again to access your account
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            Your brain deserves all the love and care!
            <Heart className="w-4 h-4 text-pink-500" />
          </p>
        </div>
      </div>
    </div>
  );
}
