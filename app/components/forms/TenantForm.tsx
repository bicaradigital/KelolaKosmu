"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Tenant, Room } from "@/app/lib/storage"

interface TenantFormProps {
  tenant?: Tenant
  availableRooms: Room[]
  onSubmit: (tenantData: Omit<Tenant, "id" | "createdAt">) => void
  onCancel: () => void
}

export default function TenantForm({ tenant, availableRooms, onSubmit, onCancel }: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: tenant?.name || "",
    phone: tenant?.phone || "",
    email: tenant?.email || "",
    idNumber: tenant?.idNumber || "",
    roomId: tenant?.roomId || "",
    checkInDate: tenant?.checkInDate || new Date().toISOString().split("T")[0],
    emergencyContact: {
      name: tenant?.emergencyContact?.name || "",
      phone: tenant?.emergencyContact?.phone || "",
      relation: tenant?.emergencyContact?.relation || "",
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.idNumber) {
      alert("Mohon lengkapi semua field yang diperlukan")
      return
    }

    onSubmit(formData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{tenant ? "Edit Penghuni" : "Tambah Penghuni Baru"}</CardTitle>
        <CardDescription>{tenant ? "Ubah informasi penghuni" : "Masukkan informasi penghuni baru"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama lengkap penghuni"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08123456789"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">Nomor KTP *</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="1234567890123456"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Kamar</Label>
              <Select value={formData.roomId} onValueChange={(value) => setFormData({ ...formData, roomId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kamar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Belum ada kamar</SelectItem>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Kamar {room.number} - {room.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkInDate">Tanggal Masuk</Label>
              <Input
                id="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Kontak Darurat</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Nama</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                    })
                  }
                  placeholder="Nama kontak darurat"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Telepon</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                    })
                  }
                  placeholder="08123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Hubungan</Label>
                <Select
                  value={formData.emergencyContact.relation}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relation: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hubungan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                    <SelectItem value="Saudara">Saudara</SelectItem>
                    <SelectItem value="Teman">Teman</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {tenant ? "Update Penghuni" : "Tambah Penghuni"}
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
