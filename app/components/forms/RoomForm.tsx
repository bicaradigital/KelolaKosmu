"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { Room } from "@/app/lib/storage"

interface RoomFormProps {
  room?: Room
  onSubmit: (roomData: Omit<Room, "id" | "createdAt">) => void
  onCancel: () => void
}

export default function RoomForm({ room, onSubmit, onCancel }: RoomFormProps) {
  const [formData, setFormData] = useState({
    number: room?.number || "",
    type: room?.type || "",
    rent: room?.rent || 0,
    status: room?.status || ("available" as const),
    facilities: room?.facilities || [],
  })
  const [newFacility, setNewFacility] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.number || !formData.type || formData.rent <= 0) {
      alert("Mohon lengkapi semua field yang diperlukan")
      return
    }

    onSubmit({
      number: formData.number,
      type: formData.type,
      rent: formData.rent,
      status: formData.status,
      facilities: formData.facilities,
      tenantId: room?.tenantId,
    })
  }

  const addFacility = () => {
    if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, newFacility.trim()],
      })
      setNewFacility("")
    }
  }

  const removeFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((f) => f !== facility),
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{room ? "Edit Kamar" : "Tambah Kamar Baru"}</CardTitle>
        <CardDescription>{room ? "Ubah informasi kamar" : "Masukkan informasi kamar baru"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Nomor Kamar *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="A01, B02, dll"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipe Kamar *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe kamar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rent">Harga Sewa per Bulan (Rp) *</Label>
              <Input
                id="rent"
                type="number"
                value={formData.rent}
                onChange={(e) => setFormData({ ...formData, rent: Number.parseInt(e.target.value) || 0 })}
                placeholder="1500000"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Kamar</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "available" | "occupied" | "maintenance") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="occupied">Terisi</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fasilitas Kamar</Label>
            <div className="flex gap-2">
              <Input
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                placeholder="Tambah fasilitas (AC, WiFi, dll)"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
              />
              <Button type="button" onClick={addFacility} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.facilities.map((facility, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {facility}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFacility(facility)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {room ? "Update Kamar" : "Tambah Kamar"}
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
