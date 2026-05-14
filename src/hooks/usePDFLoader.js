import * as pdfjsLib from 'pdfjs-dist'

export async function loadPDF(file, password = '') {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    password: password || undefined,
  })
  const doc = await loadingTask.promise
  return {
    file,
    doc,
    pageCount: doc.numPages,
    metadata: {
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    },
  }
}
