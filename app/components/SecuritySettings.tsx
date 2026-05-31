"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Lock, Download, Upload, Database, AlertTriangle, Key, FileDown, FileUp } from "lucide-react"
import type { Settings, BackupData } from "@/app/lib/storage"
import { hashPassword, exportBackup, importBackup } from "@/app/lib/storage"

interface SecuritySettingsProps {
  settings: Settings
  onSave: (settings: Settings) => void
  onBackupCreate: () => void
  onBackupRestore: (backup: BackupData) => void
  backups: BackupData[]
}

export default function SecuritySettings({
  settings,
  onSave,
  onBackupCreate,
  onBackupRestore,
  backups,
}: SecuritySettingsProps) {
  const [formData, setFormData] = useState({
    enablePassword: settings.security?.enablePassword || false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    enableAutoBackup: settings.security?.enableAutoBackup || true,
    backupFrequency: settings.security?.backupFrequency || "weekly",
    enableEncryption: settings.security?.enableEncryption || false,
  })

  const [passwordStatus, setPasswordStatus] = useState<{
    status: "idle" | "success" | "error"
    message?: string
  }>({ status: "idle" })

  const [backupStatus, setBackupStatus] = useState<{
    status: "idle" | "creating" | "success" | "error"
    message?: string
  }>({ status: "idle" })

  const handlePasswordChange = () => {
    if (!formData.newPassword || formData.newPassword.length < 6) {
      setPasswordStatus({
        status: "error",
        message: "Password harus minimal 6 karakter",
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordStatus({
        status: "error",
        message: "Konfirmasi password tidak cocok",
      })
      return
    }

    // If password is currently enabled, verify current password
    if (formData.enablePassword && settings.security?.passwordHash) {
      const currentHash = hashPassword(formData.currentPassword)
      if (currentHash !== settings.security.passwordHash) {
        setPasswordStatus({
          status: "error",
          message: "Password saat ini salah",
        })
        return
      }
    }

    const newSettings: Settings = {
      ...settings,
      security: {
        ...settings.security,
        enablePassword: true,
        passwordHash: hashPassword(formData.newPassword),
        enableAutoBackup: formData.enableAutoBackup,
        backupFrequency: formData.backupFrequency,
        enableEncryption: formData.enableEncryption,
      },
    }

    onSave(newSettings)
    setPasswordStatus({
      status: "success",
      message: "Password berhasil diubah",
    })

    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleSecurityToggle = (field: string, value: boolean) => {
    const newSettings: Settings = {
      ...settings,
      security: {
        ...settings.security,
        [field]: value,
      },
    }

    if (field === "enablePassword" && !value) {
      // Disable password protection
      newSettings.security!.passwordHash = undefined
    }

    onSave(newSettings)
    setFormData({ ...formData, [field]: value })
  }

  const handleCreateBackup = async () => {
    setBackupStatus({ status: "creating" })
    try {
      await onBackupCreate()
      setBackupStatus({
        status: "success",
        message: "Backup berhasil dibuat",
      })
    } catch (error) {
      setBackupStatus({
        status: "error",
        message: "Gagal membuat backup",
      })
    }
  }

  const handleExportBackup = (backup: BackupData) => {
    try {
      exportBackup(backup)
    } catch (error) {
      alert("Gagal mengekspor backup")
    }
  }

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const backup = await importBackup(file)
      if (confirm("Yakin ingin mengembalikan data dari backup ini? Data saat ini akan ditimpa.")) {
        onBackupRestore(backup)
        alert("Data berhasil dikembalikan dari backup")
      }
    } catch (error) {
      alert("Gagal mengimpor backup: " + (error as Error).message)
    }

    // Reset file input
    event.target.value = ""
  }

  return (
    <div className="space-y-6">
      {/* Password Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Proteksi Password
          </CardTitle>
          <CardDescription>Lindungi aplikasi dengan password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="password-protection"
              checked={formData.enablePassword}
              onCheckedChange={(checked) => handleSecurityToggle("enablePassword", checked)}
            />
            <Label htmlFor="password-protection">Aktifkan Proteksi Password</Label>
          </div>

          {formData.enablePassword && (
            <div className="space-y-4">
              {settings.security?.passwordHash && (
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Masukkan password saat ini"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <Button onClick={handlePasswordChange} className="bg-blue-600 hover:bg-blue-700">
                <Key className="w-4 h-4 mr-2" />
                {settings.security?.passwordHash ? "Ubah Password" : "Set Password"}
              </Button>

              {passwordStatus.status !== "idle" && (
                <Alert className={passwordStatus.status === "success" ? "border-green-500" : "border-red-500"}>
                  <AlertDescription>{passwordStatus.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Encryption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Enkripsi Data
          </CardTitle>
          <CardDescription>Enkripsi data yang disimpan di browser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aktifkan Enkripsi</Label>
              <p className="text-sm text-muted-foreground">Data akan dienkripsi sebelum disimpan</p>
            </div>
            <Switch
              checked={formData.enableEncryption}
              onCheckedChange={(checked) => handleSecurityToggle("enableEncryption", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backup Otomatis
          </CardTitle>
          <CardDescription>Backup data secara otomatis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-backup"
              checked={formData.enableAutoBackup}
              onCheckedChange={(checked) => handleSecurityToggle("enableAutoBackup", checked)}
            />
            <Label htmlFor="auto-backup">Aktifkan Backup Otomatis</Label>
          </div>

          {formData.enableAutoBackup && (
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Frekuensi Backup</Label>
              <Select
                value={formData.backupFrequency}
                onValueChange={(value: "daily" | "weekly" | "monthly") => {
                  setFormData({ ...formData, backupFrequency: value })
                  handleSecurityToggle("backupFrequency", value as any)
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Backup Manual
          </CardTitle>
          <CardDescription>Buat dan kelola backup secara manual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={handleCreateBackup} disabled={backupStatus.status === "creating"}>
              <Download className="w-4 h-4 mr-2" />
              {backupStatus.status === "creating" ? "Membuat Backup..." : "Buat Backup"}
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Backup
              </Button>
            </div>
          </div>

          {backupStatus.status !== "idle" && (
            <Alert className={backupStatus.status === "success" ? "border-green-500" : "border-red-500"}>
              <AlertDescription>{backupStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Backup History */}
          <div className="space-y-4">
            <h4 className="font-medium">Riwayat Backup ({backups.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {backups
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10)
                .map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(backup.timestamp).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {backup.encrypted && (
                          <Badge variant="secondary">
                            <Shield className="w-3 h-3 mr-1" />
                            Encrypted
                          </Badge>
                        )}
                        <Badge variant="outline">ID: {backup.id.slice(-8)}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportBackup(backup)}>
                        <FileDown className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Yakin ingin mengembalikan data dari backup ini?")) {
                            onBackupRestore(backup)
                          }
                        }}
                      >
                        <FileUp className="w-3 h-3 mr-1" />
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}

              {backups.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Belum ada backup yang dibuat</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Penting:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Backup data secara berkala untuk menghindari kehilangan data</li>
            <li>Simpan file backup di tempat yang aman</li>
            <li>Password yang lupa tidak dapat dipulihkan</li>
            <li>Enkripsi akan memperlambat akses data namun meningkatkan keamanan</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
