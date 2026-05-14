import { useRef, useEffect, useState, useCallback } from 'react'
import usePDFStore from '../../../store/usePDFStore'
import { useZoomPan } from '../../../hooks/useZoomPan'
import { usePDFRenderer } from '../../../hooks/usePDFRenderer'
import DrawingCanvas from '../../drawing/DrawingCanvas'

function SwipeHandle({ pct, top }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: pct,
        top,
        transform: 'translate(-50%, -50%)',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.6)',
        border: '2px solid #fff',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'col-resize',
        userSelect: 'none',
        pointerEvents: 'all',
        zIndex: 2,
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 1,
      }}
    >
      ⟺
    </div>
  )
}

export default function SwipeView() {
  const { oldPDF, newPDF, currentPage, zoom, panX, panY, drawingTool } = usePDFStore()
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const { onMouseDown: onPanDown, onMouseMove: onPanMove, onMouseUp: onPanUp } = useZoomPan(containerRef, drawingTool)
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
    if (Math.abs(cx - rx) < 36) {
      draggingLine.current = true
      e.preventDefault()
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

  const revealPct = `${((revealX ?? canvasSize.w / 2) / canvasSize.w) * 100}%`
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
      <div style={{ transform, willChange: 'transform', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
        <DrawingCanvas canvasRef={canvasRef} zoom={zoom} pageNum={currentPage} />

        {/* Overlay: vertical divider line + 3 synced handles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 20,
          }}
        >
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: revealPct,
              transform: 'translateX(-50%)',
              width: '3px',
              height: '100%',
              background: '#fff',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.35), 2px 0 8px rgba(0,0,0,0.45), -2px 0 8px rgba(0,0,0,0.45)',
              zIndex: 1,
              pointerEvents: 'all',
              cursor: 'col-resize',
            }}
          />

          {/* Top handle */}
          <SwipeHandle pct={revealPct} top="10%" />

          {/* Middle handle */}
          <SwipeHandle pct={revealPct} top="50%" />

          {/* Bottom handle */}
          <SwipeHandle pct={revealPct} top="90%" />
        </div>
      </div>
    </div>
  )
}
