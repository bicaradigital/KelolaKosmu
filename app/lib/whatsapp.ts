// WhatsApp Link Generator Service
export interface WhatsAppConfig {
  apiUrl: string
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
}

export class WhatsAppService {
  private config: WhatsAppConfig

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  /**
   * Generate wa.me link dengan pesan otomatis untuk reminder pembayaran
   */
  generatePaymentReminderLink(
    phoneNumber: string,
    tenantName: string,
    roomNumber: string,
    dueDate: string,
  ): string {
    const formattedPhone = this.formatPhoneNumber(phoneNumber)
    const dueFormatted = new Date(dueDate).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const message = `Halo ${tenantName}, sewa kamar ${roomNumber} jatuh tempo ${dueFormatted}`
    const encodedMessage = encodeURIComponent(message)

    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  }

  /**
   * Generate wa.me link untuk notifikasi pembayaran terlambat
   */
  generateOverdueNoticeLink(
    phoneNumber: string,
    tenantName: string,
    roomNumber: string,
    daysOverdue: number,
    dueDate: string,
  ): string {
    const formattedPhone = this.formatPhoneNumber(phoneNumber)
    const dueFormatted = new Date(dueDate).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const message = `⚠️ Halo ${tenantName}, pembayaran kamar ${roomNumber} sudah terlambat ${daysOverdue} hari (jatuh tempo: ${dueFormatted})`
    const encodedMessage = encodeURIComponent(message)

    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  }

  /**
   * Generate wa.me link untuk konfirmasi pembayaran
   */
  generatePaymentConfirmationLink(
    phoneNumber: string,
    tenantName: string,
    roomNumber: string,
    amount: number,
    paidDate: string,
  ): string {
    const formattedPhone = this.formatPhoneNumber(phoneNumber)
    const paidFormatted = new Date(paidDate).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const amountFormatted = amount.toLocaleString("id-ID")
    const message = `✅ Halo ${tenantName}, pembayaran kamar ${roomNumber} sebesar Rp ${amountFormatted} sudah diterima pada ${paidFormatted}`
    const encodedMessage = encodeURIComponent(message)

    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  }

  /**
   * Format nomor telepon ke format internasional
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Hapus semua karakter non-angka
    const cleaned = phoneNumber.replace(/\D/g, "")

    // Format untuk nomor Indonesia
    if (cleaned.startsWith("0")) {
      return "62" + cleaned.substring(1)
    } else if (cleaned.startsWith("62")) {
      return cleaned
    } else {
      return "62" + cleaned
    }
  }

  // Test connection (untuk validasi konfigurasi lama jika ada)
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
