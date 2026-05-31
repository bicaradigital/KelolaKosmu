"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Edit2, Save } from "lucide-react"
import type { BoardingHouse } from "@/lib/storage"

interface BoardingHouseSettingsProps {
  boardingHouse: BoardingHouse | null
  onUpdate: (boardingHouse: BoardingHouse) => void
}

export default function BoardingHouseSettings({ boardingHouse, onUpdate }: BoardingHouseSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: boardingHouse?.name || "",
    address: boardingHouse?.address || "",
    phone: boardingHouse?.phone || "",
    email: boardingHouse?.email || "",
    imageData: boardingHouse?.imageData || "",
    imageFileName: boardingHouse?.imageFileName || "",
  })
  const [previewImage, setPreviewImage] = useState<string>(boardingHouse?.imageData || "")
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

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Nama kos harus diisi")
      return
    }

    const updatedBoardingHouse: BoardingHouse = {
      id: boardingHouse?.id || `kos-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      imageData: formData.imageData,
      imageFileName: formData.imageFileName,
      createdAt: boardingHouse?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onUpdate(updatedBoardingHouse)
    setIsEditing(false)
  }

  if (!boardingHouse && !isEditing) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-7">
        <div>
          <CardTitle>Informasi Boarding House</CardTitle>
          <CardDescription>Kelola data dan foto boarding house Anda</CardDescription>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Boarding House / Kos *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Boarding House</label>

              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border-2 border-blue-300"
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
                  className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition"
                >
                  <Upload className="w-6 h-6 text-blue-500 mx-auto mb-2" />
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: boardingHouse?.name || "",
                    address: boardingHouse?.address || "",
                    phone: boardingHouse?.phone || "",
                    email: boardingHouse?.email || "",
                    imageData: boardingHouse?.imageData || "",
                    imageFileName: boardingHouse?.imageFileName || "",
                  })
                  setPreviewImage(boardingHouse?.imageData || "")
                }}
              >
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </Button>
            </div>
          </div>
        ) : (
          // Display Mode
          <div className="space-y-4">
            {previewImage && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img src={previewImage} alt={formData.name} className="w-full h-40 object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Nama</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{formData.name}</p>
              </div>

              {formData.phone && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Telepon</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{formData.phone}</p>
                </div>
              )}

              {formData.email && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{formData.email}</p>
                </div>
              )}

              {formData.address && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Alamat</p>
                  <p className="text-gray-700 mt-1 leading-relaxed">{formData.address}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
