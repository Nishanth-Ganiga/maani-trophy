import Cocoa
import PDFKit
// usage: pdfjoin out.pdf in1.pdf in2.pdf ...   (merges single/multi-page PDFs by redrawing every page)
let a = CommandLine.arguments
var box = CGRect(x: 0, y: 0, width: 595.28, height: 841.89)
guard let ctx = CGContext(URL(fileURLWithPath: a[1]) as CFURL, mediaBox: &box, nil) else { exit(1) }
for path in a[2...] {
    guard let doc = CGPDFDocument(URL(fileURLWithPath: path) as CFURL) else { continue }
    for n in 1...max(1, doc.numberOfPages) {
        guard let pg = doc.page(at: n) else { continue }
        let r = pg.getBoxRect(.mediaBox)
        ctx.beginPDFPage(nil)
        ctx.saveGState()
        ctx.scaleBy(x: box.width / r.width, y: box.height / r.height)
        ctx.translateBy(x: -r.origin.x, y: -r.origin.y)
        ctx.drawPDFPage(pg)
        ctx.restoreGState()
        ctx.endPDFPage()
    }
}
ctx.closePDF()
