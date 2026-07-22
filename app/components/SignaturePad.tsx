"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SignaturePadProps {
  onSignatureSave: (signature: string) => void
  onCancel?: () => void
  label?: string
  description?: string
}

export default function SignaturePad({
  onSignatureSave,
  onCancel,
  label = "Tanda Tangan",
  description = "Ketik atau gambar tanda tangan Anda di area di bawah",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 200

    // Set default styles
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = 2
      ctx.strokeStyle = "#000"
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
      setIsEmpty(false)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.closePath()
      }
    }
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setIsEmpty(true)
    }
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) {
      alert("Mohon gambar tanda tangan terlebih dahulu")
      return
    }

    const signatureData = canvas.toDataURL("image/png")
    onSignatureSave(signatureData)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    e.preventDefault()
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
      setIsEmpty(false)
    }

    e.preventDefault()
  }

  const handleTouchEnd = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.closePath()
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full cursor-crosshair block bg-white"
            style={{ touchAction: "none" }}
          />
        </div>

        <p className="text-xs text-gray-500">
          Anda dapat menggambar tanda tangan menggunakan mouse atau layar sentuh
        </p>

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
          )}
          <Button variant="outline" onClick={handleClear} disabled={isEmpty}>
            Hapus
          </Button>
          <Button onClick={handleSave} disabled={isEmpty} className="bg-blue-600 hover:bg-blue-700">
            Simpan Tanda Tangan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
