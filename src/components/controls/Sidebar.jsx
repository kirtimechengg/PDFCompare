import usePDFStore from '../../store/usePDFStore'
import ColorPicker from './ColorPicker'
import AlignmentControls from './AlignmentControls'

const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'difference', label: 'Difference' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
]

export default function Sidebar() {
  const {
    mode, sidebarOpen,
    oldColor, newColor, oldOpacity, newOpacity,
    setOldColor, setNewColor, setOldOpacity, setNewOpacity,
    blendMode, setBlendMode,
    showOld, showNew, toggleOld, toggleNew,
    syncScroll, setSyncScroll,
  } = usePDFStore()

  if (!sidebarOpen) return null

  return (
    <aside className="w-60 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#222] overflow-y-auto flex flex-col">
      <div className="flex-1 p-3 flex flex-col gap-5">

        {/* Old layer */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Old Revision</h3>
            <button
              onClick={toggleOld}
              className={`text-xs px-2 py-0.5 rounded border transition ${showOld ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-gray-600 text-gray-500'}`}
            >
              {showOld ? 'Visible' : 'Hidden'}
            </button>
          </div>
          <ColorPicker
            label="Color"
            color={oldColor}
            opacity={oldOpacity}
            onColor={setOldColor}
            onOpacity={setOldOpacity}
          />
        </section>

        <div className="h-px bg-gray-200 dark:bg-gray-700" />

        {/* New layer */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">New Revision</h3>
            <button
              onClick={toggleNew}
              className={`text-xs px-2 py-0.5 rounded border transition ${showNew ? 'border-blue-400/50 text-blue-400 bg-blue-400/10' : 'border-gray-600 text-gray-500'}`}
            >
              {showNew ? 'Visible' : 'Hidden'}
            </button>
          </div>
          <ColorPicker
            label="Color"
            color={newColor}
            opacity={newOpacity}
            onColor={setNewColor}
            onOpacity={setNewOpacity}
          />
        </section>

        {mode === 'overlay' && (
          <>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* Blend mode */}
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Blend Mode</h3>
              <select
                value={blendMode}
                onChange={(e) => setBlendMode(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm"
              >
                {BLEND_MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {blendMode === 'difference' ? '★ Best for highlighting changes' : 'Tip: Difference mode highlights changes most clearly'}
              </p>
            </section>

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* Alignment */}
            <section>
              <AlignmentControls />
            </section>
          </>
        )}

        {mode === 'sidebyside' && (
          <>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sync</h3>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={syncScroll}
                  onChange={(e) => setSyncScroll(e.target.checked)}
                  className="accent-blue-500"
                />
                Synchronized scroll & zoom
              </label>
            </section>
          </>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 space-y-0.5">
        <p>Ctrl+/- Zoom · Ctrl+0 Reset</p>
        <p>Arrows Pan · Space Toggle Old</p>
        <p>Tab Cycle mode</p>
      </div>
    </aside>
  )
}
