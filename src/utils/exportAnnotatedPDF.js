import { PDFDocument, PDFName, PDFString, PDFArray, PDFRef } from 'pdf-lib'

function hexToRgb01(hex) {
  const h = (hex || '#ff0000').replace('#', '').padEnd(6, '0')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

function nowPDFDate() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `D:${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function buildAnnot(pdfDoc, shape, svgToPdf, dateStr) {
  const ctx = pdfDoc.context
  const sw = shape.strokeWidth ?? 2
  const [r, g, b] = hexToRgb01(shape.color)

  // Returns a plain JS object whose values are already PDFObjects;
  // ctx.obj({...common()}) passes PDFObject values through unchanged.
  const common = (subtype, rect) => ({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of(subtype),
    Rect: ctx.obj(rect),
    C: ctx.obj([r, g, b]),
    F: 4,
    M: PDFString.of(dateStr),
    BS: ctx.obj({ W: sw, S: PDFName.of('S') }),
  })

  if (shape.type === 'rect' || shape.type === 'circle') {
    const [px1, py1] = svgToPdf(Math.min(shape.x1, shape.x2), Math.min(shape.y1, shape.y2))
    const [px2, py2] = svgToPdf(Math.max(shape.x1, shape.x2), Math.max(shape.y1, shape.y2))
    const rect = [Math.min(px1, px2), Math.min(py1, py2), Math.max(px1, px2), Math.max(py1, py2)]
    return ctx.obj(common(shape.type === 'rect' ? 'Square' : 'Circle', rect))
  }

  if (shape.type === 'line' || shape.type === 'arrow') {
    const [lx1, ly1] = svgToPdf(shape.x1, shape.y1)
    const [lx2, ly2] = svgToPdf(shape.x2, shape.y2)
    const pad = sw * 3
    const rect = [
      Math.min(lx1, lx2) - pad, Math.min(ly1, ly2) - pad,
      Math.max(lx1, lx2) + pad, Math.max(ly1, ly2) + pad,
    ]
    const dict = ctx.obj({ ...common('Line', rect), L: ctx.obj([lx1, ly1, lx2, ly2]) })
    if (shape.type === 'arrow') {
      const le = PDFArray.withContext(ctx)
      le.push(PDFName.of('None'))
      le.push(PDFName.of('ClosedArrow'))
      dict.set(PDFName.of('LE'), le)
    }
    return dict
  }

  if (shape.type === 'pen' || shape.type === 'marker') {
    if (!shape.points?.length) return null
    const pdfPts = shape.points.map(({ x, y }) => svgToPdf(x, y))
    const flat = pdfPts.flatMap(([x, y]) => [x, y])
    const xs = pdfPts.map(([x]) => x)
    const ys = pdfPts.map(([, y]) => y)
    const actualSW = shape.type === 'marker' ? sw * 5 : sw
    const pad = actualSW * 2
    const rect = [
      Math.min(...xs) - pad, Math.min(...ys) - pad,
      Math.max(...xs) + pad, Math.max(...ys) + pad,
    ]
    const inkList = PDFArray.withContext(ctx)
    inkList.push(ctx.obj(flat))
    return ctx.obj({
      ...common('Ink', rect),
      BS: ctx.obj({ W: actualSW, S: PDFName.of('S') }),
      InkList: inkList,
    })
  }

  if (shape.type === 'textbox' || shape.type === 'callout') {
    const [px1, py1] = svgToPdf(Math.min(shape.x1, shape.x2), Math.min(shape.y1, shape.y2))
    const [px2, py2] = svgToPdf(Math.max(shape.x1, shape.x2), Math.max(shape.y1, shape.y2))
    const rect = [Math.min(px1, px2), Math.min(py1, py2), Math.max(px1, px2), Math.max(py1, py2)]
    const fs = shape.fontSize ?? 14
    const daStr = `/Helvetica ${fs} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`
    const dict = ctx.obj({
      ...common('FreeText', rect),
      Contents: PDFString.of(shape.text || ''),
      DA: PDFString.of(daStr),
    })
    if (shape.type === 'callout' && shape.tx != null) {
      const [tlx, tly] = svgToPdf(shape.tx, shape.ty)
      // CL: [tailTipX, tailTipY, endX, endY] — end point at bottom-centre of box
      const endX = (rect[0] + rect[2]) / 2
      const endY = rect[1]
      dict.set(PDFName.of('IT'), PDFName.of('FreeTextCallout'))
      dict.set(PDFName.of('CL'), ctx.obj([tlx, tly, endX, endY]))
    }
    return dict
  }

  return null
}

export async function exportAnnotatedPDF(pdfFile, annotations, pdfJSDoc) {
  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
  const pages = pdfDoc.getPages()
  const dateStr = nowPDFDate()

  for (const [pageNumStr, shapes] of Object.entries(annotations)) {
    if (!shapes?.length) continue
    const pageNum = parseInt(pageNumStr, 10)
    const page = pages[pageNum - 1]
    if (!page) continue

    const pdfJSPage = await pdfJSDoc.getPage(pageNum)
    const viewport = pdfJSPage.getViewport({ scale: 1 })
    // Convert SVG viewBox coords (top-left origin) → PDF user space (bottom-left origin)
    const svgToPdf = (svgX, svgY) =>
      typeof viewport.convertToPdfPoint === 'function'
        ? viewport.convertToPdfPoint(svgX, svgY)
        : [svgX, viewport.height - svgY]

    // Get or create the page's Annots array
    const annotsKey = PDFName.of('Annots')
    const annotsVal = page.node.get(annotsKey)
    let annotsArray
    if (!annotsVal) {
      annotsArray = PDFArray.withContext(pdfDoc.context)
      page.node.set(annotsKey, annotsArray)
    } else {
      annotsArray = annotsVal instanceof PDFRef
        ? pdfDoc.context.lookup(annotsVal)
        : annotsVal
    }

    for (const shape of shapes) {
      const dict = buildAnnot(pdfDoc, shape, svgToPdf, dateStr)
      if (!dict) continue
      annotsArray.push(pdfDoc.context.register(dict))
    }
  }

  return pdfDoc.save()
}
