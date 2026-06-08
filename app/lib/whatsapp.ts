// WhatsApp API service
export interface WhatsAppConfig {
  apiUrl: string
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
}

export interface WhatsAppMessage {
  to: string
  type: "text" | "template"
  text?: {
    body: string
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components: Array<{
      type: string
      parameters: Array<{
        type: string
        text: string
      }>
    }>
  }
}

export class WhatsAppService {
  private config: WhatsAppConfig

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/${this.config.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          ...message,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("WhatsApp API Error:", error)
        return false
      }

      const result = await response.json()
      console.log("WhatsApp message sent:", result)
      return true
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error)
      return false
    }
  }

  async sendPaymentReminder(
    phoneNumber: string,
    tenantName: string,
    roomNumber: string,
    amount: number,
    dueDate: string,
    kosName: string,
  ): Promise<boolean> {
    // Format phone number (remove leading 0 and add country code)
    const formattedPhone = phoneNumber.startsWith("0")
      ? "62" + phoneNumber.substring(1)
      : phoneNumber.startsWith("+62")
        ? phoneNumber.substring(1)
        : phoneNumber.startsWith("62")
          ? phoneNumber
          : "62" + phoneNumber

    const message: WhatsAppMessage = {
      to: formattedPhone,
      type: "text",
      text: {
        body: `🏠 *${kosName}*\n\nHalo ${tenantName},\n\nIni adalah pengingat pembayaran sewa kamar ${roomNumber}:\n\n💰 *Jumlah:* Rp ${amount.toLocaleString("id-ID")}\n📅 *Jatuh Tempo:* ${new Date(
          dueDate,
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}\n\nMohon segera lakukan pembayaran sebelum tanggal jatuh tempo.\n\nTerima kasih! 🙏`,
      },
    }

    return await this.sendMessage(message)
  }

  async sendPaymentConfirmation(
    phoneNumber: string,
    tenantName: string,
    roomNumber: string,
    amount: number,
    paidDate: string,
    kosName: string,
  ): Promise<boolean> {
    const formattedPhone = phoneNumber.startsWith("0")
      ? "62" + phoneNumber.substring(1)
      : phoneNumber.startsWith("+62")
        ? phoneNumber.substring(1)
        : phoneNumber.startsWith("62")
          ? phoneNumber
          : "62" + phoneNumber

    const message: WhatsAppMessage = {
      to: formattedPhone,
      type: "text",
      text: {
        body: `✅ *Pembayaran Diterima*\n\n🏠 *${kosName}*\n\nHalo ${tenantName},\n\nPembayaran Anda telah diterima:\n\n🏠 *Kamar:* ${roomNumber}\n💰 *Jumlah:* Rp ${amount.toLocaleString("id-ID")}\n📅 *Tanggal Bayar:* ${new Date(
          paidDate,
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}\n\nTerima kasih atas pembayaran tepat waktu! 🙏`,
      },
    }

    return await this.sendMessage(message)
  }

  async sendOverdueNotice(
    phoneNumber: string,
    tenantName: string,
    roomNumber: string,
    amount: number,
    dueDate: string,
    daysOverdue: number,
    kosName: string,
  ): Promise<boolean> {
    const formattedPhone = phoneNumber.startsWith("0")
      ? "62" + phoneNumber.substring(1)
      : phoneNumber.startsWith("+62")
        ? phoneNumber.substring(1)
        : phoneNumber.startsWith("62")
          ? phoneNumber
          : "62" + phoneNumber

    const message: WhatsAppMessage = {
      to: formattedPhone,
      type: "text",
      text: {
        body: `⚠️ *PEMBAYARAN TERLAMBAT*\n\n🏠 *${kosName}*\n\nHalo ${tenantName},\n\nPembayaran sewa kamar ${roomNumber} sudah terlambat ${daysOverdue} hari:\n\n💰 *Jumlah:* Rp ${amount.toLocaleString("id-ID")}\n📅 *Jatuh Tempo:* ${new Date(
          dueDate,
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}\n\n⏰ Mohon segera lakukan pembayaran untuk menghindari denda.\n\nHubungi kami jika ada kendala.\n\nTerima kasih! 🙏`,
      },
    }

    return await this.sendMessage(message)
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/${this.config.phoneNumberId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("WhatsApp connection test failed:", error)
      return false
    }
  }
}

// Utility functions
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "")

  // Format for Indonesian numbers
  if (cleaned.startsWith("0")) {
    return "62" + cleaned.substring(1)
  } else if (cleaned.startsWith("62")) {
    return cleaned
  } else {
    return "62" + cleaned
  }
}

export const validatePhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone)
  // Indonesian phone numbers should be 10-13 digits after country code
  return /^62\d{9,12}$/.test(formatted)
}
