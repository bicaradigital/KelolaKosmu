"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Building2, Upload, X } from "lucide-react"
import { setSetupCompleted } from "@/app/lib/setupStorage"
import type { BoardingHouse } from "@/lib/storage"

interface SetupWizardProps {
  isOpen: boolean
  onComplete: (boardingHouse: BoardingHouse) => void
}

export default function SetupWizard({ isOpen, onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    imageData: "",
    imageFileName: "",
  })
  const [previewImage, setPreviewImage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Hanya JPG dan PNG yang didukung")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setPreviewImage(imageData)
        setFormData((prev) => ({
          ...prev,
          imageData,
          imageFileName: file.name,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage("")
    setFormData((prev) => ({
      ...prev,
      imageData: "",
      imageFileName: "",
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      alert("Nama kos harus diisi")
      return
    }
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    if (!formData.name.trim()) {
      alert("Nama kos harus diisi")
      return
    }

    const boardingHouse: BoardingHouse = {
      id: `kos-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      imageData: formData.imageData,
      imageFileName: formData.imageFileName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Mark setup as completed
    setSetupCompleted()

    onComplete(boardingHouse)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl border-0">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-block p-4 bg-blue-100 rounded-lg mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang!</h2>
                <p className="text-gray-600">Mari kita siapkan data boarding house Anda</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Boarding House / Kos *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Griya Carmel, Kost Nyaman, dll"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Jalan, Nomor, Kelurahan, Kecamatan..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+62..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="info@kos.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" disabled>
                  Kembali
                </Button>
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  Lanjut
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-block p-4 bg-blue-100 rounded-lg mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Foto Kos</h2>
                <p className="text-gray-600">Tambahkan foto atau logo boarding house Anda</p>
              </div>

              <div className="space-y-4">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-blue-300"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition"
                  >
                    <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Klik untuk upload foto</p>
                    <p className="text-xs text-gray-500 mt-1">JPG atau PNG, maksimal 5MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Info:</span> Foto akan ditampilkan di header aplikasi. Gunakan foto
                    yang jelas dan menarik.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Kembali
                </Button>
                <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700">
                  Selesai
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-2">
            <div className={`h-2 w-8 rounded-full transition ${step === 1 ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className={`h-2 w-8 rounded-full transition ${step === 2 ? "bg-blue-600" : "bg-gray-300"}`} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
