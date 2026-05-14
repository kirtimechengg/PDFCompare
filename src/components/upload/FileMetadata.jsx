function fmt(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function FileMetadata({ pdfInfo, revision, onClear }) {
  if (!pdfInfo) return null
  const { metadata, pageCount } = pdfInfo
  const accent = revision === 'old' ? 'text-red-400 border-red-500' : 'text-blue-400 border-blue-400'
  const bg = revision === 'old' ? 'bg-red-500/5' : 'bg-blue-400/5'

  return (
    <div className={`border rounded-lg p-3 ${bg} ${accent.split(' ')[1]} text-sm flex items-start gap-3`}>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${accent.split(' ')[0]}`}>{metadata.name}</p>
        <div className="text-gray-400 flex gap-4 mt-1 flex-wrap">
          <span>{fmt(metadata.size)}</span>
          <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
          <span>{fmtTime(metadata.uploadedAt)}</span>
        </div>
      </div>
      <button
        onClick={onClear}
        className="text-gray-500 hover:text-gray-300 text-lg leading-none flex-shrink-0 mt-0.5"
        title="Remove file"
      >
        ✕
      </button>
    </div>
  )
}
