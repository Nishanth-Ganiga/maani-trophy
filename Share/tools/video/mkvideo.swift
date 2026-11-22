import Foundation
import AVFoundation
import CoreGraphics
import ImageIO
import CoreVideo

// usage: mkvideo out.mp4 list.txt   (each line: scene.png|narration.aiff)  -> 1080x1920 video, slow zoom, narration audio
let a = CommandLine.arguments
let outURL = URL(fileURLWithPath: a[1])
let lines = try! String(contentsOfFile: a[2], encoding: .utf8).split(separator: "\n").map(String.init)
struct Scene { var img: CGImage; var audio: URL; var start: Double; var dur: Double }
let W = 720, H = 1280, FPS = 15.0
var scenes: [Scene] = []
var t = 0.0
for l in lines {
    let p = l.components(separatedBy: "|")
    guard p.count == 2 else { continue }
    let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: p[0]) as CFURL, nil)!
    let img = CGImageSourceCreateImageAtIndex(src, 0, nil)!
    let au = URL(fileURLWithPath: p[1])
    let d = CMTimeGetSeconds(AVURLAsset(url: au).duration) + 1.0
    scenes.append(Scene(img: img, audio: au, start: t, dur: d))
    t += d
}
let total = t
print("scenes:", scenes.count, "duration:", Int(total), "s")

let tmpVideo = URL(fileURLWithPath: NSTemporaryDirectory() + "mk_video.mov")
try? FileManager.default.removeItem(at: tmpVideo)
let writer = try! AVAssetWriter(outputURL: tmpVideo, fileType: .mov)
let vin = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H, AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 700_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264MainAutoLevel, AVVideoMaxKeyFrameIntervalKey: 30]])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: vin, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
writer.add(vin)
writer.startWriting(); writer.startSession(atSourceTime: .zero)

var frame = 0
let totalFrames = Int(total * FPS)
var si = 0
while frame < totalFrames {
    let time = Double(frame) / FPS
    while si + 1 < scenes.count && time >= scenes[si + 1].start { si += 1 }
    let sc = scenes[si]
    let prog = min(1, max(0, (time - sc.start) / sc.dur))
    let zoom = 1.0 + 0.045 * prog
    var pb: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
    let buf = pb!
    CVPixelBufferLockBaseAddress(buf, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(buf), width: W, height: H, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(buf), space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
    let w = Double(W) * zoom, h = Double(H) * zoom
    ctx.interpolationQuality = .high
    ctx.draw(sc.img, in: CGRect(x: (Double(W) - w) / 2, y: (Double(H) - h) / 2, width: w, height: h))
    CVPixelBufferUnlockBaseAddress(buf, [])
    while !vin.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.005) }
    adaptor.append(buf, withPresentationTime: CMTime(value: Int64(frame), timescale: Int32(FPS)))
    frame += 1
}
vin.markAsFinished()
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()

// mix narration
let comp = AVMutableComposition()
let vAsset = AVURLAsset(url: tmpVideo)
let vTrack = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
try! vTrack.insertTimeRange(CMTimeRange(start: .zero, duration: vAsset.duration), of: vAsset.tracks(withMediaType: .video)[0], at: .zero)
let aTrack = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!
for sc in scenes {
    let asset = AVURLAsset(url: sc.audio)
    if let tr = asset.tracks(withMediaType: .audio).first {
        try! aTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: tr, at: CMTime(seconds: sc.start + 0.3, preferredTimescale: 600))
    }
}
try? FileManager.default.removeItem(at: outURL)
let exp = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetPassthrough)!
exp.outputURL = outURL; exp.outputFileType = .mp4; exp.shouldOptimizeForNetworkUse = true
let sem2 = DispatchSemaphore(value: 0)
exp.exportAsynchronously { sem2.signal() }
sem2.wait()
print("export:", exp.status.rawValue, exp.error as Any)
exit(exp.status == .completed ? 0 : 1)
