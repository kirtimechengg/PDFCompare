import usePDFStore from '../../store/usePDFStore'

const STEP = 1
const ROT_STEP = 0.1

export default function AlignmentControls() {
  const {
    alignOffsetX, alignOffsetY, alignRotation,
    setAlignOffsetX, setAlignOffsetY, setAlignRotation,
    resetAlignment,
  } = usePDFStore()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide">Alignment (Old Layer)</span>
        <button onClick={resetAlignment} className="text-xs text-gray-500 hover:text-gray-300">Reset</button>
      </div>

      {/* X/Y nudge */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">X offset: {alignOffsetX}px</span>
          <div className="flex gap-1">
            <button onClick={() => setAlignOffsetX(alignOffsetX - STEP)} className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">←</button>
            <button onClick={() => setAlignOffsetX(alignOffsetX + STEP)} className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">→</button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Y offset: {alignOffsetY}px</span>
          <div className="flex gap-1">
            <button onClick={() => setAlignOffsetY(alignOffsetY - STEP)} className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">↑</button>
            <button onClick={() => setAlignOffsetY(alignOffsetY + STEP)} className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">↓</button>
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">Rotation: {alignRotation.toFixed(1)}°</span>
        <div className="flex gap-1">
          <button onClick={() => setAlignRotation(+(alignRotation - ROT_STEP).toFixed(1))} className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">↺</button>
          <button onClick={() => setAlignRotation(+(alignRotation + ROT_STEP).toFixed(1))} className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">↻</button>
        </div>
      </div>
    </div>
  )
}
