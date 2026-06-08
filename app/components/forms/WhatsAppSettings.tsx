"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, CheckCircle, XCircle, AlertCircle, TestTube } from "lucide-react"
import type { Settings } from "@/app/lib/storage"
import { WhatsAppService } from "@/app/lib/whatsapp"

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

  const [testResult, setTestResult] = useState<{
    status: "idle" | "testing" | "success" | "error"
    message?: string
  }>({ status: "idle" })

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

  const testConnection = async () => {
    if (!formData.accessToken || !formData.phoneNumberId) {
      setTestResult({
        status: "error",
        message: "Mohon lengkapi Access Token dan Phone Number ID",
      })
      return
    }

    setTestResult({ status: "testing" })

    try {
      const whatsappService = new WhatsAppService({
        apiUrl: formData.apiUrl,
        accessToken: formData.accessToken,
        phoneNumberId: formData.phoneNumberId,
        businessAccountId: formData.businessAccountId,
      })

      const success = await whatsappService.testConnection()

      if (success) {
        setTestResult({
          status: "success",
          message: "Koneksi WhatsApp berhasil!",
        })
      } else {
        setTestResult({
          status: "error",
          message: "Koneksi gagal. Periksa kembali konfigurasi Anda.",
        })
      }
    } catch (error) {
      setTestResult({
        status: "error",
        message: "Terjadi kesalahan saat menguji koneksi.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Konfigurasi WhatsApp Business API
          </CardTitle>
          <CardDescription>Setup WhatsApp Business API untuk mengirim reminder pembayaran otomatis</CardDescription>
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="access-token">Access Token *</Label>
                  <Input
                    id="access-token"
                    type="password"
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="Masukkan WhatsApp Access Token"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-number-id">Phone Number ID *</Label>
                  <Input
                    id="phone-number-id"
                    value={formData.phoneNumberId}
                    onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                    placeholder="Masukkan Phone Number ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-account-id">Business Account ID</Label>
                  <Input
                    id="business-account-id"
                    value={formData.businessAccountId}
                    onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
                    placeholder="Masukkan Business Account ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-url">API URL</Label>
                  <Input
                    id="api-url"
                    value={formData.apiUrl}
                    onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                    placeholder="https://graph.facebook.com/v18.0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={testResult.status === "testing"}
                  className="flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  {testResult.status === "testing" ? "Testing..." : "Test Koneksi"}
                </Button>

                {testResult.status !== "idle" && (
                  <div className="flex items-center gap-2">
                    {testResult.status === "success" && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Berhasil
                      </Badge>
                    )}
                    {testResult.status === "error" && (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Gagal
                      </Badge>
                    )}
                    {testResult.status === "testing" && (
                      <Badge variant="secondary">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Testing...
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {testResult.message && (
                <Alert className={testResult.status === "success" ? "border-green-500" : "border-red-500"}>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </>
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

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Cara Setup WhatsApp Business API:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Daftar di Meta for Developers (developers.facebook.com)</li>
            <li>Buat aplikasi baru dan aktifkan WhatsApp Business API</li>
            <li>Dapatkan Access Token dari dashboard aplikasi</li>
            <li>Catat Phone Number ID dari pengaturan WhatsApp</li>
            <li>Masukkan kredensial di form di atas dan test koneksi</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}
