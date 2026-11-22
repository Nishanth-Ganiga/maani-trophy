import Cocoa
import WebKit

// usage: snap out.png width height url [js-to-run-before-snapshot] [delaySeconds]
let a = CommandLine.arguments
let outURL = URL(fileURLWithPath: a[1])
let W = CGFloat(Double(a[2])!), H = CGFloat(Double(a[3])!)
let url = URL(string: a[4])!
let js = a.count > 5 ? a[5] : ""
let delay = a.count > 6 ? Double(a[6])! : 2.0
let snapW = a.count > 7 ? Double(a[7])! : Double(W) * 2
DispatchQueue.global().asyncAfter(deadline: .now() + 60) { print("timeout"); exit(3) }

// serves /tmp/vid/site under app://site/ so module scripts and lazy chunks load like on a real server
final class Handler: NSObject, WKURLSchemeHandler {
    let root = "/tmp/vid/site"
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        var path = task.request.url?.path ?? "/index.html"
        if path == "/" || path.isEmpty { path = "/index.html" }
        let file = root + path
        guard let data = FileManager.default.contents(atPath: file) else {
            task.didReceive(HTTPURLResponse(url: task.request.url!, statusCode: 404, httpVersion: nil, headerFields: nil)!)
            task.didFinish(); return
        }
        let ext = (file as NSString).pathExtension.lowercased()
        let mime = ["html": "text/html", "js": "text/javascript", "css": "text/css", "png": "image/png", "webp": "image/webp", "svg": "image/svg+xml", "jpg": "image/jpeg"][ext] ?? "application/octet-stream"
        let resp = HTTPURLResponse(url: task.request.url!, statusCode: 200, httpVersion: nil, headerFields: ["Content-Type": mime + "; charset=utf-8", "Content-Length": "\(data.count)"])!
        task.didReceive(resp); task.didReceive(data); task.didFinish()
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

final class S: NSObject, WKNavigationDelegate {
    let web: WKWebView = {
        let c = WKWebViewConfiguration()
        c.setURLSchemeHandler(Handler(), forURLScheme: "app")
        return WKWebView(frame: NSRect(x: 0, y: 0, width: W, height: H), configuration: c)
    }()
    let win: NSWindow
    override init() {
        win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: W, height: H), styleMask: [.borderless], backing: .buffered, defer: false)
        win.contentView = web
        super.init()
        web.navigationDelegate = self
    }
    func start() {
        win.alphaValue = 0.01; win.ignoresMouseEvents = true; win.level = .normal; win.orderFrontRegardless()
        if url.scheme == "app" { web.load(URLRequest(url: url)) } else { web.loadFileURL(url, allowingReadAccessTo: URL(fileURLWithPath: "/")) } }
    func webView(_ w: WKWebView, didFinish n: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
            let run: (@escaping () -> Void) -> Void = { done in
                if js.isEmpty { done(); return }
                self.web.evaluateJavaScript(js) { _, e in if let e = e { print("js error:", e) }; DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { done() } }
            }
            run {
                let cfg = WKSnapshotConfiguration()
                cfg.rect = CGRect(x: 0, y: 0, width: W, height: H)
                cfg.snapshotWidth = NSNumber(value: snapW)
                self.web.takeSnapshot(with: cfg) { img, err in
                    guard let img = img, let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff), let png = rep.representation(using: .png, properties: [:]) else { print("snap fail", err as Any); exit(1) }
                    try! png.write(to: outURL)
                    print("saved", outURL.lastPathComponent); exit(0)
                }
            }
        }
    }
}
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let s = S(); s.start(); app.run()
