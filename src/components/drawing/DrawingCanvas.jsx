import { useRef, useState, useEffect, useCallback } from 'react'
import usePDFStore from '../../store/usePDFStore'

let _id = 0
const nextId = () => `s${++_id}`

// --- Coordinate helpers ---

function shapeBounds(shape) {
  if (shape.type === 'pen' || shape.type === 'marker') {
    if (!shape.points?.length) return { x: 0, y: 0, w: 0, h: 0 }
    const xs = shape.points.map((p) => p.x)
    const ys = shape.points.map((p) => p.y)
    const x = Math.min(...xs), y = Math.min(...ys)
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
  }
  const x = Math.min(shape.x1, shape.x2)
  const y = Math.min(shape.y1, shape.y2)
  return { x, y, w: Math.abs(shape.x2 - shape.x1), h: Math.abs(shape.y2 - shape.y1) }
}

function pointsToPath(pts) {
  if (!pts || pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} l 0.1 0`
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`
  }
  const last = pts[pts.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

// --- Visual shape renderers ---

function RectShape({ shape }) {
  const { x1, y1, x2, y2, color, strokeWidth } = shape
  return (
    <rect
      x={Math.min(x1, x2)} y={Math.min(y1, y2)}
      width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)}
      fill="transparent" stroke={color} strokeWidth={strokeWidth}
      strokeLinejoin="round" pointerEvents="none"
    />
  )
}

function CircleShape({ shape }) {
  const { x1, y1, x2, y2, color, strokeWidth } = shape
  return (
    <ellipse
      cx={(x1 + x2) / 2} cy={(y1 + y2) / 2}
      rx={Math.abs(x2 - x1) / 2} ry={Math.abs(y2 - y1) / 2}
      fill="transparent" stroke={color} strokeWidth={strokeWidth}
      pointerEvents="none"
    />
  )
}

function LineShape({ shape }) {
  const { x1, y1, x2, y2, color, strokeWidth } = shape
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
      pointerEvents="none"
    />
  )
}

function ArrowShape({ shape }) {
  const { x1, y1, x2, y2, color, strokeWidth } = shape
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const headLen = strokeWidth * 6
  const spread = Math.PI / 7
  const ax = x2 - headLen * Math.cos(angle - spread)
  const ay = y2 - headLen * Math.sin(angle - spread)
  const bx = x2 - headLen * Math.cos(angle + spread)
  const by = y2 - headLen * Math.sin(angle + spread)
  return (
    <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} fill={color} stroke="none" />
    </g>
  )
}

function PenShape({ shape }) {
  const { points, color, strokeWidth, type } = shape
  const d = pointsToPath(points)
  if (!d) return null
  return (
    <path
      d={d} fill="none"
      stroke={color}
      strokeWidth={type === 'marker' ? strokeWidth * 5 : strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      opacity={type === 'marker' ? 0.4 : 1}
      pointerEvents="none"
    />
  )
}

// --- Hit areas for selection (invisible, wide for easy clicking) ---

function HitArea({ shape, onSelect }) {
  const hw = Math.max(18, (shape.strokeWidth ?? 2) + 14)
  const sel = (e) => { e.stopPropagation(); onSelect(shape.id) }

  if (shape.type === 'rect') {
    const { x1, y1, x2, y2 } = shape
    return (
      <rect
        x={Math.min(x1, x2)} y={Math.min(y1, y2)}
        width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)}
        fill="transparent" stroke="transparent" strokeWidth={hw}
        cursor="pointer" pointerEvents="all" onClick={sel}
      />
    )
  }
  if (shape.type === 'circle') {
    const { x1, y1, x2, y2 } = shape
    return (
      <ellipse
        cx={(x1 + x2) / 2} cy={(y1 + y2) / 2}
        rx={Math.abs(x2 - x1) / 2} ry={Math.abs(y2 - y1) / 2}
        fill="transparent" stroke="transparent" strokeWidth={hw}
        cursor="pointer" pointerEvents="all" onClick={sel}
      />
    )
  }
  if (shape.type === 'line' || shape.type === 'arrow') {
    return (
      <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
        stroke="transparent" strokeWidth={hw} strokeLinecap="round"
        cursor="pointer" pointerEvents="stroke" onClick={sel}
      />
    )
  }
  if (shape.type === 'pen' || shape.type === 'marker') {
    const d = pointsToPath(shape.points)
    if (!d) return null
    return (
      <path d={d} fill="none" stroke="transparent"
        strokeWidth={Math.max(hw, (shape.type === 'marker' ? shape.strokeWidth * 5 : shape.strokeWidth) + 14)}
        strokeLinecap="round" cursor="pointer" pointerEvents="stroke" onClick={sel}
      />
    )
  }
  return null
}

// --- Selection highlight + delete button ---

function SelectionBox({ shape, onDelete, zoom }) {
  const { x, y, w, h } = shapeBounds(shape)
  const pad = Math.max(3, 6 / zoom)
  const bx = x - pad, by = y - pad
  const bw = w + pad * 2, bh = h + pad * 2
  const r = Math.max(4, 8 / zoom)
  const sw = Math.max(0.5, 1.5 / zoom)
  const da = `${5 / zoom} ${3 / zoom}`

  return (
    <g pointerEvents="none">
      <rect
        x={bx} y={by} width={bw} height={bh}
        fill="none" stroke="#4a9eff" strokeWidth={sw}
        strokeDasharray={da}
      />
      {/* Corner handles */}
      {[[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]].map(([cx, cy], i) => (
        <rect key={i} x={cx - r * 0.35} y={cy - r * 0.35}
          width={r * 0.7} height={r * 0.7}
          fill="#4a9eff" rx={r * 0.1}
        />
      ))}
      {/* Delete button — top-right */}
      <g
        transform={`translate(${bx + bw + r * 0.8}, ${by - r * 0.8})`}
        onClick={(e) => { e.stopPropagation(); onDelete(shape.id) }}
        style={{ cursor: 'pointer' }}
        pointerEvents="all"
      >
        <circle cx={0} cy={0} r={r} fill="#ff3b30" />
        <line x1={-r * 0.42} y1={-r * 0.42} x2={r * 0.42} y2={r * 0.42}
          stroke="white" strokeWidth={sw * 1.4} strokeLinecap="round"
        />
        <line x1={r * 0.42} y1={-r * 0.42} x2={-r * 0.42} y2={r * 0.42}
          stroke="white" strokeWidth={sw * 1.4} strokeLinecap="round"
        />
      </g>
    </g>
  )
}

// --- Composed shape element ---

function ShapeEl({ shape, isPreview, isSelected, selectMode, onSelect, onDelete, zoom }) {
  const opacity = isPreview ? 0.65 : 1

  const visual = (() => {
    if (shape.type === 'rect')   return <RectShape shape={shape} />
    if (shape.type === 'circle') return <CircleShape shape={shape} />
    if (shape.type === 'line')   return <LineShape shape={shape} />
    if (shape.type === 'arrow')  return <ArrowShape shape={shape} />
    if (shape.type === 'pen' || shape.type === 'marker') return <PenShape shape={shape} />
    return null
  })()

  return (
    <g opacity={opacity}>
      {visual}
      {selectMode && !isPreview && <HitArea shape={shape} onSelect={onSelect} />}
      {isSelected && !isPreview && <SelectionBox shape={shape} onDelete={onDelete} zoom={zoom} />}
    </g>
  )
}

// --- Main component ---

export default function DrawingCanvas({ canvasRef, zoom, pageNum }) {
  const {
    drawingTool, drawColor, drawStrokeWidth,
    annotations, addAnnotation, removeAnnotation,
    selectedAnnotationId, setSelectedAnnotationId, deleteSelectedAnnotation,
  } = usePDFStore()

  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const [preview, setPreview] = useState(null)
  const drawStart = useRef(null)
  const penPoints = useRef([])

  const isPen = drawingTool === 'pen' || drawingTool === 'marker'
  const isSelect = drawingTool === 'select'

  // Sync SVG size to canvas element
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

  // Keyboard: Delete / Backspace → delete selected; Escape → deselect
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelectedAnnotationId(null)
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId) {
        // Don't intercept when typing in an input
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
        e.preventDefault()
        deleteSelectedAnnotation()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedAnnotationId, deleteSelectedAnnotation, setSelectedAnnotationId])

  const toPage = useCallback((e) => {
    const canvas = canvasRef?.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    }
  }, [canvasRef, zoom])

  const onMouseDown = useCallback((e) => {
    if (!drawingTool || isSelect) return
    e.preventDefault()
    e.stopPropagation()
    const { x, y } = toPage(e)
    drawStart.current = true

    if (isPen) {
      penPoints.current = [{ x, y }]
      setPreview({ type: drawingTool, points: [{ x, y }], color: drawColor, strokeWidth: drawStrokeWidth })
    } else {
      setPreview({ type: drawingTool, x1: x, y1: y, x2: x, y2: y, color: drawColor, strokeWidth: drawStrokeWidth })
    }
  }, [drawingTool, isSelect, isPen, toPage, drawColor, drawStrokeWidth])

  const onMouseMove = useCallback((e) => {
    if (!drawStart.current) return
    const { x, y } = toPage(e)
    if (isPen) {
      const last = penPoints.current[penPoints.current.length - 1]
      if (Math.hypot(x - last.x, y - last.y) > 2) {
        penPoints.current.push({ x, y })
        setPreview((p) => p ? { ...p, points: [...penPoints.current] } : null)
      }
    } else {
      setPreview((p) => p ? { ...p, x2: x, y2: y } : null)
    }
  }, [isPen, toPage])

  const finalize = useCallback((e) => {
    if (!drawStart.current || !preview) return
    const { x, y } = toPage(e)
    let shape
    if (isPen) {
      penPoints.current.push({ x, y })
      shape = { ...preview, points: [...penPoints.current], id: nextId(), page: pageNum }
      penPoints.current = []
    } else {
      shape = { ...preview, x2: x, y2: y, id: nextId(), page: pageNum }
    }
    const isValid = shape.points ? shape.points.length > 1
      : (Math.abs(shape.x2 - shape.x1) > 1 || Math.abs(shape.y2 - shape.y1) > 1)
    if (isValid) addAnnotation(shape)
    drawStart.current = null
    setPreview(null)
  }, [preview, isPen, toPage, pageNum, addAnnotation])

  const onBgClick = useCallback(() => {
    if (isSelect) setSelectedAnnotationId(null)
  }, [isSelect, setSelectedAnnotationId])

  // SelectionBox only renders when the shape is already selected,
  // so selectedAnnotationId === id when this fires.
  const onDelete = useCallback(() => {
    deleteSelectedAnnotation()
  }, [deleteSelectedAnnotation])

  if (!canvasSize.w) return null

  const pageW = canvasSize.w / zoom
  const pageH = canvasSize.h / zoom
  const shapes = annotations[pageNum] ?? []
  const isActive = !!drawingTool
  const cursor = isSelect ? 'default' : drawingTool ? 'crosshair' : 'default'

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: canvasSize.w, height: canvasSize.h,
        cursor, pointerEvents: isActive ? 'all' : 'none',
        zIndex: 10, userSelect: 'none',
      }}
      viewBox={`0 0 ${pageW} ${pageH}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={finalize}
      onMouseLeave={finalize}
      onClick={onBgClick}
    >
      {shapes.map((s) => (
        <ShapeEl
          key={s.id} shape={s}
          isSelected={selectedAnnotationId === s.id}
          selectMode={isSelect}
          onSelect={setSelectedAnnotationId}
          onDelete={onDelete}
          zoom={zoom}
        />
      ))}
      {preview && <ShapeEl shape={preview} isPreview zoom={zoom} />}
    </svg>
  )
}
