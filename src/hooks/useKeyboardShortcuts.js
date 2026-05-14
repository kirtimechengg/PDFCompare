import { useEffect } from 'react'
import usePDFStore from '../store/usePDFStore'

const MODES = ['overlay', 'sidebyside', 'swipe']
const PAN_STEP = 40

export default function useKeyboardShortcuts() {
  const store = usePDFStore()

  useEffect(() => {
    function handler(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const { zoom, panX, panY, mode, showOld, showNew } = usePDFStore.getState()

      if (e.ctrlKey && e.key === '=') { e.preventDefault(); store.setZoom(zoom * 1.2) }
      else if (e.ctrlKey && e.key === '-') { e.preventDefault(); store.setZoom(zoom / 1.2) }
      else if (e.ctrlKey && e.key === '0') { e.preventDefault(); store.resetView() }
      else if (e.key === 'ArrowLeft') store.setPan(panX + PAN_STEP, panY)
      else if (e.key === 'ArrowRight') store.setPan(panX - PAN_STEP, panY)
      else if (e.key === 'ArrowUp') store.setPan(panX, panY + PAN_STEP)
      else if (e.key === 'ArrowDown') store.setPan(panX, panY - PAN_STEP)
      else if (e.key === ' ') { e.preventDefault(); store.toggleOld() }
      else if (e.key === 'Tab') {
        e.preventDefault()
        const idx = MODES.indexOf(mode)
        store.setMode(MODES[(idx + 1) % MODES.length])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
