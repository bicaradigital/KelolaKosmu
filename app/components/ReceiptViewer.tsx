"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Printer, Share2, X } from "lucide-react"
import { type Payment, type Tenant, type Room } from "@/app/lib/storage"

interface ReceiptViewerProps {
  payment: Payment
  tenant: Tenant
  room: Room
  kosName: string
  onClose: () => void
  onGenerateReceipt: () => void
}

export default function ReceiptViewer({
  payment,
  tenant,
  room,
  kosName,
  onClose,
  onGenerateReceipt,
}: ReceiptViewerProps) {
  const [showActions, setShowActions] = useState(false)

  const handleDownload = () => {
    if (!payment.digitalReceipt) {
      alert("Kwitansi belum di-generate. Silakan generate terlebih dahulu.")
      return
    }

    const element = document.createElement("a")
    element.setAttribute("href", `data:text/html;charset=utf-8,${encodeURIComponent(payment.digitalReceipt.receiptPDF)}`)
    element.setAttribute("download", `Kwitansi-${payment.digitalReceipt.receiptNumber}.html`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handlePrint = () => {
    if (!payment.digitalReceipt) {
      alert("Kwitansi belum di-generate. Silakan generate terlebih dahulu.")
      return
    }

    const printWindow = window.open("", "", "height=400,width=600")
    if (printWindow) {
      printWindow.document.write(payment.digitalReceipt.receiptPDF)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleShare = async () => {
    if (!payment.digitalReceipt) {
      alert("Kwitansi belum di-generate. Silakan generate terlebih dahulu.")
      return
    }

    const receiptText = `
Kwitansi Elektronik
Nomor: ${payment.digitalReceipt.receiptNumber}
Tanggal: ${new Date(payment.digitalReceipt.receiptDate).toLocaleDateString("id-ID")}

Penyewa: ${tenant.name}
Kamar: ${room.number}
Periode: ${payment.month} ${payment.year}
Jumlah: Rp ${payment.amount.toLocaleString("id-ID")}

Status: Pembayaran Lunas

Terima kasih!
    `.trim()

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kwitansi ${payment.digitalReceipt.receiptNumber}`,
          text: receiptText,
        })
      } catch (error) {
        console.error("Share failed:", error)
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(receiptText)
      alert("Kwitansi sudah dicopy ke clipboard. Silakan paste ke chat WhatsApp atau email.")
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Kwitansi Elektronik</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Receipt Info */}
        {payment.digitalReceipt ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Nomor Kwitansi</p>
                <p className="font-semibold">{payment.digitalReceipt.receiptNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Tanggal</p>
                <p className="font-semibold">
                  {new Date(payment.digitalReceipt.receiptDate).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Metode Pembayaran</p>
                <p className="font-semibold capitalize">{payment.digitalReceipt.paymentMethod}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-green-600">Lunas</p>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={payment.digitalReceipt.receiptPDF}
                className="w-full h-96 border-none"
                title="Receipt Preview"
              />
            </div>

            {/* Signature Preview */}
            {payment.digitalReceipt.ownerSignature && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Tanda Tangan Pemilik</p>
                <img
                  src={payment.digitalReceipt.ownerSignature}
                  alt="Owner Signature"
                  className="max-w-xs h-auto border rounded"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-600">Kwitansi digital belum di-generate.</p>
            <p className="text-sm text-gray-500">
              Klik tombol di bawah untuk generate kwitansi digital profesional dengan tanda tangan pemilik.
            </p>
            <Button onClick={onGenerateReceipt} className="bg-blue-600 hover:bg-blue-700">
              Generate Kwitansi Digital
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
