import { useState, useCallback } from 'react'
import usePDFStore from '../../store/usePDFStore'
import { loadPDF } from '../../hooks/usePDFLoader'
import DropZone from './DropZone'
import FileMetadata from './FileMetadata'

export default function UploadView() {
  const { oldPDF, newPDF, setOldPDF, setNewPDF, clearOldPDF, clearNewPDF, theme, setTheme } = usePDFStore()
  const [loadingOld, setLoadingOld] = useState(false)
  const [loadingNew, setLoadingNew] = useState(false)
  const [errorOld, setErrorOld] = useState('')
  const [errorNew, setErrorNew] = useState('')

  const handleFile = useCallback(async (file, which) => {
    const setLoading = which === 'old' ? setLoadingOld : setLoadingNew
    const setError = which === 'old' ? setErrorOld : setErrorNew
    const setPDF = which === 'old' ? setOldPDF : setNewPDF
    setLoading(true)
    setError('')
    try {
      const info = await loadPDF(file)
      setPDF(info)
    } catch (err) {
      if (err?.name === 'PasswordException') {
        setError('This PDF is password-protected. Password-protected PDFs are not yet supported in the upload screen.')
      } else {
        setError(`Failed to load PDF: ${err?.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }, [setOldPDF, setNewPDF])

  const bothLoaded = oldPDF && newPDF
  const pageMismatch = oldPDF && newPDF && oldPDF.pageCount !== newPDF.pageCount

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PDF Compare</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Engineering document revision viewer</p>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </div>

      {/* Upload zones */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Old revision */}
          <div className="flex flex-col gap-3">
            <DropZone
              label="Old Revision (Rev A)"
              revision="old"
              hasFile={!!oldPDF}
              onFile={(f) => handleFile(f, 'old')}
            />
            {loadingOld && <p className="text-sm text-gray-400 text-center animate-pulse">Loading PDF…</p>}
            {errorOld && <p className="text-sm text-red-400">{errorOld}</p>}
            {oldPDF && <FileMetadata pdfInfo={oldPDF} revision="old" onClear={clearOldPDF} />}
          </div>

          {/* New revision */}
          <div className="flex flex-col gap-3">
            <DropZone
              label="New Revision (Rev B)"
              revision="new"
              hasFile={!!newPDF}
              onFile={(f) => handleFile(f, 'new')}
            />
            {loadingNew && <p className="text-sm text-gray-400 text-center animate-pulse">Loading PDF…</p>}
            {errorNew && <p className="text-sm text-red-400">{errorNew}</p>}
            {newPDF && <FileMetadata pdfInfo={newPDF} revision="new" onClear={clearNewPDF} />}
          </div>
        </div>

        {pageMismatch && (
          <div className="w-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg px-4 py-3 text-sm">
            ⚠ Page count mismatch: Old has {oldPDF.pageCount} pages, New has {newPDF.pageCount} pages.
            Comparison will show up to the maximum page count; missing pages will appear blank.
          </div>
        )}

        {bothLoaded && !pageMismatch && (
          <div className="w-full bg-green-500/10 border border-green-500/40 text-green-400 rounded-lg px-4 py-3 text-sm">
            ✓ Both PDFs loaded — {oldPDF.pageCount} pages each. Ready to compare.
          </div>
        )}

        {bothLoaded && (
          <div className="text-sm text-gray-400 animate-pulse">Opening comparison view…</div>
        )}
      </div>
    </div>
  )
}
