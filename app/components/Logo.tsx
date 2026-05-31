"use client"

import { Building2, Home } from "lucide-react"
import type { BoardingHouse } from "@/lib/storage"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  variant?: "default" | "white"
  boardingHouse?: BoardingHouse | null
}

export default function Logo({ size = "md", showText = true, variant = "default", boardingHouse }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }

  const iconColor = variant === "white" ? "text-white" : "text-blue-600"
  const textColor = variant === "white" ? "text-white" : "text-blue-700"

  // If boarding house has an image, show it
  if (boardingHouse?.imageData && size === "md" && showText) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={boardingHouse.imageData}
          alt={boardingHouse.name}
          className="w-10 h-10 rounded-lg object-cover shadow-lg border-2 border-blue-100"
        />
        {showText && (
          <div className="flex flex-col">
            <span className={`${textSizeClasses[size]} font-bold ${textColor} leading-tight`}>
              {boardingHouse.name}
            </span>
            {size !== "sm" && (
              <span className={`text-xs ${variant === "white" ? "text-blue-100" : "text-blue-500"} font-medium`}>
                Management System
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  // Fallback to default logo
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Background circle */}
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg`}
        >
          <Building2 className={`${size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-6 h-6"} text-white`} />
        </div>
        {/* Small accent */}
        <div
          className={`absolute -top-1 -right-1 ${size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"} rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-sm`}
        >
          <Home
            className={`${size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-2.5 h-2.5"} text-white m-auto mt-0.5`}
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold ${textColor} leading-tight`}>
            {boardingHouse?.name || "Kost Management"}
          </span>
          {size !== "sm" && (
            <span className={`text-xs ${variant === "white" ? "text-blue-100" : "text-blue-500"} font-medium`}>
              Management System
            </span>
          )}
        </div>
      )}
    </div>
  )
}
