import { useRef, useEffect } from 'react'
import usePDFStore from '../../../store/usePDFStore'
import PDFCanvas from '../shared/PDFCanvas'

export default function ContinuousView() {
  const { oldPDF, newPDF, zoom, currentPage, setCurrentPage } = usePDFStore()
  const containerRef = useRef(null)
  const pageRowRefs = useRef([])
  const programmaticRef = useRef(false)
  const lastPageRef = useRef(currentPage)

  const maxPages = Math.max(oldPDF?.pageCount ?? 0, newPDF?.pageCount ?? 0)

  // Ctrl+wheel to zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      const { zoom: z, setZoom } = usePDFStore.getState()
      setZoom(z * (e.deltaY > 0 ? 1 / 1.1 : 1.1))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // Scroll to page when currentPage changes from external source (PageNavigation)
  useEffect(() => {
    if (currentPage === lastPageRef.current) return
    const el = pageRowRefs.current[currentPage - 1]
    if (!el) return
    programmaticRef.current = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const timer = setTimeout(() => { programmaticRef.current = false }, 900)
    return () => clearTimeout(timer)
  }, [currentPage])

  // IntersectionObserver: update currentPage as user scrolls
  useEffect(() => {
    if (!containerRef.current || maxPages === 0) return
    const visible = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const idx = parseInt(entry.target.dataset.pageIdx)
          if (entry.isIntersecting) visible.add(idx)
          else visible.delete(idx)
        })
        if (programmaticRef.current || visible.size === 0) return
        const page = Math.min(...visible) + 1
        if (page !== lastPageRef.current) {
          lastPageRef.current = page
          setCurrentPage(page)
        }
      },
      { root: containerRef.current, threshold: 0.01 }
    )

    pageRowRefs.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [maxPages, setCurrentPage])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-auto bg-[#e8e8e8] dark:bg-[#1a1a1a]"
    >
      <div className="flex flex-col items-center gap-4 py-4 min-w-fit px-4">
        {Array.from({ length: maxPages }, (_, i) => {
          const pageNum = i + 1
          return (
            <div
              key={pageNum}
              ref={el => { pageRowRefs.current[i] = el }}
              data-page-idx={i}
              className="flex gap-4 items-start"
            >
              {/* Old PDF column */}
              {oldPDF && (
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs bg-red-600/80 text-white px-2 py-0.5 rounded">
                    Old — p.{pageNum}
                  </span>
                  {pageNum <= oldPDF.pageCount ? (
                    <PDFCanvas doc={oldPDF.doc} pageNum={pageNum} scale={zoom} />
                  ) : (
                    <div
                      className="bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm rounded"
                      style={{ width: Math.round(595 * zoom), height: Math.round(842 * zoom) }}
                    >
                      —
                    </div>
                  )}
                </div>
              )}

              {/* Vertical separator */}
              {oldPDF && newPDF && (
                <div className="self-stretch w-px bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-6" />
              )}

              {/* New PDF column */}
              {newPDF && (
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs bg-blue-600/80 text-white px-2 py-0.5 rounded">
                    New — p.{pageNum}
                  </span>
                  {pageNum <= newPDF.pageCount ? (
                    <PDFCanvas doc={newPDF.doc} pageNum={pageNum} scale={zoom} />
                  ) : (
                    <div
                      className="bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm rounded"
                      style={{ width: Math.round(595 * zoom), height: Math.round(842 * zoom) }}
                    >
                      —
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
