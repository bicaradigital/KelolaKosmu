"use client"

import { useState } from "react"
import { Activity, Building2, Users, DollarSign, Wallet, MessageCircle, Menu, X } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: Activity },
    { value: "rooms", label: "Kamar", icon: Building2 },
    { value: "tenants", label: "Penghuni", icon: Users },
    { value: "payments", label: "Pembayaran", icon: DollarSign },
    { value: "financial", label: "Keuangan", icon: Wallet },
    { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  ]

  const handleTabClick = (tab: string) => {
    onTabChange(tab)
    setMobileMenuOpen(false)
  }

  return (
    <div className="w-full">
      {/* Desktop Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="hidden md:block w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-white shadow-md border border-blue-100 rounded-lg h-auto p-1 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1 md:gap-2 py-3 px-2 md:px-3 text-xs md:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded transition-all"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Mobile Navigation */}
      <div className="md:hidden w-full">
        <div className="bg-white shadow-md border border-blue-100 rounded-lg p-3 flex items-center justify-between">
          <div className="text-sm font-medium text-blue-700">{tabs.find((t) => t.value === activeTab)?.label}</div>
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 h-auto">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border border-blue-100 rounded-lg mt-2 z-50">
            <div className="flex flex-col">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabClick(tab.value)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left border-b border-blue-50 last:border-b-0 transition-all ${
                      activeTab === tab.value ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
