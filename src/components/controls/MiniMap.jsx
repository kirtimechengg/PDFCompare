import { useRef, useEffect, useCallback } from 'react'
import usePDFStore from '../../store/usePDFStore'
import { usePDFRenderer } from '../../hooks/usePDFRenderer'

const MINI_SCALE = 0.08

export default function MiniMap() {
  const { oldPDF, newPDF, currentPage, zoom, panX, panY, setPan } = usePDFStore()
  const canvasRef = useRef(null)
  const { renderPageOffscreen } = usePDFRenderer()

  const draw = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const doc = oldPDF?.doc || newPDF?.doc
    if (!doc) return

    const src = await renderPageOffscreen(doc, Math.min(currentPage, doc.numPages), MINI_SCALE)
    if (!src) return

    canvas.width = src.width
    canvas.height = src.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(src, 0, 0)

    // Draw viewport rect
    const viewW = (window.innerWidth - 260) / zoom * MINI_SCALE
    const viewH = (window.innerHeight - 120) / zoom * MINI_SCALE
    const offsetX = (-panX / zoom) * MINI_SCALE
    const offsetY = (-panY / zoom) * MINI_SCALE
    ctx.strokeStyle = 'rgba(59,130,246,0.9)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(offsetX, offsetY, viewW, viewH)
    ctx.fillStyle = 'rgba(59,130,246,0.1)'
    ctx.fillRect(offsetX, offsetY, viewW, viewH)
  }, [oldPDF, newPDF, currentPage, zoom, panX, panY, renderPageOffscreen])

  useEffect(() => { draw() }, [draw])

  const onClick = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width * canvas.width
    const cy = (e.clientY - rect.top) / rect.height * canvas.height
    const newPanX = -(cx / MINI_SCALE - (window.innerWidth - 260) / 2)
    const newPanY = -(cy / MINI_SCALE - (window.innerHeight - 120) / 2)
    setPan(newPanX, newPanY)
  }, [setPan])

  return (
    <div className="absolute bottom-10 right-4 z-30 rounded overflow-hidden border border-gray-600 shadow-xl" style={{ width: 120 }}>
      <div className="bg-gray-800/80 text-[10px] text-gray-400 px-1.5 py-0.5 text-center">Overview</div>
      <canvas
        ref={canvasRef}
        className="block w-full cursor-crosshair"
        onClick={onClick}
        title="Click to navigate"
      />
    </div>
  )
}
