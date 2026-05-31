"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, AlertCircle } from "lucide-react"
import type { Settings } from "@/app/lib/storage"

interface WhatsAppSettingsProps {
  settings: Settings
  onSave: (settings: Settings) => void
}

export default function WhatsAppSettings({ settings, onSave }: WhatsAppSettingsProps) {
  const [formData, setFormData] = useState({
    apiUrl: settings.whatsappConfig?.apiUrl || "https://graph.facebook.com/v18.0",
    accessToken: settings.whatsappConfig?.accessToken || "",
    phoneNumberId: settings.whatsappConfig?.phoneNumberId || "",
    businessAccountId: settings.whatsappConfig?.businessAccountId || "",
    enabled: settings.whatsappConfig?.enabled || false,
    sendBeforeDue: settings.reminderSettings?.sendBeforeDue || true,
    daysBefore: settings.reminderSettings?.daysBefore || 3,
    sendOnOverdue: settings.reminderSettings?.sendOnOverdue || true,
    sendConfirmation: settings.reminderSettings?.sendConfirmation || true,
  })



  const handleSave = () => {
    const updatedSettings: Settings = {
      ...settings,
      whatsappConfig: {
        apiUrl: formData.apiUrl,
        accessToken: formData.accessToken,
        phoneNumberId: formData.phoneNumberId,
        businessAccountId: formData.businessAccountId,
        enabled: formData.enabled,
      },
      reminderSettings: {
        sendBeforeDue: formData.sendBeforeDue,
        daysBefore: formData.daysBefore,
        sendOnOverdue: formData.sendOnOverdue,
        sendConfirmation: formData.sendConfirmation,
      },
    }

    onSave(updatedSettings)
  }



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Pengaturan WhatsApp Reminder
          </CardTitle>
          <CardDescription>Aktifkan fitur untuk mengirim reminder pembayaran via WhatsApp dengan link otomatis (wa.me)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="whatsapp-enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
            <Label htmlFor="whatsapp-enabled">Aktifkan WhatsApp Reminder</Label>
          </div>

          {formData.enabled && (
            <Alert className="border-blue-500 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Cara Kerja:</strong> Sistem akan menghasilkan link WhatsApp otomatis dengan pesan yang sudah terisi. 
                User hanya perlu membuka link dan klik "Kirim" di WhatsApp. Tidak perlu API key atau konfigurasi kompleks!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Reminder</CardTitle>
          <CardDescription>Atur kapan dan bagaimana reminder pembayaran dikirim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reminder Sebelum Jatuh Tempo</Label>
                <p className="text-sm text-muted-foreground">
                  Kirim reminder beberapa hari sebelum tanggal jatuh tempo
                </p>
              </div>
              <Switch
                checked={formData.sendBeforeDue}
                onCheckedChange={(checked) => setFormData({ ...formData, sendBeforeDue: checked })}
              />
            </div>

            {formData.sendBeforeDue && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="days-before">Kirim berapa hari sebelumnya?</Label>
                <Input
                  id="days-before"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.daysBefore}
                  onChange={(e) => setFormData({ ...formData, daysBefore: Number.parseInt(e.target.value) || 3 })}
                  className="w-24"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reminder Pembayaran Terlambat</Label>
              <p className="text-sm text-muted-foreground">
                Kirim reminder untuk pembayaran yang sudah lewat jatuh tempo
              </p>
            </div>
            <Switch
              checked={formData.sendOnOverdue}
              onCheckedChange={(checked) => setFormData({ ...formData, sendOnOverdue: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Konfirmasi Pembayaran</Label>
              <p className="text-sm text-muted-foreground">Kirim konfirmasi otomatis saat pembayaran diterima</p>
            </div>
            <Switch
              checked={formData.sendConfirmation}
              onCheckedChange={(checked) => setFormData({ ...formData, sendConfirmation: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  )
}
