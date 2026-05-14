import { useState, useCallback } from 'react'
import usePDFStore from '../../store/usePDFStore'

export default function StatusBar() {
  const { currentPage, oldPDF, newPDF, zoom, mode } = usePDFStore()
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  const maxPage = Math.max(oldPDF?.pageCount ?? 1, newPDF?.pageCount ?? 1)

  const onMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({ x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) })
  }, [])

  return (
    <footer
      className="flex items-center gap-4 px-4 py-1 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] text-xs text-gray-500 flex-shrink-0"
      onMouseMove={onMouseMove}
    >
      <span>Page {currentPage} / {maxPage}</span>
      <span>Zoom {Math.round(zoom * 100)}%</span>
      <span className="capitalize">Mode: {mode}</span>
      <div className="flex-1" />
      <span className="font-mono">{coords.x}, {coords.y}</span>
    </footer>
  )
}
