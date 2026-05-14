import { create } from 'zustand'

const getInitialTheme = () => {
  try { return localStorage.getItem('pdfcompare-theme') || 'dark' } catch { return 'dark' }
}

const usePDFStore = create((set, get) => ({
  // --- Loaded PDFs ---
  oldPDF: null,  // { file, doc, pageCount, metadata }
  newPDF: null,

  // --- Navigation ---
  currentPage: 1,

  // --- View mode ---
  mode: 'overlay',  // 'overlay' | 'sidebyside' | 'swipe'

  // --- Zoom / pan ---
  zoom: 1.0,
  panX: 0,
  panY: 0,

  // --- Overlay layer settings ---
  oldColor: '#ff0000',
  newColor: '#00aaff',
  oldOpacity: 0.5,
  newOpacity: 0.5,
  blendMode: 'difference',
  showOld: true,
  showNew: true,

  // --- Manual alignment ---
  alignOffsetX: 0,
  alignOffsetY: 0,
  alignRotation: 0.0,

  // --- UI state ---
  theme: getInitialTheme(),
  sidebarOpen: true,
  syncScroll: true,

  // --- Drawing tools ---
  drawingTool: null,         // null | 'select' | 'rect' | 'circle' | 'line' | 'arrow' | 'pen' | 'marker'
  drawColor: '#ff3b30',
  drawStrokeWidth: 2,
  annotations: {},           // { [pageNum]: Shape[] }
  selectedAnnotationId: null,

  // --- Password prompts ---
  pendingPasswordPDF: null,  // 'old' | 'new' | null

  // --- Actions ---
  setOldPDF: (pdf) => set({ oldPDF: pdf, currentPage: 1, panX: 0, panY: 0 }),
  setNewPDF: (pdf) => set({ newPDF: pdf, currentPage: 1, panX: 0, panY: 0 }),
  clearOldPDF: () => set({ oldPDF: null }),
  clearNewPDF: () => set({ newPDF: null }),
  swapPDFs: () => set((s) => ({ oldPDF: s.newPDF, newPDF: s.oldPDF })),

  setCurrentPage: (page) => {
    const { oldPDF, newPDF } = get()
    const maxPage = Math.max(oldPDF?.pageCount ?? 1, newPDF?.pageCount ?? 1)
    set({ currentPage: Math.max(1, Math.min(page, maxPage)) })
  },

  setMode: (mode) => set({ mode }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(8.0, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),
  resetView: () => set({ zoom: 1.0, panX: 0, panY: 0 }),

  setOldColor: (c) => set({ oldColor: c }),
  setNewColor: (c) => set({ newColor: c }),
  setOldOpacity: (v) => set({ oldOpacity: v }),
  setNewOpacity: (v) => set({ newOpacity: v }),
  setBlendMode: (m) => set({ blendMode: m }),
  toggleOld: () => set((s) => ({ showOld: !s.showOld })),
  toggleNew: () => set((s) => ({ showNew: !s.showNew })),

  setAlignOffsetX: (v) => set({ alignOffsetX: v }),
  setAlignOffsetY: (v) => set({ alignOffsetY: v }),
  setAlignRotation: (v) => set({ alignRotation: v }),
  resetAlignment: () => set({ alignOffsetX: 0, alignOffsetY: 0, alignRotation: 0 }),

  setTheme: (theme) => {
    try { localStorage.setItem('pdfcompare-theme', theme) } catch {}
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    set({ theme })
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSyncScroll: (v) => set({ syncScroll: v }),
  setPendingPasswordPDF: (which) => set({ pendingPasswordPDF: which }),

  setDrawingTool: (t) => set({ drawingTool: t }),
  setDrawColor: (c) => set({ drawColor: c }),
  setDrawStrokeWidth: (w) => set({ drawStrokeWidth: w }),
  addAnnotation: (shape) => set((s) => ({
    annotations: {
      ...s.annotations,
      [shape.page]: [...(s.annotations[shape.page] ?? []), shape],
    },
  })),
  removeAnnotation: (page, id) => set((s) => ({
    annotations: {
      ...s.annotations,
      [page]: (s.annotations[page] ?? []).filter((a) => a.id !== id),
    },
  })),
  undoAnnotation: (page) => set((s) => ({
    annotations: {
      ...s.annotations,
      [page]: (s.annotations[page] ?? []).slice(0, -1),
    },
  })),
  clearPageAnnotations: (page) => set((s) => ({
    annotations: { ...s.annotations, [page]: [] },
  })),

  setSelectedAnnotationId: (id) => set({ selectedAnnotationId: id }),
  deleteSelectedAnnotation: () => set((s) => {
    if (!s.selectedAnnotationId) return {}
    const newAnnotations = {}
    for (const [page, shapes] of Object.entries(s.annotations)) {
      newAnnotations[page] = shapes.filter((a) => a.id !== s.selectedAnnotationId)
    }
    return { annotations: newAnnotations, selectedAnnotationId: null }
  }),
}))

export default usePDFStore
