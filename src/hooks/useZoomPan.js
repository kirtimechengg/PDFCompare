import { useRef, useCallback, useEffect } from 'react'
import usePDFStore from '../store/usePDFStore'

export function useZoomPan(containerRef, drawingTool) {
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  // Attach wheel listener imperatively so we can pass { passive: false }
  // React synthetic onWheel is passive in Chrome 73+ and can't preventDefault
  useEffect(() => {
    const el = containerRef?.current
    if (!el) return
    const handler = (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      const { zoom, setZoom } = usePDFStore.getState()
      const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1
      setZoom(zoom * factor)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [containerRef])

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    if (drawingTool) return
    const { panX, panY } = usePDFStore.getState()
    dragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY }
    if (containerRef?.current) {
      containerRef.current.classList.remove('canvas-grab')
      containerRef.current.classList.add('canvas-grabbing')
    }
  }, [containerRef])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    usePDFStore.getState().setPan(dragStart.current.panX + dx, dragStart.current.panY + dy)
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
    if (containerRef?.current) {
      containerRef.current.classList.remove('canvas-grabbing')
      containerRef.current.classList.add('canvas-grab')
    }
  }, [containerRef])

  // no onWheel returned — handled via imperative listener above
  return { onMouseDown, onMouseMove, onMouseUp }
}
