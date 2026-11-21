import Cocoa
import WebKit
import PDFKit

// usage: html2pdf out.pdf page1.html page2.html ...   (each html = one A4 page, 794x1123 CSS px)
let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: html2pdf out.pdf in1.html ..."); exit(2) }
let outURL = URL(fileURLWithPath: args[1])
let inputs = Array(args[2...]).map { URL(fileURLWithPath: $0) }
let W: CGFloat = 794, H: CGFloat = 1123

DispatchQueue.global().asyncAfter(deadline: .now() + 180) { print("timeout"); exit(3) }

final class Runner: NSObject, WKNavigationDelegate {
    var web: WKWebView
    var win: NSWindow
    var pages: [Data] = []
    var index = 0
    override init() {
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: W, height: H), configuration: WKWebViewConfiguration())
        win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: W, height: H), styleMask: [.borderless], backing: .buffered, defer: false)
        win.contentView = web
        super.init()
        web.navigationDelegate = self
    }
    func merge() {
        var box = CGRect(x: 0, y: 0, width: W * 0.75, height: H * 0.75) // A4 in points
        guard let ctx = CGContext(outURL as CFURL, mediaBox: &box, nil) else { print("cannot create pdf"); exit(1) }
        for data in pages {
            guard let prov = CGDataProvider(data: data as CFData), let src = CGPDFDocument(prov), let pg = src.page(at: 1) else { continue }
            let r = pg.getBoxRect(.mediaBox)
            ctx.beginPDFPage(nil)
            ctx.saveGState()
            ctx.scaleBy(x: box.width / r.width, y: box.height / r.height)
            ctx.translateBy(x: -r.origin.x, y: -r.origin.y)
            ctx.drawPDFPage(pg)
            ctx.restoreGState()
            ctx.endPDFPage()
        }
        ctx.closePDF()
        print("done", pages.count)
        exit(0)
    }
    func loadNext() {
        if index >= inputs.count { merge(); return }
        // fresh web view for every page so its images are painted reliably
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: W, height: H), configuration: WKWebViewConfiguration())
        win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: W, height: H), styleMask: [.borderless], backing: .buffered, defer: false)
        win.contentView = web
        web.navigationDelegate = self
        web.loadFileURL(inputs[index], allowingReadAccessTo: URL(fileURLWithPath: "/"))
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let js = "Promise.all([...document.images].map(i => i.decode().catch(() => null))).then(() => true)"
        web.callAsyncJavaScript(js, arguments: [:], in: nil, in: .page) { _ in
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                let cfg = WKPDFConfiguration()
                cfg.rect = CGRect(x: 0, y: 0, width: W, height: H)
                self.web.createPDF(configuration: cfg) { result in
                    switch result {
                    case .success(let data):
                        self.pages.append(data)
                        self.index += 1
                        self.loadNext()
                    case .failure(let e): print("pdf error:", e); exit(1)
                    }
                }
            }
        }
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { print("fail:", error); exit(1) }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { print("fail:", error); exit(1) }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let runner = Runner()
runner.loadNext()
app.run()
