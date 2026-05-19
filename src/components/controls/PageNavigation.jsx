import { useState } from 'react'
import usePDFStore from '../../store/usePDFStore'

export default function PageNavigation() {
  const { currentPage, oldPDF, newPDF, setCurrentPage } = usePDFStore()
  const [inputVal, setInputVal] = useState('')
  const [editing, setEditing] = useState(false)

  const maxPage = Math.max(oldPDF?.pageCount ?? 1, newPDF?.pageCount ?? 1)

  const submit = () => {
    const n = parseInt(inputVal, 10)
    if (!isNaN(n)) setCurrentPage(n)
    setEditing(false)
    setInputVal('')
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setCurrentPage(1)}
        disabled={currentPage <= 1}
        className="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-30 text-2xl leading-none"
        title="First page"
      >⟨⟨</button>
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-30 text-2xl leading-none"
        title="Previous page"
      >‹</button>

      {editing ? (
        <input
          autoFocus
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={submit}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setEditing(false) }}
          className="w-12 text-center bg-gray-700 border border-gray-500 rounded px-1 py-0.5 text-sm"
        />
      ) : (
        <button
          onClick={() => { setEditing(true); setInputVal(String(currentPage)) }}
          className="px-2 py-1 rounded hover:bg-white/10 font-mono tabular-nums"
          title="Click to jump to page"
        >
          {currentPage}
        </button>
      )}

      <span className="text-gray-400">/ {maxPage}</span>

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage >= maxPage}
        className="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-30 text-2xl leading-none"
        title="Next page"
      >›</button>
      <button
        onClick={() => setCurrentPage(maxPage)}
        disabled={currentPage >= maxPage}
        className="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-30 text-2xl leading-none"
        title="Last page"
      >⟩⟩</button>
    </div>
  )
}
