"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignaturePad from "./SignaturePad"
import { type Payment, type Tenant, type Room, type Settings } from "@/app/lib/storage"
import {
  generateReceiptHTML,
  generateReceiptNumber,
  downloadReceiptAsHTML,
  downloadReceiptAsPDF,
  printReceipt,
  shareViaWhatsApp,
  copyWhatsAppMessageToClipboard,
  generateWhatsAppMessage,
} from "@/app/lib/digitalReceiptGenerator"

interface DigitalReceiptGeneratorProps {
  payment: Payment
  tenant: Tenant
  room: Room
  settings: Settings
  onReceiptGenerated: (receipt: Payment["digitalReceipt"]) => void
  onClose?: () => void
}

export default function DigitalReceiptGenerator({
  payment,
  tenant,
  room,
  settings,
  onReceiptGenerated,
  onClose,
}: DigitalReceiptGeneratorProps) {
  const [step, setStep] = useState<"info" | "signature" | "preview">("info")
  const [formData, setFormData] = useState({
    paymentMethod: "cash",
    note: "",
  })
  const [ownerSignature, setOwnerSignature] = useState<string | null>(null)
  const [receiptHTML, setReceiptHTML] = useState<string>("")
  const [receiptNumber] = useState(generateReceiptNumber())
  const [copyMessage, setCopyMessage] = useState("")

  const handlePaymentMethodChange = (value: string) => {
    setFormData({
      ...formData,
      paymentMethod: value,
    })
  }

  const handleNext = () => {
    if (step === "info") {
      setStep("signature")
    } else if (step === "signature") {
      generateReceipt()
    }
  }

  const handleSignatureSave = (signature: string) => {
    setOwnerSignature(signature)
    handleNext()
  }

  const generateReceipt = () => {
    const html = generateReceiptHTML({
      payment: {
        ...payment,
        digitalReceipt: {
          receiptNumber,
          receiptDate: new Date().toISOString(),
          generatedAt: new Date().toISOString(),
          ownerSignature: ownerSignature || undefined,
          paymentMethod: formData.paymentMethod,
          note: formData.note || undefined,
          receiptPDF: "", // Will be set after generation
        },
      },
      tenant,
      room,
      settings,
      ownerSignature: ownerSignature || undefined,
      paymentMethod: formData.paymentMethod,
      note: formData.note,
    })

    setReceiptHTML(html)
    setStep("preview")
  }

  const handleGenerateFinal = () => {
    if (!receiptHTML) return

    const digitalReceipt: Payment["digitalReceipt"] = {
      receiptNumber,
      receiptDate: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      ownerSignature: ownerSignature || undefined,
      paymentMethod: formData.paymentMethod,
      note: formData.note || undefined,
      receiptPDF: receiptHTML,
    }

    onReceiptGenerated(digitalReceipt)
  }

  const handleDownload = () => {
    if (receiptHTML) {
      downloadReceiptAsHTML(receiptHTML, receiptNumber)
    }
  }

  const handleDownloadPDF = () => {
    if (receiptHTML) {
      downloadReceiptAsPDF(receiptHTML, receiptNumber)
    }
  }

  const handlePrint = () => {
    if (receiptHTML) {
      printReceipt(receiptHTML)
    }
  }

  const handleShareWhatsApp = () => {
    if (tenant.phone) {
      const paymentMonth = new Date(payment.month ? `${payment.month}/2000` : Date.now())
        .toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      shareViaWhatsApp(
        tenant.phone,
        receiptNumber,
        tenant.name,
        payment.amount,
        room.number,
        paymentMonth,
      )
    }
  }

  const handleCopyWhatsAppMessage = async () => {
    try {
      const paymentMonth = new Date(payment.month ? `${payment.month}/2000` : Date.now())
        .toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      await copyWhatsAppMessageToClipboard(
        receiptNumber,
        tenant.name,
        payment.amount,
        room.number,
        paymentMonth,
      )
      setCopyMessage("Pesan WhatsApp berhasil disalin!")
      setTimeout(() => setCopyMessage(""), 3000)
    } catch (error) {
      console.error("[v0] Error copying to clipboard:", error)
      setCopyMessage("Gagal menyalin pesan")
      setTimeout(() => setCopyMessage(""), 3000)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Generate Kwitansi Digital</CardTitle>
          <CardDescription>
            Buat kwitansi elektronik resmi dengan tanda tangan pemilik
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={step} onValueChange={(value) => setStep(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" disabled={step === "preview"}>
                Info Pembayaran
              </TabsTrigger>
              <TabsTrigger value="signature" disabled={step === "preview" || step === "info"}>
                Tanda Tangan
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!receiptHTML}>
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Payment Info */}
            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nomor Kwitansi</Label>
                  <Input value={receiptNumber} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Kwitansi</Label>
                  <Input
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Penyewa</Label>
                  <Input value={tenant.name} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Kamar</Label>
                  <Input value={room.number} disabled className="bg-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jumlah Pembayaran</Label>
                  <Input
                    value={`Rp ${payment.amount.toLocaleString("id-ID")}`}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <Select value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
                      <SelectItem value="e_wallet">E-Wallet</SelectItem>
                      <SelectItem value="check">Cek</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Catatan (Opsional)</Label>
                <Textarea
                  id="note"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                {onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Batal
                  </Button>
                )}
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  Lanjut ke Tanda Tangan
                </Button>
              </div>
            </TabsContent>

            {/* Step 2: Signature */}
            <TabsContent value="signature" className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Tanda tangan akan ditampilkan di bagian bawah kwitansi sebagai
                  verifikasi dari pemilik/pengelola kosnya.
                </p>
              </div>

              <SignaturePad
                onSignatureSave={handleSignatureSave}
                label="Tanda Tangan Pemilik/Pengelola"
                description="Gambar tanda tangan Anda di area di bawah. Gunakan mouse atau layar sentuh."
              />

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setStep("info")}
                >
                  Kembali
                </Button>
              </div>
            </TabsContent>

            {/* Step 3: Preview */}
            <TabsContent value="preview" className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>📋 Preview Kwitansi:</strong> Periksa detail kwitansi di bawah. Jika sudah benar,
                  klik "Simpan Kwitansi" untuk menyimpannya ke pembayaran.
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <iframe
                  srcDoc={receiptHTML}
                  className="w-full border-0 rounded"
                  style={{ minHeight: "600px" }}
                  title="Preview Kwitansi"
                />
              </div>

              <div className="space-y-4">
                {/* WhatsApp Share Options */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-3">
                    Bagikan ke WhatsApp Penyewa:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={handleShareWhatsApp}
                      className="border-green-500 text-green-700 hover:bg-green-50"
                    >
                      💬 Buka WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyWhatsAppMessage}
                      className="border-green-500 text-green-700 hover:bg-green-50"
                    >
                      📋 Salin Pesan
                    </Button>
                    {copyMessage && (
                      <span className="text-sm text-green-700 py-2">{copyMessage}</span>
                    )}
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Nomor penyewa: {tenant.phone}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setStep("signature")}
                  >
                    Kembali
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    📥 HTML
                  </Button>
                  <Button variant="outline" onClick={handleDownloadPDF}>
                    📄 PDF
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    🖨️ Cetak
                  </Button>
                  <Button onClick={handleGenerateFinal} className="bg-green-600 hover:bg-green-700">
                    ✓ Simpan Kwitansi
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
