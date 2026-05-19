import { useState, useEffect, useRef } from 'react'

const SKIP_TYPES = new Set(['Widget', 'Link', 'Popup'])

function parsePDFDate(str) {
  if (!str) return null
  const m = /^D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/.exec(str)
  if (!m) return null
  const [, y, mo, d, h = '00', min = '00', s = '00'] = m
  try { return new Date(`${y}-${mo}-${d}T${h}:${min}:${s}`) } catch { return null }
}

function annColor(color) {
  if (!color || color.length < 3) return '#ffcc00'
  return `rgb(${Math.round(color[0])},${Math.round(color[1])},${Math.round(color[2])})`
}

const TYPE_LABEL = {
  Text: 'Comment',
  Highlight: 'Highlight',
  Underline: 'Underline',
  StrikeOut: 'Strikethrough',
  FreeText: 'Text Box',
  Square: 'Rectangle',
  Circle: 'Ellipse',
  Line: 'Line',
  PolyLine: 'Polyline',
  Polygon: 'Polygon',
  Stamp: 'Stamp',
  Ink: 'Ink Drawing',
  FileAttachment: 'Attachment',
  Caret: 'Caret',
}

function DetailsPopup({ ann, x, y, label, onClose }) {
  const popupRef = useRef(null)
  const [pos, setPos] = useState({ left: x, top: y })

  useEffect(() => {
    if (!popupRef.current) return
    const { width, height } = popupRef.current.getBoundingClientRect()
    setPos({
      left: Math.min(x, window.innerWidth - width - 8),
      top: Math.min(y, window.innerHeight - height - 8),
    })
  }, [x, y])

  const date = parsePDFDate(ann.modificationDate || ann.creationDate)
  const color = annColor(ann.color)
  const typeLabel = TYPE_LABEL[ann.subtype] ?? ann.subtype ?? 'Annotation'
  const dateStr = date
    ? date.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null
  const author = ann.title || null

  return (
    <div
      ref={popupRef}
      style={{ position: 'fixed', left: pos.left, top: pos.top, zIndex: 9999 }}
      className="bg-gray-900 border border-gray-600 rounded-xl shadow-2xl w-56 text-xs text-gray-200 select-none overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Author banner — primary focus */}
      <div className="px-3 pt-3 pb-2.5 border-b border-gray-700/60">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0 text-blue-300 text-sm font-semibold">
              {author ? author[0].toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {author ?? 'Unknown Author'}
              </p>
              {dateStr && <p className="text-gray-500 text-[10px] mt-0.5">{dateStr}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-300 transition flex-shrink-0 mt-0.5 leading-none"
          >✕</button>
        </div>
      </div>

      {/* Type + label */}
      <div className="px-3 py-2 flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
        <span className="text-gray-300 font-medium">{typeLabel}</span>
        {label && <span className="text-gray-600 text-[10px] ml-auto">{label} Rev</span>}
      </div>

      {/* Comment text */}
      {ann.contents && (
        <div className="px-3 pb-3 pt-0.5 border-t border-gray-700/60">
          <p className="text-gray-300 whitespace-pre-wrap break-words leading-relaxed">{ann.contents}</p>
        </div>
      )}
    </div>
  )
}

export default function PDFAnnotationOverlay({ doc, pageNum, zoom, canvasRef, label }) {
  const [annotations, setAnnotations] = useState([])
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!doc) { setAnnotations([]); return }
    let cancelled = false
    async function load() {
      try {
        const page = await doc.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1 })
        const anns = await page.getAnnotations()
        if (cancelled) return
        // PDF.js 4.x stores author/content as {str, dir} objects (titleObj / contentsObj).
        // Resolve them to plain strings so the rest of the component can use ann.title / ann.contents.
        const resolveStr = (strField, objField) =>
          (typeof strField === 'string' && strField) ||
          (objField && typeof objField === 'object' ? objField.str : null) ||
          ''
        const visible = anns
          .filter((a) => !SKIP_TYPES.has(a.subtype) && a.rect)
          .map((a) => ({
            ...a,
            title: resolveStr(a.title, a.titleObj),
            contents: resolveStr(a.contents, a.contentsObj),
            viewportRect: viewport.convertToViewportRectangle(a.rect),
          }))
        setAnnotations(visible)
      } catch {
        if (!cancelled) setAnnotations([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [doc, pageNum])

  useEffect(() => {
    const canvas = canvasRef?.current
    if (!canvas) return
    const sync = () => { if (canvas.width > 0) setCanvasSize({ w: canvas.width, h: canvas.height }) }
    const ro = new ResizeObserver(sync)
    ro.observe(canvas)
    sync()
    return () => ro.disconnect()
  }, [canvasRef])

  useEffect(() => {
    const canvas = canvasRef?.current
    if (canvas && canvas.width > 0) setCanvasSize({ w: canvas.width, h: canvas.height })
  }, [zoom, canvasRef])

  useEffect(() => {
    if (!selected) return
    const dismiss = () => setSelected(null)
    window.addEventListener('click', dismiss)
    return () => window.removeEventListener('click', dismiss)
  }, [selected])

  if (!canvasSize.w || !annotations.length) return null

  const pageW = canvasSize.w / zoom
  const pageH = canvasSize.h / zoom

  const handleClick = (e, ann) => {
    e.stopPropagation()
    setSelected({ ann, x: e.clientX + 14, y: e.clientY + 8 })
  }

  return (
    <>
      <svg
        style={{
          position: 'absolute', top: 0, left: 0,
          width: canvasSize.w, height: canvasSize.h,
          pointerEvents: 'all', zIndex: 6,
        }}
        viewBox={`0 0 ${pageW} ${pageH}`}
        onClick={() => setSelected(null)}
      >
        {annotations.map((ann, i) => {
          const [vx1, vy1, vx2, vy2] = ann.viewportRect
          const x = Math.min(vx1, vx2)
          const y = Math.min(vy1, vy2)
          const w = Math.max(Math.abs(vx2 - vx1), 4 / zoom)
          const h = Math.max(Math.abs(vy2 - vy1), 4 / zoom)
          const color = annColor(ann.color)
          const isSelected = selected?.ann === ann

          return (
            <g key={ann.id ?? i} onClick={(e) => handleClick(e, ann)} style={{ cursor: 'pointer' }}>
              <title>{ann.title ? `${ann.title} · ${TYPE_LABEL[ann.subtype] ?? ann.subtype}` : TYPE_LABEL[ann.subtype] ?? ann.subtype}</title>
              <rect
                x={x} y={y} width={w} height={h}
                fill={color}
                fillOpacity={isSelected ? 0.35 : 0.12}
                stroke={color}
                strokeWidth={isSelected ? 2 / zoom : 1 / zoom}
                strokeOpacity={isSelected ? 1 : 0.5}
                rx={1 / zoom}
              />
              {/* Wide invisible hit zone */}
              <rect
                x={x - 4 / zoom} y={y - 4 / zoom}
                width={w + 8 / zoom} height={h + 8 / zoom}
                fill="transparent" stroke="none"
                pointerEvents="all"
              />
            </g>
          )
        })}
      </svg>
      {selected && (
        <DetailsPopup
          ann={selected.ann}
          x={selected.x}
          y={selected.y}
          label={label}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
