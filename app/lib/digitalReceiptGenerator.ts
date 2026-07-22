import { Payment, Tenant, Room, Settings, formatCurrency, formatDate } from "./storage"

export interface ReceiptGeneratorOptions {
  payment: Payment
  tenant: Tenant
  room: Room
  settings: Settings
  ownerSignature?: string // Base64 encoded signature
  paymentMethod: string
  note?: string
}

/**
 * Generate a digital receipt in HTML format that can be converted to PDF
 */
export function generateReceiptHTML(options: ReceiptGeneratorOptions): string {
  const { payment, tenant, room, settings, ownerSignature, paymentMethod, note } = options

  const receiptNumber = payment.digitalReceipt?.receiptNumber || `RCP-${Date.now()}`
  const receiptDate = payment.digitalReceipt?.receiptDate || new Date().toISOString()

  const monthNames = [
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
  const paymentMonthName = monthNames[parseInt(payment.month) - 1] || payment.month

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kwitansi Elektronik - ${receiptNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
          color: #333;
        }
        
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #0066cc;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 28px;
          color: #0066cc;
          margin-bottom: 5px;
        }
        
        .header p {
          font-size: 14px;
          color: #666;
        }
        
        .receipt-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        
        .info-section h3 {
          font-size: 12px;
          color: #0066cc;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .info-section p {
          font-size: 14px;
          line-height: 1.8;
          color: #333;
        }
        
        .info-section .label {
          color: #666;
          font-weight: bold;
        }
        
        .payment-details {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .payment-details h3 {
          font-size: 12px;
          color: #0066cc;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .detail-row {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 20px;
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
          font-size: 14px;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-row.total {
          border-top: 2px solid #0066cc;
          border-bottom: 2px solid #0066cc;
          font-weight: bold;
          color: #0066cc;
          margin: 15px 0;
          padding: 15px 0;
        }
        
        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin: 50px 0 30px 0;
          text-align: center;
        }
        
        .signature-box {
          border-top: 1px solid #333;
          padding-top: 60px;
          font-size: 12px;
        }
        
        .signature-image {
          max-height: 100px;
          margin-bottom: 10px;
        }
        
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
          margin-top: 30px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 10px 0;
        }
        
        .status-paid {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .no-print {
          display: none;
        }
        
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          
          .receipt-container {
            box-shadow: none;
            max-width: 100%;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h1>KWITANSI ELEKTRONIK</h1>
          <p>Bukti Pembayaran Sewa Kamar</p>
        </div>
        
        <div class="receipt-info">
          <div class="info-section">
            <h3>Informasi Pemilik/Pengelola</h3>
            <p>
              <span class="label">Nama:</span> ${settings.kosName || "Boarding House"}<br>
              <span class="label">Alamat:</span> ${settings.address || "-"}<br>
              <span class="label">Telepon:</span> ${settings.phone || "-"}<br>
              <span class="label">Email:</span> ${settings.email || "-"}
            </p>
          </div>
          
          <div class="info-section">
            <h3>Informasi Penyewa</h3>
            <p>
              <span class="label">Nama:</span> ${tenant.name}<br>
              <span class="label">Nomor KTP:</span> ${tenant.idNumber}<br>
              <span class="label">Telepon:</span> ${tenant.phone}<br>
              <span class="label">Email:</span> ${tenant.email}
            </p>
          </div>
        </div>
        
        <div class="payment-details">
          <h3>Detail Pembayaran</h3>
          
          <div class="detail-row">
            <div><span class="label">Nomor Kwitansi:</span></div>
            <div>${receiptNumber}</div>
          </div>
          
          <div class="detail-row">
            <div><span class="label">Tanggal Kwitansi:</span></div>
            <div>${formatDate(receiptDate)}</div>
          </div>
          
          <div class="detail-row">
            <div><span class="label">Nomor Kamar:</span></div>
            <div>${room.number}</div>
          </div>
          
          <div class="detail-row">
            <div><span class="label">Periode Pembayaran:</span></div>
            <div>${paymentMonthName} ${payment.year}</div>
          </div>
          
          <div class="detail-row">
            <div><span class="label">Tipe Pembayaran:</span></div>
            <div>${
              payment.paymentPeriod === "monthly"
                ? "Bulanan"
                : payment.paymentPeriod === "semester"
                  ? "Semester"
                  : "Tahunan"
            }</div>
          </div>
          
          <div class="detail-row">
            <div><span class="label">Metode Pembayaran:</span></div>
            <div>${paymentMethod}</div>
          </div>
          
          <div class="detail-row">
            <div><span class="label">Jumlah Pembayaran:</span></div>
            <div>Rp ${payment.amount.toLocaleString("id-ID")}</div>
          </div>
          
          ${
            payment.paidDate
              ? `<div class="detail-row">
                  <div><span class="label">Tanggal Pembayaran:</span></div>
                  <div>${formatDate(payment.paidDate)}</div>
                </div>`
              : ""
          }
          
          <div class="detail-row total">
            <div>TOTAL PEMBAYARAN</div>
            <div>Rp ${payment.amount.toLocaleString("id-ID")}</div>
          </div>
          
          ${
            note
              ? `<div class="detail-row">
                  <div><span class="label">Catatan:</span></div>
                  <div>${note}</div>
                </div>`
              : ""
          }
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div>Penyewa</div>
            <div>
              <span class="label">${tenant.name}</span>
            </div>
          </div>
          
          <div class="signature-box">
            <div>Pemilik/Pengelola</div>
            ${
              ownerSignature
                ? `<img src="${ownerSignature}" alt="Tanda Tangan" class="signature-image">`
                : ""
            }
            <div>
              <span class="label">${settings.kosName || "Boarding House"}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Kwitansi ini berlaku sebagai bukti pembayaran sewa kamar.</p>
          <p>Dihasilkan oleh Kelola Kosmu | ${new Date().toLocaleDateString("id-ID")}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return html
}

/**
 * Convert HTML to PDF using canvas (for client-side generation)
 */
export async function convertHTMLToPDF(html: string, fileName: string): Promise<string> {
  // This creates a data URL that can be used with html2pdf or similar
  // For now, we'll return a blob that can be converted to base64
  const blob = new Blob([html], { type: "text/html" })
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.readAsDataURL(blob)
  })
}

/**
 * Generate a simple receipt image using canvas (alternative to PDF)
 */
export async function generateReceiptImage(
  html: string,
): Promise<string> {
  // Create a temporary container
  const container = document.createElement("div")
  container.innerHTML = html
  container.style.display = "none"
  document.body.appendChild(container)

  try {
    // Use html2canvas if available, otherwise return HTML as data URL
    const element = container.querySelector(".receipt-container") as HTMLElement
    if (element) {
      // Simple approach: convert to canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Set canvas dimensions
        canvas.width = 800
        canvas.height = 1000

        // Draw white background
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Convert to image
        const imageData = canvas.toDataURL("image/png")
        return imageData
      }
    }
  } finally {
    document.body.removeChild(container)
  }

  // Fallback: return HTML as data URL
  const blob = new Blob([html], { type: "text/html" })
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.readAsDataURL(blob)
  })
}

/**
 * Generate receipt number in format RCP-YYYY-XXXX
 */
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")
  return `RCP-${year}-${random}`
}

/**
 * Download receipt as HTML file
 */
export function downloadReceiptAsHTML(html: string, receiptNumber: string): void {
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `kwitansi-${receiptNumber}.html`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Print receipt
 */
export function printReceipt(html: string): void {
  const printWindow = window.open("", "", "width=800,height=600")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 100)
  }
}

/**
 * Download receipt as PDF using browser's print to PDF feature
 */
export function downloadReceiptAsPDF(html: string, receiptNumber: string): void {
  const printWindow = window.open("", "", "width=800,height=600")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      // Open print dialog with focus on "Save as PDF" option
      printWindow.print()
      // Alternative: For automatic PDF generation, use server-side solution
      // You can integrate jsPDF here for automatic PDF generation
    }, 100)
  }
}

/**
 * Generate WhatsApp message with receipt details
 */
export function generateWhatsAppMessage(
  receiptNumber: string,
  tenantName: string,
  amount: number,
  roomNumber: string,
  paymentMonth: string,
): string {
  const formattedAmount = amount.toLocaleString("id-ID")
  const message = `Halo ${tenantName},\n\nBerikut adalah detail kwitansi pembayaran sewa kamar kamu:\n\n📄 *Kwitansi Elektronik*\nNomor: ${receiptNumber}\nKamar: ${roomNumber}\nPeriode: ${paymentMonth}\nJumlah: Rp ${formattedAmount}\n\nKwitansi ini berlaku sebagai bukti pembayaran.\n\nTerima kasih! 🙏`
  return message
}

/**
 * Send receipt via WhatsApp
 */
export function shareViaWhatsApp(
  phoneNumber: string,
  receiptNumber: string,
  tenantName: string,
  amount: number,
  roomNumber: string,
  paymentMonth: string,
): void {
  // Clean phone number (remove special characters, ensure starts with country code or just digits)
  let cleanPhone = phoneNumber.replace(/\D/g, "")
  
  // If doesn't start with country code, assume Indonesia (62)
  if (!cleanPhone.startsWith("62") && cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.substring(1)
  } else if (!cleanPhone.startsWith("62")) {
    cleanPhone = "62" + cleanPhone
  }

  const message = generateWhatsAppMessage(
    receiptNumber,
    tenantName,
    amount,
    roomNumber,
    paymentMonth,
  )

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message)

  // Open WhatsApp with pre-filled message
  // Format: https://wa.me/{phone}?text={message}
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
  window.open(whatsappUrl, "_blank")
}

/**
 * Copy WhatsApp message to clipboard
 */
export function copyWhatsAppMessageToClipboard(
  receiptNumber: string,
  tenantName: string,
  amount: number,
  roomNumber: string,
  paymentMonth: string,
): Promise<void> {
  const message = generateWhatsAppMessage(
    receiptNumber,
    tenantName,
    amount,
    roomNumber,
    paymentMonth,
  )

  // Copy to clipboard
  return navigator.clipboard.writeText(message).then(() => {
    console.log("[v0] WhatsApp message copied to clipboard")
  })
}
