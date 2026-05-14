import { useRef } from 'react'
import usePDFStore from '../../store/usePDFStore'
import Toolbar from '../controls/Toolbar'
import Sidebar from '../controls/Sidebar'
import StatusBar from '../controls/StatusBar'
import MiniMap from '../controls/MiniMap'
import OverlayCanvas from './overlay/OverlayCanvas'
import SideBySideView from './sidebyside/SideBySideView'
import SwipeView from './sidebyside/SwipeView'

export default function ComparisonView() {
  const { mode, oldPDF, newPDF } = usePDFStore()
  const canvasAreaRef = useRef(null)

  const pageMismatch = oldPDF && newPDF && oldPDF.pageCount !== newPDF.pageCount

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Toolbar canvasRef={canvasAreaRef} />

      {pageMismatch && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-400 text-xs px-4 py-1.5 flex-shrink-0">
          ⚠ Page count mismatch: {oldPDF.pageCount} vs {newPDF.pageCount} pages — showing up to max page count.
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Main canvas area */}
        <div ref={canvasAreaRef} className="flex-1 flex min-w-0 relative bg-[#e8e8e8] dark:bg-[#1a1a1a]">
          {mode === 'overlay' && <OverlayCanvas />}
          {mode === 'sidebyside' && <SideBySideView />}
          {mode === 'swipe' && <SwipeView />}
          <MiniMap />
        </div>

        <Sidebar />
      </div>

      <StatusBar />
    </div>
  )
}
