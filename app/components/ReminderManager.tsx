"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Send, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Users, ExternalLink } from "lucide-react"
import { WhatsAppService } from "@/app/lib/whatsapp"
import {
  formatCurrency,
  formatDate,
  getDaysUntilDue,
  getDaysOverdue,
  type Payment,
  type Tenant,
  type Room,
  type Settings,
  type ReminderLog,
  generateId,
} from "@/app/lib/storage"

interface ReminderManagerProps {
  payments: Payment[]
  tenants: Tenant[]
  rooms: Room[]
  settings: Settings
  reminderLogs: ReminderLog[]
  onUpdatePayment: (id: string, data: Partial<Payment>) => void
  onAddReminderLog: (log: ReminderLog) => void
}

export default function ReminderManager({
  payments,
  tenants,
  rooms,
  settings,
  reminderLogs,
  onUpdatePayment,
  onAddReminderLog,
}: ReminderManagerProps) {
  const [clickedLinks, setClickedLinks] = useState<string[]>([])

  const whatsappService = new WhatsAppService({
    apiUrl: settings.whatsappConfig?.apiUrl || "https://graph.facebook.com/v18.0",
    accessToken: settings.whatsappConfig?.accessToken || "",
    phoneNumberId: settings.whatsappConfig?.phoneNumberId || "",
    businessAccountId: settings.whatsappConfig?.businessAccountId || "",
  })

  // Get payments that need reminders
  const getPaymentsNeedingReminders = () => {
    const today = new Date()
    const results = {
      beforeDue: [] as Array<Payment & { tenant: Tenant; room: Room; daysUntil: number }>,
      overdue: [] as Array<Payment & { tenant: Tenant; room: Room; daysOverdue: number }>,
    }

    payments.forEach((payment) => {
      if (payment.status === "paid") return

      const tenant = tenants.find((t) => t.id === payment.tenantId)
      const room = rooms.find((r) => r.id === payment.roomId)

      if (!tenant || !room) return

      const daysUntil = getDaysUntilDue(payment.dueDate)
      const daysOverdue = getDaysOverdue(payment.dueDate)

      // Check if reminder already sent today
      const todayStr = today.toISOString().split("T")[0]
      const reminderSentToday = reminderLogs.some(
        (log) => log.paymentId === payment.id && log.sentDate.startsWith(todayStr),
      )

      if (reminderSentToday) return

      // Before due reminders
      if (
        settings.reminderSettings?.sendBeforeDue &&
        daysUntil <= (settings.reminderSettings.daysBefore || 3) &&
        daysUntil > 0
      ) {
        results.beforeDue.push({ ...payment, tenant, room, daysUntil })
      }

      // Overdue reminders
      if (settings.reminderSettings?.sendOnOverdue && daysOverdue > 0) {
        results.overdue.push({ ...payment, tenant, room, daysOverdue })
      }
    })

    return results
  }

  const generateAndLogReminder = (payment: Payment, tenant: Tenant, type: "before_due" | "overdue") => {
    // Create reminder log
    const log: ReminderLog = {
      id: generateId(),
      paymentId: payment.id,
      tenantId: tenant.id,
      type,
      sentDate: new Date().toISOString(),
      success: true,
      message: "Link reminder dibuat",
    }

    onAddReminderLog(log)

    // Update payment reminder status
    onUpdatePayment(payment.id, {
      reminderSent: true,
      reminderSentDate: new Date().toISOString(),
    })

    setClickedLinks((prev) => [...prev, payment.id])
  }

  const handleOpenWhatsAppLink = (payment: Payment, tenant: Tenant, room: Room, type: "before_due" | "overdue") => {
    let link = ""

    if (type === "before_due") {
      link = whatsappService.generatePaymentReminderLink(
        tenant.phone,
        tenant.name,
        room.number,
        payment.dueDate,
      )
    } else {
      const daysOverdue = getDaysOverdue(payment.dueDate)
      link = whatsappService.generateOverdueNoticeLink(
        tenant.phone,
        tenant.name,
        room.number,
        daysOverdue,
        payment.dueDate,
      )
    }

    // Log the reminder when user clicks the link
    generateAndLogReminder(payment, tenant, type)

    // Open WhatsApp link
    window.open(link, "_blank")
  }

  const reminderData = getPaymentsNeedingReminders()

  if (!settings.whatsappConfig?.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            WhatsApp Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              WhatsApp reminder belum diaktifkan. Silakan konfigurasi di pengaturan terlebih dahulu.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reminder Hari Ini</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminderData.beforeDue.length + reminderData.overdue.length}</div>
            <p className="text-xs text-muted-foreground">
              {reminderData.beforeDue.length} sebelum jatuh tempo, {reminderData.overdue.length} terlambat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reminder Terkirim</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                reminderLogs.filter(
                  (log) => log.success && log.sentDate.startsWith(new Date().toISOString().split("T")[0]),
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Keberhasilan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminderLogs.length > 0
                ? Math.round((reminderLogs.filter((log) => log.success).length / reminderLogs.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {reminderLogs.filter((log) => log.success).length} dari {reminderLogs.length} berhasil
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Before Due Reminders */}
      {reminderData.beforeDue.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Reminder Sebelum Jatuh Tempo ({reminderData.beforeDue.length})
              </CardTitle>
              <CardDescription>
                Pembayaran yang akan jatuh tempo dalam {settings.reminderSettings?.daysBefore || 3} hari - Klik tombol untuk membuka WhatsApp
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminderData.beforeDue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.tenant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Kamar {item.room.number} - {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Jatuh tempo: {formatDate(item.dueDate)} ({item.daysUntil} hari lagi)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {clickedLinks.includes(item.id) && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Link Dibuat
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      onClick={() => handleOpenWhatsAppLink(item, item.tenant, item.room, "before_due")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Buka WA
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Reminders */}
      {reminderData.overdue.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Reminder Pembayaran Terlambat ({reminderData.overdue.length})
              </CardTitle>
              <CardDescription>Pembayaran yang sudah lewat jatuh tempo - Klik tombol untuk membuka WhatsApp</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminderData.overdue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                  <div className="flex-1">
                    <p className="font-medium">{item.tenant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Kamar {item.room.number} - {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-red-600">
                      Terlambat {item.daysOverdue} hari (jatuh tempo: {formatDate(item.dueDate)})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {clickedLinks.includes(item.id) && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Link Dibuat
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleOpenWhatsAppLink(item, item.tenant, item.room, "overdue")}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Buka WA
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Reminders Needed */}
      {reminderData.beforeDue.length === 0 && reminderData.overdue.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Tidak ada reminder yang perlu dikirim hari ini</p>
            <p className="text-muted-foreground">Semua pembayaran dalam kondisi baik</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
