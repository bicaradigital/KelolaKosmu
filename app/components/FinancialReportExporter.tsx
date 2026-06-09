'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Download, FileText, Sheet } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'
import { exportToCSV, exportToPDF, type FinancialRecord } from '@/app/lib/reportExporter'

interface FinancialReportExporterProps {
  records: FinancialRecord[]
  kosName: string
}

export default function FinancialReportExporter({ records, kosName }: FinancialReportExporterProps) {
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)

  // Filter records by date range
  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.date)
    return recordDate >= new Date(startDate) && recordDate <= new Date(endDate)
  })

  // Calculate summary
  const totalIncome = filteredRecords
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)

  const totalExpense = filteredRecords
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)

  const netIncome = totalIncome - totalExpense

  // Calculate income and expense by category
  const incomeByCategory = new Map<string, number>()
  const expenseByCategory = new Map<string, number>()

  filteredRecords.forEach((record) => {
    if (record.type === 'income') {
      incomeByCategory.set(record.category, (incomeByCategory.get(record.category) || 0) + record.amount)
    } else {
      expenseByCategory.set(record.category, (expenseByCategory.get(record.category) || 0) + record.amount)
    }
  })

  const handleExportCSV = async () => {
    try {
      setExporting('csv')
      const filename = `Laporan-Keuangan-${format(new Date(startDate), 'dd-MM-yyyy')}_${format(new Date(endDate), 'dd-MM-yyyy')}.csv`
      exportToCSV(filteredRecords, kosName, startDate, endDate, filename)
    } catch (error) {
      console.error('[v0] Error exporting CSV:', error)
    } finally {
      setExporting(null)
    }
  }

  const handleExportPDF = async () => {
    try {
      setExporting('pdf')
      const filename = `Laporan-Keuangan-${format(new Date(startDate), 'dd-MM-yyyy')}_${format(new Date(endDate), 'dd-MM-yyyy')}.pdf`
      exportToPDF(filteredRecords, kosName, startDate, endDate, filename)
    } catch (error) {
      console.error('[v0] Error exporting PDF:', error)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Laporan Keuangan
          </CardTitle>
          <CardDescription>
            Pilih periode tanggal dan format untuk mengunduh laporan keuangan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Tanggal Mulai</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Tanggal Akhir</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">Total Pemasukan</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalIncome)}
              </p>
              <p className="text-xs text-green-600 mt-1">{filteredRecords.filter((r) => r.type === 'income').length} transaksi</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalExpense)}
              </p>
              <p className="text-xs text-red-600 mt-1">{filteredRecords.filter((r) => r.type === 'expense').length} transaksi</p>
            </div>

            <div className={`border rounded-lg p-4 ${netIncome >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <p className={`text-sm font-medium ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {netIncome >= 0 ? 'Saldo Surplus' : 'Saldo Defisit'}
              </p>
              <p className={`text-2xl font-bold mt-1 ${netIncome >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(netIncome)}
              </p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0 || exporting !== null}
              variant="outline"
              className="flex-1"
            >
              <Sheet className="w-4 h-4 mr-2" />
              {exporting === 'csv' ? 'Mengexport...' : 'Export CSV'}
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={filteredRecords.length === 0 || exporting !== null}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              {exporting === 'pdf' ? 'Mengexport...' : 'Export PDF'}
            </Button>
          </div>

          {filteredRecords.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-700" />
              <p className="text-sm text-yellow-700">Tidak ada data untuk periode yang dipilih</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income by Category */}
          {incomeByCategory.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Pemasukan per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(incomeByCategory.entries()).map(([category, amount]) => (
                    <div key={`income-${category}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{category}</p>
                        <p className="text-xs text-gray-600">
                          {filteredRecords.filter((r) => r.type === 'income' && r.category === category).length} transaksi
                        </p>
                      </div>
                      <p className="font-semibold text-green-700">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expense by Category */}
          {expenseByCategory.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Pengeluaran per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(expenseByCategory.entries()).map(([category, amount]) => (
                    <div key={`expense-${category}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{category}</p>
                        <p className="text-xs text-gray-600">
                          {filteredRecords.filter((r) => r.type === 'expense' && r.category === category).length} transaksi
                        </p>
                      </div>
                      <p className="font-semibold text-red-700">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
