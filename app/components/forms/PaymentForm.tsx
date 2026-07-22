"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WhatsAppService } from "@/app/lib/whatsapp"
import { type Payment, type Tenant, type Room, type Settings, type ReminderLog, generateId } from "@/app/lib/storage"

interface PaymentFormProps {
  payment?: Payment
  tenants: Tenant[]
  rooms: Room[]
  settings?: Settings
  onSubmit: (paymentData: Omit<Payment, "id" | "createdAt">) => void
  onCancel: () => void
  onAddReminderLog?: (log: ReminderLog) => void
}

export default function PaymentForm({
  payment,
  tenants,
  rooms,
  settings,
  onSubmit,
  onCancel,
  onAddReminderLog,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    tenantId: payment?.tenantId || "",
    roomId: payment?.roomId || "",
    amount: payment?.amount || 0,
    month: payment?.month || "",
    year: payment?.year || new Date().getFullYear(),
    dueDate: payment?.dueDate || "",
    paidDate: payment?.paidDate || "",
    status: payment?.status || ("pending" as const),
    notes: payment?.notes || "",
    paymentPeriod: (payment?.paymentPeriod || "monthly") as "monthly" | "semester" | "yearly",
  })

  const selectedTenant = tenants.find((t) => t.id === formData.tenantId)
  const selectedRoom = rooms.find((r) => r.id === formData.roomId)

  // Calculate multiplier based on payment period
  const getPeriodMultiplier = (period: "monthly" | "semester" | "yearly") => {
    switch (period) {
      case "monthly":
        return 1
      case "semester":
        return 6
      case "yearly":
        return 12
      default:
        return 1
    }
  }

  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId)
    const room = tenant?.roomId ? rooms.find((r) => r.id === tenant.roomId) : null

    setFormData({
      ...formData,
      tenantId,
      roomId: room?.id || "",
      amount: (room?.rent || 0) * getPeriodMultiplier(formData.paymentPeriod),
    })
  }

  const handlePeriodChange = (period: "monthly" | "semester" | "yearly") => {
    const baseAmount = selectedRoom ? selectedRoom.rent : 0
    setFormData({
      ...formData,
      paymentPeriod: period,
      amount: baseAmount * getPeriodMultiplier(period),
    })
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tenantId || !formData.roomId || !formData.month || !formData.dueDate || formData.amount <= 0) {
      alert("Mohon lengkapi semua field yang diperlukan")
      return
    }

    // Send WhatsApp confirmation if payment is marked as paid
    if (
      formData.status === "paid" &&
      formData.paidDate &&
      settings?.whatsappConfig?.enabled &&
      settings.reminderSettings?.sendConfirmation
    ) {
      const tenant = tenants.find((t) => t.id === formData.tenantId)
      const room = rooms.find((r) => r.id === formData.roomId)

      if (tenant && room) {
        try {
          const whatsappService = new WhatsAppService({
            apiUrl: settings.whatsappConfig.apiUrl,
            accessToken: settings.whatsappConfig.accessToken,
            phoneNumberId: settings.whatsappConfig.phoneNumberId,
            businessAccountId: settings.whatsappConfig.businessAccountId,
          })

          const success = await whatsappService.sendPaymentConfirmation(
            tenant.phone,
            tenant.name,
            room.number,
            formData.amount,
            formData.paidDate,
            settings.kosName,
          )

          // Log the confirmation
          if (onAddReminderLog) {
            onAddReminderLog({
              id: generateId(),
              paymentId: payment?.id || "new",
              tenantId: tenant.id,
              type: "confirmation",
              sentDate: new Date().toISOString(),
              success,
              message: success ? "Payment confirmation sent" : "Failed to send confirmation",
            })
          }
        } catch (error) {
          console.error("Failed to send payment confirmation:", error)
        }
      }
    }

    onSubmit(formData)
  }

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{payment ? "Edit Pembayaran" : "Catat Pembayaran Baru"}</CardTitle>
        <CardDescription>
          {payment ? "Ubah informasi pembayaran" : "Masukkan informasi pembayaran baru"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenantId">Penghuni *</Label>
              <Select value={formData.tenantId} onValueChange={handleTenantChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih penghuni" />
                </SelectTrigger>
                <SelectContent>
                  {tenants
                    .filter((t) => t.roomId)
                    .map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomId">Kamar</Label>
              <Input
                value={selectedRoom ? `Kamar ${selectedRoom.number}` : ""}
                disabled
                placeholder="Pilih penghuni terlebih dahulu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentPeriod">Periode Pembayaran *</Label>
            <Select
              value={formData.paymentPeriod}
              onValueChange={(value: "monthly" | "semester" | "yearly") => handlePeriodChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan (1 bulan)</SelectItem>
                <SelectItem value="semester">Semesteran (6 bulan)</SelectItem>
                <SelectItem value="yearly">Tahunan (12 bulan)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Bulan *</Label>
              <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Tahun *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: Number.parseInt(e.target.value) || new Date().getFullYear() })
                }
                min="2020"
                max="2030"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number.parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Tanggal Jatuh Tempo *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Pembayaran</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "pending" | "paid" | "overdue") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="overdue">Terlambat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.status === "paid" && (
            <div className="space-y-2">
              <Label htmlFor="paidDate">Tanggal Pembayaran</Label>
              <Input
                id="paidDate"
                type="date"
                value={formData.paidDate}
                onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
              />
            </div>
          )}



          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {payment ? "Update Pembayaran" : "Catat Pembayaran"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
