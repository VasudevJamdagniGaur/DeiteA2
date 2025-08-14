
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { apiUrl } from '../lib/config';

interface CalendarPopupProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onClose: () => void
  isDarkMode?: boolean
}

export function CalendarPopup({ selectedDate, onDateSelect, onClose, isDarkMode = false }: CalendarPopupProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  const [chatActivity, setChatActivity] = useState<Record<string, number>>({})
  const { user } = useAuthContext()

  const today = new Date()
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Fetch chat activity data when month changes
  useEffect(() => {
    const fetchChatActivity = async () => {
      if (!user) return

      // Get start and end dates for the current month view
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      const startDateStr = startDate.toISOString().slice(0, 10)
      const endDateStr = endDate.toISOString().slice(0, 10)

      try {
        const response = await fetch(apiUrl(`/api/memory/activity/${user.uid}?startDate=${startDateStr}&endDate=${endDateStr}`))
        if (response.ok) {
          const data = await response.json()
          setChatActivity(data.activity || {})
        }
      } catch (error) {
        console.error("Error fetching chat activity:", error)
      }
    }

    fetchChatActivity()
  }, [currentMonth, user])

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateSelect(newDate)
    onClose()
  }

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toDateString() === selectedDate.toDateString()
  }

  const getActivityIntensity = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = date.toISOString().slice(0, 10)
    const messageCount = chatActivity[dateStr] || 0
    
    if (messageCount === 0) return ""
    if (messageCount === 1) return "bg-purple-200/30 border-purple-300/40"
    if (messageCount <= 3) return "bg-purple-300/40 border-purple-400/50"
    if (messageCount <= 6) return "bg-purple-400/50 border-purple-500/60"
    if (messageCount <= 10) return "bg-purple-500/60 border-purple-600/70"
    return "bg-purple-600/70 border-purple-700/80"
  }

  // Generate calendar days
  const calendarDays = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const activityStyle = getActivityIntensity(day)
    const hasActivity = activityStyle !== ""
    
    calendarDays.push(
      <Button
        key={day}
        variant="ghost"
        className={`h-10 w-10 p-0 rounded-full text-sm font-medium transition-all duration-200 relative ${
          isSelected(day)
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 z-10"
            : isToday(day)
              ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30"
              : hasActivity
                ? `${activityStyle} ${isDarkMode ? "text-white" : "text-gray-800"} hover:brightness-110`
                : isDarkMode 
                  ? "text-gray-300 hover:bg-purple-500/20 hover:text-white"
                  : "text-gray-600 hover:bg-purple-500/20 hover:text-white"
        }`}
        onClick={() => handleDateClick(day)}
      >
        {day}
        {hasActivity && !isSelected(day) && (
          <div className="absolute inset-0 rounded-full border-2 border-current opacity-20"></div>
        )}
      </Button>,
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`backdrop-blur-sm border-2 shadow-2xl w-full max-w-sm ${
        isDarkMode 
          ? "bg-slate-800/95 border-purple-500/30 shadow-purple-500/20" 
          : "bg-white/95 border-purple-200 shadow-purple-200/20"
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${
                isDarkMode 
                  ? "hover:bg-purple-500/20 text-gray-400 hover:text-white" 
                  : "hover:bg-purple-100 text-gray-600 hover:text-gray-800"
              }`}
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${
                isDarkMode 
                  ? "hover:bg-purple-500/20 text-purple-400" 
                  : "hover:bg-purple-100 text-purple-600"
              }`}
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${
                isDarkMode 
                  ? "hover:bg-purple-500/20 text-purple-400" 
                  : "hover:bg-purple-100 text-purple-600"
              }`}
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className={`h-10 flex items-center justify-center text-xs font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">{calendarDays}</div>

          {/* Activity Legend */}
          <div className={`mt-4 pt-4 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <div className="mb-3">
              <p className={`text-xs font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}>
                Chat Activity
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-purple-200/30 border border-purple-300/40"></div>
                  <div className="w-3 h-3 rounded-sm bg-purple-300/40 border border-purple-400/50"></div>
                  <div className="w-3 h-3 rounded-sm bg-purple-400/50 border border-purple-500/60"></div>
                  <div className="w-3 h-3 rounded-sm bg-purple-500/60 border border-purple-600/70"></div>
                  <div className="w-3 h-3 rounded-sm bg-purple-600/70 border border-purple-700/80"></div>
                </div>
                <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>More</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className={`pt-3 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 text-yellow-400 hover:text-yellow-300"
              onClick={() => {
                onDateSelect(today)
                onClose()
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-medium">Go to Today</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
