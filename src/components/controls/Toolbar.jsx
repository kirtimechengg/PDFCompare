import usePDFStore from '../../store/usePDFStore'
import PageNavigation from './PageNavigation'
import ZoomControls from './ZoomControls'
import ThemeToggle from '../common/ThemeToggle'
import ExportButton from '../common/ExportButton'
import DrawingToolbar from '../drawing/DrawingToolbar'

const MODES = [
  { id: 'overlay', label: 'Overlay' },
  { id: 'sidebyside', label: 'Side-by-Side' },
  { id: 'swipe', label: 'Swipe' },
]

export default function Toolbar({ canvasRef }) {
  const { mode, setMode, sidebarOpen, toggleSidebar, oldPDF, newPDF, clearOldPDF, clearNewPDF, swapPDFs } = usePDFStore()

  return (
    <header className="flex items-center gap-3 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#242424] flex-shrink-0 flex-wrap">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
        title="Toggle sidebar"
      >
        ☰
      </button>

      {/* File names */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="text-red-400 truncate max-w-24" title={oldPDF?.metadata?.name}>
          {oldPDF?.metadata?.name ?? '—'}
        </span>
        <button
          onClick={swapPDFs}
          disabled={!oldPDF || !newPDF}
          className="text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-0.5 transition"
          title="Swap old ↔ new"
        >
          ⇄
        </button>
        <span className="text-blue-400 truncate max-w-24" title={newPDF?.metadata?.name}>
          {newPDF?.metadata?.name ?? '—'}
        </span>
        <button
          onClick={() => { clearOldPDF(); clearNewPDF() }}
          className="text-gray-600 hover:text-gray-300 ml-1"
          title="Replace files"
        >
          ✕
        </button>
      </div>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Mode switcher */}
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={[
              'px-3 py-1 text-sm transition',
              mode === m.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
            ].join(' ')}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Drawing tools */}
      <DrawingToolbar />

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Page navigation */}
      <PageNavigation />

      <div className="flex-1" />

      {/* Zoom controls */}
      <ZoomControls canvasRef={canvasRef} />

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

      <ThemeToggle />
      <ExportButton canvasRef={canvasRef} />
    </header>
  )
}
