import { useRef, useEffect, useState, useCallback } from 'react'
import usePDFStore from '../../../store/usePDFStore'
import { useZoomPan } from '../../../hooks/useZoomPan'
import { usePDFRenderer } from '../../../hooks/usePDFRenderer'

export default function SwipeView() {
  const { oldPDF, newPDF, currentPage, zoom, panX, panY } = usePDFStore()
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const { onMouseDown: onPanDown, onMouseMove: onPanMove, onMouseUp: onPanUp } = useZoomPan(containerRef)
  const { renderPageOffscreen } = usePDFRenderer()
  const [revealX, setRevealX] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })
  const draggingLine = useRef(false)

  const draw = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !oldPDF?.doc || !newPDF?.doc) return
    const [oldSrc, newSrc] = await Promise.all([
      renderPageOffscreen(oldPDF.doc, Math.min(currentPage, oldPDF.pageCount), zoom),
      renderPageOffscreen(newPDF.doc, Math.min(currentPage, newPDF.pageCount), zoom),
    ])
    if (!oldSrc || !newSrc) return
    const w = Math.max(oldSrc.width, newSrc.width)
    const h = Math.max(oldSrc.height, newSrc.height)
    canvas.width = w
    canvas.height = h
    setCanvasSize({ w, h })
    const ctx = canvas.getContext('2d')
    const rx = revealX ?? w / 2

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(oldSrc, 0, 0)

    ctx.save()
    ctx.beginPath()
    ctx.rect(rx, 0, w - rx, h)
    ctx.clip()
    ctx.drawImage(newSrc, 0, 0)
    ctx.restore()

    // Divider line
    ctx.beginPath()
    ctx.moveTo(rx, 0)
    ctx.lineTo(rx, h)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Handle knob
    const ky = h / 2
    ctx.beginPath()
    ctx.arc(rx, ky, 14, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⟺', rx, ky)
  }, [oldPDF, newPDF, currentPage, zoom, revealX, renderPageOffscreen])

  useEffect(() => { draw() }, [draw])

  const getCanvasX = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return ((e.clientX - rect.left) / rect.width) * canvasSize.w
  }, [canvasSize.w])

  const onMouseDown = useCallback((e) => {
    const rx = revealX ?? canvasSize.w / 2
    const cx = getCanvasX(e)
    if (Math.abs(cx - rx) < 30) {
      draggingLine.current = true
    } else {
      onPanDown(e)
    }
  }, [revealX, canvasSize.w, getCanvasX, onPanDown])

  const onMouseMove = useCallback((e) => {
    if (draggingLine.current) {
      setRevealX(Math.max(0, Math.min(canvasSize.w, getCanvasX(e))))
    } else {
      onPanMove(e)
    }
  }, [canvasSize.w, getCanvasX, onPanMove])

  const onMouseUp = useCallback((e) => {
    draggingLine.current = false
    onPanUp(e)
  }, [onPanUp])

  const transform = `translate(${panX}px, ${panY}px)`

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden flex items-center justify-center canvas-grab"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{ transform, willChange: 'transform' }}>
        <canvas ref={canvasRef} style={{ display: 'block', cursor: 'col-resize' }} />
      </div>
    </div>
  )
}
