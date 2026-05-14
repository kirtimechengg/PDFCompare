import { useRef, useState, useCallback, useEffect } from 'react'
import usePDFStore from '../../../store/usePDFStore'
import PDFCanvas from '../shared/PDFCanvas'
import { useZoomPan } from '../../../hooks/useZoomPan'

export default function SideBySideView() {
  const { oldPDF, newPDF, currentPage, zoom, panX, panY } = usePDFStore()
  const [splitPct, setSplitPct] = useState(50)
  const containerRef = useRef(null)
  const draggingDivider = useRef(false)
  const { onMouseDown, onMouseMove, onMouseUp } = useZoomPan(containerRef)

  const onDividerMouseDown = useCallback((e) => {
    e.stopPropagation()
    draggingDivider.current = true
  }, [])

  const onMouseMoveGlobal = useCallback((e) => {
    if (!draggingDivider.current) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.max(15, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100))
    setSplitPct(pct)
  }, [])

  const onMouseUpGlobal = useCallback(() => { draggingDivider.current = false }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMoveGlobal)
    window.addEventListener('mouseup', onMouseUpGlobal)
    return () => {
      window.removeEventListener('mousemove', onMouseMoveGlobal)
      window.removeEventListener('mouseup', onMouseUpGlobal)
    }
  }, [onMouseMoveGlobal, onMouseUpGlobal])

  const transform = `translate(${panX}px, ${panY}px)`

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden flex canvas-grab relative select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Old revision pane */}
      <div className="relative overflow-hidden flex items-center justify-center" style={{ width: `${splitPct}%` }}>
        <div className="absolute top-2 left-2 z-10 bg-red-600/80 text-white text-xs px-2 py-0.5 rounded pointer-events-none">
          Old Rev
        </div>
        <div style={{ transform, willChange: 'transform' }}>
          {oldPDF && <PDFCanvas doc={oldPDF.doc} pageNum={Math.min(currentPage, oldPDF.pageCount)} scale={zoom} />}
        </div>
      </div>

      {/* Draggable divider */}
      <div
        className="relative z-20 flex-shrink-0 cursor-col-resize group"
        style={{ width: 4, background: '#444' }}
        onMouseDown={onDividerMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/30 transition" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-gray-500 group-hover:bg-blue-400 rounded-sm transition flex items-center justify-center">
          <span className="text-[8px] text-white leading-none">⋮⋮</span>
        </div>
      </div>

      {/* New revision pane */}
      <div className="relative overflow-hidden flex items-center justify-center flex-1">
        <div className="absolute top-2 left-2 z-10 bg-blue-600/80 text-white text-xs px-2 py-0.5 rounded pointer-events-none">
          New Rev
        </div>
        <div style={{ transform, willChange: 'transform' }}>
          {newPDF && <PDFCanvas doc={newPDF.doc} pageNum={Math.min(currentPage, newPDF.pageCount)} scale={zoom} />}
        </div>
      </div>
    </div>
  )
}
