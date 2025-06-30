
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "../components/ThemeProvider";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  HeadphonesIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface CustomerSupportScreenProps {
  onBack: () => void;
}

export default function CustomerSupportScreen({ onBack }: CustomerSupportScreenProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen p-4 transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800" 
        : "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
    }`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className={`rounded-full ${
              isDarkMode 
                ? "hover:bg-purple-500/20 text-purple-400" 
                : "hover:bg-purple-100 text-purple-600"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}>
            Customer Support
          </h1>
        </div>

        {/* Customer Service Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className={`backdrop-blur-sm border-2 shadow-xl ${
            isDarkMode 
              ? "bg-slate-800/80 border-green-500/30 shadow-green-500/20" 
              : "bg-white/80 border-green-100"
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <motion.div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isDarkMode 
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30" 
                      : "bg-gradient-to-br from-green-200 to-emerald-200"
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <HeadphonesIcon className={`w-8 h-8 ${isDarkMode ? "text-white" : "text-green-700"}`} />
                </motion.div>
              </div>
              <CardTitle className={`text-xl ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Customer Service
              </CardTitle>
              <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Need help? We're here for you!
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className={`p-4 rounded-xl ${
                isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Phone className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Support Number
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    +91 9536138120
                  </p>
                  <Button
                    onClick={() => window.open('tel:+919536138120')}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${
                isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    WhatsApp Support
                  </span>
                </div>
                <div className="space-y-3">
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Send us a message for quick support
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className={`text-lg font-semibold whitespace-nowrap ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      +91 9536138120
                    </p>
                    <Button
                      onClick={() => window.open('https://wa.me/919536138120', '_blank')}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold flex-shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${
                isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Mail className={`w-5 h-5 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Email Support
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className={`text-sm sm:text-lg font-semibold break-all ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    vasudevjamdagnigaur@gmail.com
                  </p>
                  <Button
                    onClick={() => window.open('mailto:vasudevjamdagnigaur@gmail.com?subject=Support Request', '_blank')}
                    size="sm"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold flex-shrink-0"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                </div>
              </div>

              <div className={`text-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>Available 24/7 for your support needs</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
