import { useState } from 'react'
import usePDFStore from '../../store/usePDFStore'
import { exportAnnotatedPDF } from '../../utils/exportAnnotatedPDF'

export default function ExportButton({ canvasRef }) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { oldPDF, newPDF, annotations } = usePDFStore()

  const exportPNG = async () => {
    setOpen(false)
    const canvas = canvasRef?.current?.querySelector('canvas')
    if (!canvas) return
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pdf-compare-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const exportJPG = async () => {
    setOpen(false)
    const canvas = canvasRef?.current?.querySelector('canvas')
    if (!canvas) return
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pdf-compare-${Date.now()}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/jpeg', 0.92)
  }

  const print = () => {
    setOpen(false)
    window.print()
  }

  const saveAnnotatedPDF = async () => {
    setOpen(false)
    if (!newPDF?.file || !newPDF?.doc) return
    setExporting(true)
    try {
      const bytes = await exportAnnotatedPDF(newPDF.file, annotations, newPDF.doc)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = newPDF.file.name.replace(/\.pdf$/i, '-annotated.pdf')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF annotation export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={exporting}
        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition disabled:opacity-60"
      >
        {exporting ? 'Saving…' : 'Export ▾'}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 py-1 min-w-44">
          <button onClick={exportPNG} className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm">Save as PNG</button>
          <button onClick={exportJPG} className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm">Save as JPG</button>
          <div className="h-px bg-gray-700 my-1" />
          <button onClick={print} className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm">Print…</button>
          <div className="h-px bg-gray-700 my-1" />
          <button
            onClick={saveAnnotatedPDF}
            disabled={!newPDF?.file}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Annotated PDF (New)
          </button>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}
