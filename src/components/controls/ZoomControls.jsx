import { useCallback } from 'react'
import usePDFStore from '../../store/usePDFStore'

export default function ZoomControls({ canvasRef }) {
  const { zoom, setZoom, resetView, oldPDF, newPDF, currentPage } = usePDFStore()

  const fitToWidth = useCallback(async () => {
    const doc = oldPDF?.doc || newPDF?.doc
    if (!doc || !canvasRef?.current) return
    const page = await doc.getPage(Math.min(currentPage, doc.numPages))
    const vp = page.getViewport({ scale: 1 })
    const containerW = canvasRef.current.clientWidth || window.innerWidth - 300
    setZoom(containerW / vp.width * 0.95)
  }, [oldPDF, newPDF, currentPage, setZoom, canvasRef])

  const fitToPage = useCallback(async () => {
    const doc = oldPDF?.doc || newPDF?.doc
    if (!doc || !canvasRef?.current) return
    const page = await doc.getPage(Math.min(currentPage, doc.numPages))
    const vp = page.getViewport({ scale: 1 })
    const containerW = canvasRef.current.clientWidth || window.innerWidth - 300
    const containerH = canvasRef.current.clientHeight || window.innerHeight - 120
    setZoom(Math.min(containerW / vp.width, containerH / vp.height) * 0.95)
  }, [oldPDF, newPDF, currentPage, setZoom, canvasRef])

  return (
    <div className="flex items-center gap-1 text-sm">
      <button onClick={() => setZoom(zoom / 1.2)} className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center" title="Zoom out (Ctrl–)">−</button>
      <button onClick={() => setZoom(zoom * 1.2)} className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center" title="Zoom in (Ctrl+)">+</button>
      <span className="w-12 text-center tabular-nums text-gray-400">{Math.round(zoom * 100)}%</span>
      <div className="w-px h-4 bg-gray-600 mx-1" />
      <button onClick={fitToWidth} className="px-2 py-1 rounded hover:bg-white/10 text-xs" title="Fit to width">W</button>
      <button onClick={fitToPage} className="px-2 py-1 rounded hover:bg-white/10 text-xs" title="Fit to page">P</button>
      <button onClick={() => setZoom(1)} className="px-2 py-1 rounded hover:bg-white/10 text-xs" title="Actual size (100%)">100%</button>
      <button onClick={resetView} className="px-2 py-1 rounded hover:bg-white/10 text-xs" title="Reset view (Ctrl+0)">⌂</button>
    </div>
  )
}
