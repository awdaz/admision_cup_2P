import { useState } from 'react'
import * as XLSX from 'xlsx'
import JsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(JsPDF)

function extractValue (row, col, idx) {
  if (col.render) {
    const v = col.render(row, idx)
    if (typeof v === 'string' || typeof v === 'number') return v
    return ''
  }
  const key = col.accessor || col.key
  if (!key) return ''
  const parts = key.split('.')
  let val = row
  for (const p of parts) {
    if (val == null) return ''
    val = val[p]
  }
  return val ?? ''
}

function extractRows (columns, data) {
  if (!data || data.length === 0) return []
  return data.map((row, i) => columns.map(col => extractValue(row, col, i)))
}

export function exportPDF ({ columns, data, title = 'Reporte', fileName = 'reporte.pdf', landscape = false }) {
  const doc = new JsPDF(landscape ? 'l' : 'p', 'pt')
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(16)
  doc.text(title, pageWidth / 2, 30, { align: 'center' })
  doc.setFontSize(9)
  doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, 44, { align: 'center' })

  const headers = columns.map(c => c.label || c.key || '')
  const body = extractRows(columns, data)

  doc.autoTable({
    head: [headers],
    body,
    startY: 52,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 110, 253] }
  })

  doc.save(fileName)
}

export function exportExcel ({ columns, data, title = 'Reporte', fileName = 'reporte.xlsx' }) {
  const headers = columns.map(c => c.label || c.key || '')
  const body = extractRows(columns, data)
  const wsData = [headers, ...body]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
  XLSX.writeFile(wb, fileName)
}

export default function ExportButtons ({ columns, data, title = 'Reporte', pdfFileName, excelFileName, className = '', fetchAll }) {
  const [exporting, setExporting] = useState(false)
  const baseName = title.toLowerCase().replace(/\s+/g, '-')

  const handleExport = async (type) => {
    let allData = data
    if (fetchAll) {
      setExporting(true)
      try {
        allData = await fetchAll()
      } finally {
        setExporting(false)
      }
    }
    if (type === 'excel') {
      exportExcel({ columns, data: allData, title, fileName: excelFileName || `${baseName}.xlsx` })
    } else {
      exportPDF({ columns, data: allData, title, fileName: pdfFileName || `${baseName}.pdf` })
    }
  }

  return (
    <div className={`btn-group btn-group-sm ${className}`}>
      <button
        className='btn btn-outline-success'
        onClick={() => handleExport('excel')}
        disabled={!data || data.length === 0 || exporting}
      >
        {exporting ? <span className='spinner-border spinner-border-sm me-1' /> : <i className='bi bi-file-earmark-excel me-1' />}Excel
      </button>
      <button
        className='btn btn-outline-danger'
        onClick={() => handleExport('pdf')}
        disabled={!data || data.length === 0 || exporting}
      >
        {exporting ? <span className='spinner-border spinner-border-sm me-1' /> : <i className='bi bi-file-earmark-pdf me-1' />}PDF
      </button>
    </div>
  )
}
