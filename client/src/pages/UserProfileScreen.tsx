
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "../components/AuthProvider";
import { useTheme } from "../components/ThemeProvider";
import { saveUserProfile } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  User,
  Calendar,
  Users,
  Edit3,
  Save,
  X,
  Heart,
  Sparkles,
  Star,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface UserProfileScreenProps {
  onBack: () => void;
}

export default function UserProfileScreen({ onBack }: UserProfileScreenProps) {
  const { user, profile, refreshProfile } = useAuthContext();
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: profile?.name || "",
    age: profile?.age?.toString() || "",
    gender: profile?.gender || "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      await saveUserProfile({
        uid: user.uid,
        name: editData.name,
        age: parseInt(editData.age),
        gender: editData.gender as "male" | "female" | "other",
      });

      await refreshProfile();
      setIsEditing(false);
      toast({
        title: "Profile updated! ✨",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: profile?.name || "",
      age: profile?.age?.toString() || "",
      gender: profile?.gender || "",
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      // Delete user account from Firebase Auth
      await user.delete();
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      // The auth state change will automatically redirect to login
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error deleting account",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getGenderEmoji = (gender: string) => {
    switch (gender) {
      case "female":
        return "👩";
      case "male":
        return "👨";
      case "other":
        return "🌈";
      default:
        return "👤";
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "female":
        return "from-pink-400 to-purple-400";
      case "male":
        return "from-blue-400 to-teal-400";
      case "other":
        return "from-purple-400 to-pink-400";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800" 
        : "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
    }`}>
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

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${
              isDarkMode 
                ? "hover:bg-purple-500/20 text-purple-400" 
                : "hover:bg-purple-100 text-purple-600"
            }`}
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            isDarkMode 
              ? "from-purple-400 via-pink-400 to-blue-400" 
              : "from-purple-600 via-pink-500 to-blue-500"
          }`}>
            Your Profile
          </h1>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className={`backdrop-blur-sm border-2 shadow-xl ${
            isDarkMode 
              ? "bg-slate-800/80 border-purple-500/30 shadow-purple-500/20" 
              : "bg-white/80 border-purple-100"
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <motion.div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30" 
                      : "bg-gradient-to-br from-purple-200 to-pink-200"
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </motion.div>
              </div>
              <CardTitle className={`text-2xl ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                {profile?.name || "User"}
              </CardTitle>
              <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {user?.email}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!isEditing ? (
                <>
                  {/* Display Mode */}
                  <div className="grid gap-4">
                    <div className={`p-4 rounded-xl ${
                      isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <User className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                        <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Name
                        </span>
                      </div>
                      <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        {profile?.name || "Not set"}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl ${
                      isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                        <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Age
                        </span>
                      </div>
                      <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        {profile?.age ? `${profile.age} years old` : "Not set"}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl ${
                      isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Users className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                        <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Gender
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`bg-gradient-to-r text-white ${getGenderColor(profile?.gender || "")}`}>
                          {getGenderEmoji(profile?.gender || "")} {profile?.gender || "Not set"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name" className={`block mb-2 font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Name
                      </Label>
                      <Input
                        id="edit-name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className={`w-full ${
                          isDarkMode 
                            ? "bg-slate-700 border-slate-600 text-white" 
                            : "bg-white border-gray-300"
                        }`}
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-age" className={`block mb-2 font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Age
                      </Label>
                      <Input
                        id="edit-age"
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                        className={`w-full ${
                          isDarkMode 
                            ? "bg-slate-700 border-slate-600 text-white" 
                            : "bg-white border-gray-300"
                        }`}
                        placeholder="Enter your age"
                        min="13"
                        max="120"
                      />
                    </div>

                    <div>
                      <Label className={`block mb-3 font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Gender
                      </Label>
                      <div className="flex flex-col gap-2">
                        {[
                          { value: "female", label: "Female 👩", color: "from-pink-400 to-purple-400" },
                          { value: "male", label: "Male 👨", color: "from-blue-400 to-teal-400" },
                          { value: "other", label: "Other 🌈", color: "from-purple-400 to-pink-400" },
                        ].map((option) => (
                          <label key={option.value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="edit-gender"
                              value={option.value}
                              checked={editData.gender === option.value}
                              onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                              className="sr-only"
                            />
                            <motion.div
                              className={`p-3 text-center rounded-xl border-2 transition-all duration-300 font-medium ${
                                editData.gender === option.value
                                  ? `border-purple-400 bg-gradient-to-r ${option.color} text-white shadow-lg`
                                  : isDarkMode
                                  ? "border-slate-600 bg-slate-700 hover:border-slate-500 text-gray-300"
                                  : "border-gray-300 bg-white hover:border-gray-400 text-gray-700"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {option.label}
                            </motion.div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className={`flex-1 font-semibold py-3 rounded-xl ${
                        isDarkMode 
                          ? "border-slate-600 text-gray-300 hover:bg-slate-700" 
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Delete Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className={`backdrop-blur-sm border-2 shadow-xl ${
            isDarkMode 
              ? "bg-slate-800/80 border-red-500/30 shadow-red-500/20" 
              : "bg-white/80 border-red-100"
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <motion.div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30" 
                      : "bg-gradient-to-br from-red-200 to-red-300"
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className={`w-8 h-8 ${isDarkMode ? "text-white" : "text-red-700"}`} />
                </motion.div>
              </div>
              <CardTitle className={`text-xl ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Danger Zone
              </CardTitle>
              <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Permanently delete your account and all data
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className={`p-4 rounded-xl border-2 border-dashed ${
                isDarkMode ? "bg-red-900/20 border-red-500/50" : "bg-red-50 border-red-200"
              }`}>
                <div className="text-center space-y-3">
                  <p className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                    <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account, profile, chat history, and all associated data.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold"
                        disabled={deleteLoading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleteLoading ? "Deleting..." : "Delete Account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={isDarkMode ? "bg-slate-800 border-red-500/30" : "bg-white border-red-200"}>
                      <AlertDialogHeader>
                        <AlertDialogTitle className={`flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                          Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Your profile and personal information</li>
                            <li>All chat history and conversations</li>
                            <li>Daily reflections and summaries</li>
                            <li>Account preferences and settings</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className={isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : ""}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? "Deleting..." : "Yes, Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        
      </div>
    </div>
  );
}
