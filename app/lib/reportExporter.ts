import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface FinancialRecord {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  paymentMethod?: string
}

export interface GroupedFinancialData {
  income: {
    [category: string]: FinancialRecord[]
  }
  expense: {
    [category: string]: FinancialRecord[]
  }
}

export interface CategorySummary {
  category: string
  total: number
  count: number
  records: FinancialRecord[]
}

// Group records by type and category
export const groupRecordsByCategory = (records: FinancialRecord[]): GroupedFinancialData => {
  const grouped: GroupedFinancialData = {
    income: {},
    expense: {},
  }

  records.forEach((record) => {
    const type = record.type
    if (!grouped[type][record.category]) {
      grouped[type][record.category] = []
    }
    grouped[type][record.category].push(record)
  })

  return grouped
}

// Calculate totals for each category
export const calculateCategoryTotals = (grouped: GroupedFinancialData) => {
  const incomeByCategory: CategorySummary[] = []
  const expenseByCategory: CategorySummary[] = []

  Object.entries(grouped.income).forEach(([category, records]) => {
    incomeByCategory.push({
      category,
      total: records.reduce((sum, r) => sum + r.amount, 0),
      count: records.length,
      records,
    })
  })

  Object.entries(grouped.expense).forEach(([category, records]) => {
    expenseByCategory.push({
      category,
      total: records.reduce((sum, r) => sum + r.amount, 0),
      count: records.length,
      records,
    })
  })

  return { incomeByCategory, expenseByCategory }
}

// Format currency to Indonesian format
export const formatCurrencyID = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Generate CSV content
export const generateCSV = (records: FinancialRecord[], kosName: string, startDate: string, endDate: string): string => {
  const grouped = groupRecordsByCategory(records)
  const { incomeByCategory, expenseByCategory } = calculateCategoryTotals(grouped)

  let csv = ''

  // Header
  csv += `Laporan Keuangan - ${kosName}\n`
  csv += `Periode: ${format(new Date(startDate), 'dd MMMM yyyy', { locale: id })} - ${format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}\n\n`

  // Income Section
  csv += `PEMASUKAN\n`
  csv += `Kategori,Jumlah,Jumlah Transaksi,Rincian\n`

  incomeByCategory.forEach((cat) => {
    const detailItems = cat.records.map((r) => `${format(new Date(r.date), 'dd/MM/yyyy')} - ${r.description}: ${formatCurrencyID(r.amount)}`).join('; ')
    csv += `"${cat.category}",${cat.total},${cat.count},"${detailItems}"\n`
  })

  const totalIncome = incomeByCategory.reduce((sum, cat) => sum + cat.total, 0)
  csv += `\nTotal Pemasukan,${totalIncome},,\n\n`

  // Expense Section
  csv += `PENGELUARAN\n`
  csv += `Kategori,Jumlah,Jumlah Transaksi,Rincian\n`

  expenseByCategory.forEach((cat) => {
    const detailItems = cat.records.map((r) => `${format(new Date(r.date), 'dd/MM/yyyy')} - ${r.description}: ${formatCurrencyID(r.amount)}`).join('; ')
    csv += `"${cat.category}",${cat.total},${cat.count},"${detailItems}"\n`
  })

  const totalExpense = expenseByCategory.reduce((sum, cat) => sum + cat.total, 0)
  csv += `\nTotal Pengeluaran,${totalExpense},,\n\n`

  // Net Income/Loss
  const netIncome = totalIncome - totalExpense
  csv += `SALDO BERSIH,${netIncome},,\n`

  return csv
}

// Generate PDF content
export const generatePDF = (records: FinancialRecord[], kosName: string, startDate: string, endDate: string): jsPDF => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 15

  // Header
  doc.setFontSize(14)
  doc.text('LAPORAN KEUANGAN', pageWidth / 2, yPos, { align: 'center' })
  yPos += 7

  doc.setFontSize(12)
  doc.text(kosName, pageWidth / 2, yPos, { align: 'center' })
  yPos += 7

  doc.setFontSize(10)
  const dateRange = `Periode: ${format(new Date(startDate), 'dd MMMM yyyy', { locale: id })} - ${format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}`
  doc.text(dateRange, pageWidth / 2, yPos, { align: 'center' })
  yPos += 12

  const grouped = groupRecordsByCategory(records)
  const { incomeByCategory, expenseByCategory } = calculateCategoryTotals(grouped)

  // Income Table
  doc.setFontSize(11)
  doc.text('PEMASUKAN', 15, yPos)
  yPos += 8

  const incomeTableData = incomeByCategory.map((cat) => [
    cat.category,
    `${cat.count}`,
    formatCurrencyID(cat.total),
  ])

  if (incomeTableData.length > 0) {
    autoTable(doc, {
      head: [['Kategori', 'Transaksi', 'Jumlah']],
      body: incomeTableData,
      startY: yPos,
      margin: 15,
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      bodyStyles: { textColor: 0 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    })
    yPos = (doc as any).lastAutoTable.finalY + 5
  }

  const totalIncome = incomeByCategory.reduce((sum, cat) => sum + cat.total, 0)
  doc.setFont(undefined, 'bold')
  doc.text(`Total Pemasukan: ${formatCurrencyID(totalIncome)}`, 15, yPos)
  yPos += 10

  // Expense Table
  doc.setFont(undefined, 'normal')
  doc.setFontSize(11)
  doc.text('PENGELUARAN', 15, yPos)
  yPos += 8

  const expenseTableData = expenseByCategory.map((cat) => [
    cat.category,
    `${cat.count}`,
    formatCurrencyID(cat.total),
  ])

  if (expenseTableData.length > 0) {
    autoTable(doc, {
      head: [['Kategori', 'Transaksi', 'Jumlah']],
      body: expenseTableData,
      startY: yPos,
      margin: 15,
      headStyles: { fillColor: [220, 53, 69], textColor: 255 },
      bodyStyles: { textColor: 0 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    })
    yPos = (doc as any).lastAutoTable.finalY + 5
  }

  const totalExpense = expenseByCategory.reduce((sum, cat) => sum + cat.total, 0)
  doc.setFont(undefined, 'bold')
  doc.text(`Total Pengeluaran: ${formatCurrencyID(totalExpense)}`, 15, yPos)
  yPos += 10

  // Summary
  doc.setFontSize(11)
  doc.setFillColor(240, 240, 240)
  doc.rect(15, yPos - 2, pageWidth - 30, 12, 'F')

  const netIncome = totalIncome - totalExpense
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  const netLabel = netIncome >= 0 ? 'SALDO SURPLUS' : 'SALDO DEFISIT'
  if (netIncome >= 0) {
    doc.setTextColor(40, 167, 69)
  } else {
    doc.setTextColor(220, 53, 69)
  }
  doc.text(`${netLabel}: ${formatCurrencyID(netIncome)}`, pageWidth / 2, yPos + 7, { align: 'center' })

  // Footer
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)
  const footerY = pageHeight - 10
  doc.text(`Dibuat: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 15, footerY)

  return doc
}

// Export records to CSV file
export const exportToCSV = (records: FinancialRecord[], kosName: string, startDate: string, endDate: string, filename: string) => {
  const csv = generateCSV(records, kosName, startDate, endDate)
  const element = document.createElement('a')
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`)
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

// Export records to PDF file
export const exportToPDF = (records: FinancialRecord[], kosName: string, startDate: string, endDate: string, filename: string) => {
  const doc = generatePDF(records, kosName, startDate, endDate)
  doc.save(filename)
}
