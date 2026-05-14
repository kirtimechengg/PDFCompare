import { useRef, useCallback } from 'react'

const renderCache = new Map()

function cacheKey(doc, pageNum, scale) {
  return `${doc.fingerprints?.[0] ?? Math.random()}_${pageNum}_${scale.toFixed(2)}`
}

export function usePDFRenderer() {
  const renderingRef = useRef(new Set())

  const renderPage = useCallback(async (doc, pageNum, scale, canvas) => {
    if (!doc || !canvas) return
    const key = cacheKey(doc, pageNum, scale)

    if (renderCache.has(key)) {
      const cached = renderCache.get(key)
      canvas.width = cached.width
      canvas.height = cached.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(cached, 0, 0)
      return
    }

    if (renderingRef.current.has(key)) return
    renderingRef.current.add(key)

    try {
      const page = await doc.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise

      // Cache as ImageBitmap
      try {
        const bmp = await createImageBitmap(canvas)
        renderCache.set(key, bmp)
        // Evict old entries if cache grows large
        if (renderCache.size > 30) {
          const firstKey = renderCache.keys().next().value
          renderCache.get(firstKey)?.close?.()
          renderCache.delete(firstKey)
        }
      } catch {}
    } finally {
      renderingRef.current.delete(key)
    }
  }, [])

  const renderPageOffscreen = useCallback(async (doc, pageNum, scale) => {
    if (!doc) return null
    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise
    return canvas
  }, [])

  return { renderPage, renderPageOffscreen }
}
