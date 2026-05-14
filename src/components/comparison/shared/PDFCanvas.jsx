import { useRef, useEffect, useState } from 'react'
import { usePDFRenderer } from '../../../hooks/usePDFRenderer'

export default function PDFCanvas({ doc, pageNum, scale, style, className, canvasRef: externalRef, children }) {
  const internalRef = useRef(null)
  const canvasRef = externalRef ?? internalRef
  const { renderPage } = usePDFRenderer()
  const [rendering, setRendering] = useState(false)

  useEffect(() => {
    if (!doc || !canvasRef.current) return
    let cancelled = false
    setRendering(true)
    renderPage(doc, pageNum, scale, canvasRef.current).then(() => {
      if (!cancelled) setRendering(false)
    }).catch(() => {
      if (!cancelled) setRendering(false)
    })
    return () => { cancelled = true }
  }, [doc, pageNum, scale, renderPage])

  return (
    <div className={`relative inline-block ${className ?? ''}`} style={style}>
      <canvas ref={canvasRef} />
      {rendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      {children}
    </div>
  )
}
