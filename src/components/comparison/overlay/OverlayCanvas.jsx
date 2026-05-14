import { useRef, useEffect, useCallback, useState } from 'react'
import usePDFStore from '../../../store/usePDFStore'
import { usePDFRenderer } from '../../../hooks/usePDFRenderer'
import { useZoomPan } from '../../../hooks/useZoomPan'

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

async function renderTinted(doc, pageNum, scale, color, opacity) {
  if (!doc) return null
  const page = await doc.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  const src = document.createElement('canvas')
  src.width = viewport.width
  src.height = viewport.height
  const ctx = src.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise

  // Apply color tint on top of rendered content
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = hexToRgba(color, opacity)
  ctx.fillRect(0, 0, src.width, src.height)
  ctx.globalCompositeOperation = 'source-over'
  return src
}

export default function OverlayCanvas() {
  const {
    oldPDF, newPDF, currentPage, zoom,
    oldColor, newColor, oldOpacity, newOpacity,
    blendMode, showOld, showNew,
    alignOffsetX, alignOffsetY, alignRotation,
    panX, panY,
  } = usePDFStore()

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const { onMouseDown, onMouseMove, onMouseUp } = useZoomPan(containerRef)
  const [rendering, setRendering] = useState(false)
  const renderIdRef = useRef(0)

  const draw = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const id = ++renderIdRef.current
    setRendering(true)

    try {
      const scale = zoom * (window.devicePixelRatio || 1)
      const [oldCanvas, newCanvas] = await Promise.all([
        showOld && oldPDF?.doc ? renderTinted(oldPDF.doc, currentPage, zoom, oldColor, oldOpacity) : null,
        showNew && newPDF?.doc ? renderTinted(newPDF.doc, currentPage, zoom, newColor, newOpacity) : null,
      ])

      if (id !== renderIdRef.current) return

      const w = oldCanvas?.width || newCanvas?.width || 800
      const h = oldCanvas?.height || newCanvas?.height || 600
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, w, h)

      if (oldCanvas && showOld) {
        ctx.save()
        ctx.translate(alignOffsetX, alignOffsetY)
        if (alignRotation !== 0) {
          ctx.translate(w / 2, h / 2)
          ctx.rotate((alignRotation * Math.PI) / 180)
          ctx.translate(-w / 2, -h / 2)
        }
        ctx.drawImage(oldCanvas, 0, 0)
        ctx.restore()
      }

      if (newCanvas && showNew) {
        ctx.save()
        ctx.globalCompositeOperation = blendMode
        ctx.drawImage(newCanvas, 0, 0)
        ctx.restore()
        ctx.globalCompositeOperation = 'source-over'
      }
    } finally {
      if (id === renderIdRef.current) setRendering(false)
    }
  }, [
    oldPDF, newPDF, currentPage, zoom,
    oldColor, newColor, oldOpacity, newOpacity,
    blendMode, showOld, showNew,
    alignOffsetX, alignOffsetY, alignRotation,
  ])

  useEffect(() => { draw() }, [draw])

  const transform = `translate(${panX}px, ${panY}px)`

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden flex items-center justify-center canvas-grab relative"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{ transform, willChange: 'transform' }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', imageRendering: 'pixelated' }}
        />
      </div>
      {rendering && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-400 bg-black/40 px-3 py-1.5 rounded-full">
          <div className="w-3 h-3 border border-gray-400 border-t-white rounded-full animate-spin" />
          Rendering…
        </div>
      )}
    </div>
  )
}
