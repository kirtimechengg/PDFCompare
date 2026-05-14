import { useRef, useState, useCallback } from 'react'

export default function DropZone({ label, revision, onFile, hasFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const validate = useCallback((file) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.')
      return
    }
    setError('')
    onFile(file)
  }, [onFile])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    validate(file)
  }, [validate])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onChange = (e) => validate(e.target.files?.[0])

  const borderColor = revision === 'old' ? 'border-red-500' : 'border-blue-400'
  const activeBg = revision === 'old' ? 'bg-red-500/10' : 'bg-blue-400/10'
  const labelColor = revision === 'old' ? 'text-red-400' : 'text-blue-400'

  return (
    <div className="flex flex-col gap-2">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !hasFile && inputRef.current?.click()}
        className={[
          'relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 transition-all select-none',
          dragging ? `${borderColor} ${activeBg}` : 'border-gray-600 hover:border-gray-400',
          !hasFile ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onChange}
        />
        <div className={`text-4xl font-bold ${labelColor}`}>
          {revision === 'old' ? '▲' : '▼'}
        </div>
        <div className="text-center">
          <p className={`text-lg font-semibold ${labelColor}`}>{label}</p>
          <p className="text-sm text-gray-400 mt-1">
            {hasFile ? 'File loaded — drag a new PDF to replace' : 'Drag & drop a PDF here or click to browse'}
          </p>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
