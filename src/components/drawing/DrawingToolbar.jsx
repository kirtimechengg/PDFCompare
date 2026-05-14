import usePDFStore from '../../store/usePDFStore'

// --- Icons ---

function PanIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M7.5 1v3M7.5 11v3M1 7.5h3M11 7.5h3M3.4 3.4l1.8 1.8M9.8 9.8l1.8 1.8M9.8 5.2l1.8-1.8M3.4 11.6l1.8-1.8" />
    </svg>
  )
}

function SelectIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2l9 5-4 1.2L6.5 13 3 2z" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  )
}

function RectIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="2" y="3.5" width="11" height="8" rx="0.5" />
    </svg>
  )
}

function CircleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="7.5" cy="7.5" rx="5.5" ry="4" />
    </svg>
  )
}

function LineIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="2" y1="13" x2="13" y2="2" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="13" x2="12" y2="3" />
      <polyline points="6,3 12,3 12,9" />
    </svg>
  )
}

function PenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2.5 L12.5 4.5 L5 12 L2 13 L3 10 Z" />
      <line x1="9" y1="4" x2="11" y2="6" />
    </svg>
  )
}

function MarkerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2 L13 6 L6 13 L3 13 L3 10 Z" strokeWidth="2" opacity="0.5" />
      <path d="M9 2 L13 6 L6 13 L3 13 L3 10 Z" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6 A5 5 0 1 1 6 2" />
      <polyline points="2,3 2,6.5 5.5,6.5" />
    </svg>
  )
}

// --- Tool groups ---
const NAV_TOOLS = [
  { id: null,     label: 'Pan',       icon: <PanIcon /> },
  { id: 'select', label: 'Select',    icon: <SelectIcon /> },
]

const SHAPE_TOOLS = [
  { id: 'rect',   label: 'Rectangle', icon: <RectIcon /> },
  { id: 'circle', label: 'Ellipse',   icon: <CircleIcon /> },
  { id: 'line',   label: 'Line',      icon: <LineIcon /> },
  { id: 'arrow',  label: 'Arrow',     icon: <ArrowIcon /> },
]

const FREEHAND_TOOLS = [
  { id: 'pen',    label: 'Pen',       icon: <PenIcon /> },
  { id: 'marker', label: 'Marker',    icon: <MarkerIcon /> },
]

const STROKE_WIDTHS = [
  { value: 1, title: 'Thin' },
  { value: 2, title: 'Medium' },
  { value: 4, title: 'Thick' },
]

const PRESET_COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#af52de', '#ffffff', '#000000']

function ToolGroup({ tools, active, onSelect }) {
  return (
    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
      {tools.map((t) => (
        <button
          key={String(t.id)}
          onClick={() => onSelect(t.id)}
          title={t.label}
          className={[
            'w-8 h-7 flex items-center justify-center transition',
            active === t.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
          ].join(' ')}
        >
          {t.icon}
        </button>
      ))}
    </div>
  )
}

export default function DrawingToolbar() {
  const {
    drawingTool, setDrawingTool,
    drawColor, setDrawColor,
    drawStrokeWidth, setDrawStrokeWidth,
    currentPage, undoAnnotation, clearPageAnnotations,
    selectedAnnotationId, deleteSelectedAnnotation,
  } = usePDFStore()

  const showDrawOptions = drawingTool && drawingTool !== 'select'

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {/* Navigation / select */}
      <ToolGroup tools={NAV_TOOLS} active={drawingTool} onSelect={setDrawingTool} />

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

      {/* Shapes */}
      <ToolGroup tools={SHAPE_TOOLS} active={drawingTool} onSelect={setDrawingTool} />

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

      {/* Freehand */}
      <ToolGroup tools={FREEHAND_TOOLS} active={drawingTool} onSelect={setDrawingTool} />

      {/* Color + stroke + actions — show when a draw/freehand tool is active */}
      {showDrawOptions && (
        <>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

          {/* Color swatch with hover palette */}
          <div className="relative group">
            <button
              title="Draw color"
              className="w-6 h-6 rounded-full border-2 border-white/30 shadow-sm flex-shrink-0"
              style={{ background: drawColor }}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:flex flex-col z-50 bg-gray-800 border border-gray-600 rounded-lg p-1.5 shadow-xl gap-1">
              <div className="flex gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDrawColor(c)}
                    title={c}
                    className={[
                      'w-5 h-5 rounded-full border transition',
                      drawColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-110',
                    ].join(' ')}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 pt-0.5">
                <span className="text-[10px] text-gray-400">Custom:</span>
                <input
                  type="color"
                  value={drawColor}
                  onChange={(e) => setDrawColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stroke width */}
          <div className="flex rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.value}
                onClick={() => setDrawStrokeWidth(sw.value)}
                title={sw.title}
                className={[
                  'w-7 h-7 flex items-center justify-center transition',
                  drawStrokeWidth === sw.value
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                ].join(' ')}
              >
                <div className="rounded-full bg-current" style={{ width: sw.value * 3 + 2, height: sw.value }} />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Undo / delete selected / clear — always shown when any tool is active */}
      {drawingTool && (
        <>
          {drawingTool !== 'select' && (
            <button
              onClick={() => undoAnnotation(currentPage)}
              title="Undo last annotation (current page)"
              className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
            >
              <UndoIcon />
            </button>
          )}

          {drawingTool === 'select' && selectedAnnotationId && (
            <button
              onClick={deleteSelectedAnnotation}
              title="Delete selected annotation"
              className="flex items-center gap-1 px-2 h-7 text-xs text-red-400 border border-red-500/40 hover:bg-red-500/20 rounded transition"
            >
              Delete
            </button>
          )}

          <button
            onClick={() => clearPageAnnotations(currentPage)}
            title="Clear all annotations on this page"
            className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition text-xs"
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}
