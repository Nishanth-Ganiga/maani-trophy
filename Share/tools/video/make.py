import subprocess, os, sys, json, html

V = "/tmp/vid"
SNAP = f"{V}/tool/snap"
LOGO = "file:///tmp/vid/site/images/darkast-colony.webp"

JS_PRE = r'''
const set=(el,v)=>{const proto=el.tagName==="SELECT"?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,"value").set.call(el,v);el.dispatchEvent(new Event(el.tagName==="SELECT"?"change":"input",{bubbles:true}));};
const inputs=()=>[...document.querySelectorAll("form input")];
const sels=()=>[...document.querySelectorAll("form select")];
const hl=(el)=>{el.style.outline="5px solid #FFBC0D";el.style.outlineOffset="3px";el.style.boxShadow="0 0 0 10px rgba(255,188,13,.35), 0 0 36px 10px rgba(255,188,13,.85)";el.style.borderRadius=el.style.borderRadius||"14px";};
const view=(el)=>el.scrollIntoView({block:"center"});
const AVATAR="data:image/svg+xml;utf8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#2a3a66"/><circle cx="60" cy="46" r="22" fill="#cfd8ee"/><path d="M18 120c4-30 22-44 42-44s38 14 42 44z" fill="#cfd8ee"/></svg>');
'''

def js(body): return "(()=>{" + JS_PRE + body + "})()"

TEAM_VALS = '["ಬೈಂದೂರು ಸ್ಟ್ರೈಕರ್ಸ್","ರಮೇಶ್ ಶೆಟ್ಟಿ","9876543210"]'
def team_fill(n, sel=False):
    b = f"const v={TEAM_VALS};const i=inputs();for(let k=0;k<{n};k++)set(i[k],v[k]);"
    if sel: b += 'set(sels()[0],"ಯೋಜನಾನಗರ");'
    return b

def player_fill(name=False, photo=False, role=False, jname=False, jsize=False):
    b = "const i=inputs();"
    if name: b += 'set(i[0],"ಸುನಿಲ್ ಪೂಜಾರಿ");set(i[1],"9812345678");'
    if photo: b += 'const pf=i[2].parentElement;if(!pf.querySelector(".photo-preview")){const im=document.createElement("img");im.className="photo-preview";im.src=AVATAR;pf.appendChild(im);}'
    if role: b += 'set(sels()[0],"batsman");'
    if jname: b += 'set(i[3],"SUNIL");'
    if jsize: b += 'set(sels()[1],"L");'
    return b

SUCCESS_TEAM = "🏆 ನಿಮ್ಮ ತಂಡದ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ಧನ್ಯವಾದಗಳು."
SUCCESS_PLAYER = "🏆 ನಿಮ್ಮ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ಧನ್ಯವಾದಗಳು."
def success(text):
    return f'const card=document.querySelector("form.card");const m=document.createElement("div");m.className="msg ok";m.textContent="{text}";card.insertBefore(m,card.querySelector(".note").nextSibling);hl(m);view(m);'

CONTACT_NARR = ("ಯಾವುದೇ ಸಂದೇಹಗಳಿದ್ದರೆ, ರಮೇಶ್ ಲೋಬೋ, ಒಂಬತ್ತು ಮೂರು ಐದು ಮೂರು ಎಂಟು ಒಂಬತ್ತು ಆರು ಒಂಬತ್ತು ಒಂದು ಎಂಟು, "
                "ಅಥವಾ ಸುಜಯ್ ಆರ್ ಕೆ, ಒಂಬತ್ತು ಆರು ಒಂದು ಒಂದು ಒಂಬತ್ತು ಏಳು ಒಂದು ನಾಲ್ಕು ಶೂನ್ಯ ಐದು, ಇವರನ್ನು ಸಂಪರ್ಕಿಸಿ. ಎಲ್ಲರಿಗೂ ಶುಭವಾಗಲಿ!")

# scene kinds: title / shot / card / outro
TEAM = [
 dict(kind="title", title="ತಂಡ ನೋಂದಣಿ ಮಾಡುವುದು ಹೇಗೆ?", sub="ಮಾಣಿ ಟ್ರೋಫಿ 2027", emoji="👥",
      narr="ನಮಸ್ಕಾರ! ಮಾಣಿ ಟ್ರೋಫಿಗೆ ನಿಮ್ಮ ತಂಡವನ್ನು ನೋಂದಾಯಿಸುವುದು ಹೇಗೆ ಎಂದು, ಈ ವೀಡಿಯೊದಲ್ಲಿ ಹಂತ ಹಂತವಾಗಿ ನೋಡೋಣ."),
 dict(kind="shot", step=1, url="app://site/index.html", delay=4.5,
      js='const a=[...document.querySelectorAll(".nav-item")].find(e=>e.textContent.includes("ತಂಡ ನೋಂದಣಿ"));hl(a);',
      cap="ಮೆನುವಿನಲ್ಲಿ “ತಂಡ ನೋಂದಣಿ” ಒತ್ತಿ",
      narr="ಮೊದಲು ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ, ಮಾಣಿ ಟ್ರೋಫಿ ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಿರಿ. ನಂತರ ಮೇಲಿನ ಮೆನುವಿನಲ್ಲಿರುವ, ತಂಡ ನೋಂದಣಿ ಎಂಬುದನ್ನು ಒತ್ತಿ."),
 dict(kind="shot", step=2, url="app://site/index.html#/team", delay=3,
      js='const n=document.querySelector(".note");hl(n);view(n);',
      cap="“ಗಮನಿಸಿ” ಭಾಗವನ್ನು ಓದಿ",
      narr="ನೋಂದಣಿ ಫಾರ್ಮ್ ತೆರೆಯುತ್ತದೆ. ಮೇಲೆ ಇರುವ, ಗಮನಿಸಿ ಭಾಗವನ್ನು ಓದಿ. ತಂಡದ ಪ್ರವೇಶ ಶುಲ್ಕ ಮೂರು ಸಾವಿರ ರೂಪಾಯಿ. ತಂಡದ ಮಾಲೀಕರು ಮುಂಗಡವಾಗಿ ಒಂದು ಸಾವಿರ ರೂಪಾಯಿ ಪಾವತಿಸಬೇಕು."),
 dict(kind="shot", step=3, url="app://site/index.html#/team", delay=3,
      js=team_fill(1)+'hl(inputs()[0]);view(inputs()[0]);',
      cap="ತಂಡದ ಹೆಸರು ಬರೆಯಿರಿ",
      narr="ಮೊದಲ ಬಾಕ್ಸ್‌ನಲ್ಲಿ, ನಿಮ್ಮ ತಂಡದ ಹೆಸರನ್ನು ಬರೆಯಿರಿ."),
 dict(kind="shot", step=4, url="app://site/index.html#/team", delay=3,
      js=team_fill(2)+'hl(inputs()[1]);view(inputs()[1]);',
      cap="ಮಾಲೀಕರ ಹೆಸರು ಬರೆಯಿರಿ",
      narr="ಎರಡನೆಯ ಬಾಕ್ಸ್‌ನಲ್ಲಿ, ತಂಡದ ಮಾಲೀಕರ ಹೆಸರನ್ನು ಬರೆಯಿರಿ."),
 dict(kind="shot", step=5, url="app://site/index.html#/team", delay=3,
      js=team_fill(3)+'hl(inputs()[2]);view(inputs()[2]);',
      cap="10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      narr="ನಂತರ ಹತ್ತು ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ."),
 dict(kind="shot", step=6, url="app://site/index.html#/team", delay=3,
      js=team_fill(3, True)+'hl(sels()[0]);view(sels()[0]);',
      cap="ಪಟ್ಟಿಯಿಂದ ನಿಮ್ಮ ಊರನ್ನು ಆರಿಸಿ",
      narr="ಊರು ಎಂಬ ಪಟ್ಟಿಯನ್ನು ಒತ್ತಿ, ನಿಮ್ಮ ತಂಡದ ಊರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ."),
 dict(kind="shot", step=7, url="app://site/index.html#/team", delay=3,
      js=team_fill(3, True)+'const b=document.querySelector("form .btn");hl(b);view(b);',
      cap="“ನೋಂದಣಿ ಮಾಡಿ” ಬಟನ್ ಒತ್ತಿ",
      narr="ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸರಿಯಾಗಿ ತುಂಬಿದ ಮೇಲೆ, ನೋಂದಣಿ ಮಾಡಿ ಎಂಬ ಹಳದಿ ಬಟನ್ ಒತ್ತಿ."),
 dict(kind="shot", step=8, url="app://site/index.html#/team", delay=3,
      js=success(SUCCESS_TEAM),
      cap="ಯಶಸ್ವಿ ಸಂದೇಶ ಕಾಣಿಸಿದರೆ ನೋಂದಣಿ ಪೂರ್ಣ ✅",
      narr="ನಿಮ್ಮ ತಂಡದ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ ಎಂಬ ಸಂದೇಶ ಕಾಣಿಸಿದರೆ, ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ."),
 dict(kind="card", title="💰 ಪಾವತಿ ಮತ್ತು ಕೊನೆಯ ದಿನಾಂಕ",
      items=["ತಂಡದ ಪ್ರವೇಶ ಶುಲ್ಕ: ₹3,000", "ಮಾಲೀಕರು ಮುಂಗಡ ಪಾವತಿ: ₹1,000", "ಪಾವತಿ ವಿವರಗಳಿಗೆ ಸಂಘಟಕರನ್ನು ಸಂಪರ್ಕಿಸಿ", "ಕೊನೆಯ ದಿನಾಂಕ: 25 ಡಿಸೆಂಬರ್ 2026", "ಒಟ್ಟು 16 ತಂಡಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ"],
      narr="ಕೊನೆಯದಾಗಿ, ಮುಂಗಡ ಒಂದು ಸಾವಿರ ರೂಪಾಯಿ ಪಾವತಿಸಲು, ಸಂಘಟಕರನ್ನು ಸಂಪರ್ಕಿಸಿ. ತಂಡ ನೋಂದಣಿಯ ಕೊನೆಯ ದಿನಾಂಕ, ಡಿಸೆಂಬರ್ ಇಪ್ಪತ್ತೈದು, ಎರಡು ಸಾವಿರದ ಇಪ್ಪತ್ತಾರು. ಒಟ್ಟು ಹದಿನಾರು ತಂಡಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ, ಹಾಗಾಗಿ ಬೇಗ ನೋಂದಾಯಿಸಿ."),
 dict(kind="outro", narr=CONTACT_NARR),
]

PLAYER = [
 dict(kind="title", title="ಆಟಗಾರ ನೋಂದಣಿ ಮಾಡುವುದು ಹೇಗೆ?", sub="ಮಾಣಿ ಟ್ರೋಫಿ 2027", emoji="🏏",
      narr="ನಮಸ್ಕಾರ! ಮಾಣಿ ಟ್ರೋಫಿಯಲ್ಲಿ ಆಟಗಾರರಾಗಿ ನೋಂದಾಯಿಸುವುದು ಹೇಗೆ ಎಂದು, ಈ ವೀಡಿಯೊದಲ್ಲಿ ಹಂತ ಹಂತವಾಗಿ ನೋಡೋಣ."),
 dict(kind="shot", step=1, url="app://site/index.html", delay=4.5,
      js='const a=[...document.querySelectorAll(".nav-item")].find(e=>e.textContent.includes("ಆಟಗಾರ ನೋಂದಣಿ"));hl(a);',
      cap="ಮೆನುವಿನಲ್ಲಿ “ಆಟಗಾರ ನೋಂದಣಿ” ಒತ್ತಿ",
      narr="ಮೊದಲು ವೆಬ್‌ಸೈಟ್ ತೆರೆದು, ಮೇಲಿನ ಮೆನುವಿನಲ್ಲಿರುವ, ಆಟಗಾರ ನೋಂದಣಿ ಎಂಬುದನ್ನು ಒತ್ತಿ."),
 dict(kind="shot", step=2, url="app://site/index.html#/player", delay=3,
      js='const n=document.querySelector(".note");hl(n);view(n);',
      cap="ಜೆರ್ಸಿಗಾಗಿ ₹200 ಶುಲ್ಕ ಕಡ್ಡಾಯ",
      narr="ಗಮನಿಸಿ ಭಾಗದಲ್ಲಿ ಹೇಳಿದಂತೆ, ತಂಡದ ಜೆರ್ಸಿ ಪಡೆಯಲು, ಪ್ರತಿ ಆಟಗಾರರು ಇನ್ನೂರು ರೂಪಾಯಿ ನೋಂದಣಿ ಶುಲ್ಕವನ್ನು ಪಾವತಿಸುವುದು ಕಡ್ಡಾಯ."),
 dict(kind="shot", step=3, url="app://site/index.html#/player", delay=3,
      js=player_fill(name=True)+'hl(inputs()[0]);view(inputs()[0]);',
      cap="ಹೆಸರು ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      narr="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಮತ್ತು, ಹತ್ತು ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಬರೆಯಿರಿ."),
 dict(kind="shot", step=4, url="app://site/index.html#/player", delay=3,
      js=player_fill(name=True, photo=True)+'const f=inputs()[2].parentElement;hl(f);view(f);',
      cap="ನಿಮ್ಮ ಸ್ಪಷ್ಟ ಭಾವಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      narr="ನಿಮ್ಮ ಸ್ಪಷ್ಟವಾದ ಭಾವಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಪಿ ಎನ್ ಜಿ ಅಥವಾ ಜೆ ಪಿ ಇ ಜಿ ಚಿತ್ರ ಮಾತ್ರ ಸಾಧ್ಯ."),
 dict(kind="shot", step=5, url="app://site/index.html#/player", delay=3,
      js=player_fill(name=True, photo=True, role=True)+'hl(sels()[0]);view(sels()[0]);',
      cap="ನಿಮ್ಮ ಆಟದ ಪಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ",
      narr="ನಿಮ್ಮ ಆಟದ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ: ವಿಕೆಟ್ ಕೀಪರ್, ಬ್ಯಾಟ್ಸ್‌ಮನ್, ಬೌಲರ್, ಅಥವಾ ಆಲ್ ರೌಂಡರ್."),
 dict(kind="shot", step=6, url="app://site/index.html#/player", delay=3,
      js=player_fill(name=True, photo=True, role=True, jname=True, jsize=True)+'const r=inputs()[3].closest(".row");hl(r);view(r);',
      cap="ಜೆರ್ಸಿ ಹೆಸರು ಮತ್ತು ಗಾತ್ರ",
      narr="ಜೆರ್ಸಿಯ ಮೇಲೆ ಮುದ್ರಿಸಬೇಕಾದ ಹೆಸರನ್ನು ಬರೆದು, ನಿಮ್ಮ ಜೆರ್ಸಿ ಗಾತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ."),
 dict(kind="shot", step=7, url="app://site/index.html#/player", delay=3,
      js=player_fill(name=True, photo=True, role=True, jname=True, jsize=True)+'const b=document.querySelector("form .btn");hl(b);view(b);',
      cap="“ನೋಂದಣಿ ಮಾಡಿ” ಬಟನ್ ಒತ್ತಿ",
      narr="ನಂತರ, ನೋಂದಣಿ ಮಾಡಿ ಎಂಬ ಹಳದಿ ಬಟನ್ ಒತ್ತಿ."),
 dict(kind="shot", step=8, url="app://site/index.html#/player", delay=3,
      js=success(SUCCESS_PLAYER),
      cap="ಯಶಸ್ವಿ ಸಂದೇಶ ಕಾಣಿಸಿದರೆ ನೋಂದಣಿ ಪೂರ್ಣ ✅",
      narr="ನಿಮ್ಮ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ ಎಂಬ ಸಂದೇಶ ಕಾಣಿಸಿದರೆ, ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ."),
 dict(kind="card", title="💰 ಪಾವತಿ ಮತ್ತು ಕೊನೆಯ ದಿನಾಂಕ",
      items=["ಜೆರ್ಸಿಗಾಗಿ ನೋಂದಣಿ ಶುಲ್ಕ: ₹200", "ಪಾವತಿ ವಿವರಗಳಿಗೆ ಸಂಘಟಕರನ್ನು ಸಂಪರ್ಕಿಸಿ", "ಕೊನೆಯ ದಿನಾಂಕ: 25 ಡಿಸೆಂಬರ್ 2026", "ಒಬ್ಬರು ಒಂದು ಬಾರಿ ಮಾತ್ರ ನೋಂದಾಯಿಸಿ"],
      narr="ಜೆರ್ಸಿಗಾಗಿ ಇನ್ನೂರು ರೂಪಾಯಿ ಪಾವತಿಸಲು, ಸಂಘಟಕರನ್ನು ಸಂಪರ್ಕಿಸಿ. ಆಟಗಾರರ ನೋಂದಣಿಯ ಕೊನೆಯ ದಿನಾಂಕ, ಡಿಸೆಂಬರ್ ಇಪ್ಪತ್ತೈದು, ಎರಡು ಸಾವಿರದ ಇಪ್ಪತ್ತಾರು. ಒಬ್ಬರು ಒಂದು ಬಾರಿ ಮಾತ್ರ ನೋಂದಾಯಿಸಿ."),
 dict(kind="outro", narr=CONTACT_NARR),
]

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;font-family:"Noto Sans Kannada","Kohinoor Kannada",sans-serif;color:#fff;
 background:radial-gradient(circle at 80% 8%,#E07A12 0%,#8C3A0A 22%,#0E1A3D 58%,#050913 100%);position:relative}
.top{position:absolute;top:56px;left:60px;right:60px;display:flex;align-items:center;gap:22px}
.top img{width:96px;height:96px}
.top b{font-size:40px;color:#FFD25A;font-weight:900}
.top .chip{margin-left:auto;background:#FFBC0D;color:#111;border-radius:40px;padding:12px 34px;font-size:40px;font-weight:900}
.phone{position:absolute;top:200px;left:50%;transform:translateX(-50%);width:664px;height:1396px;border-radius:78px;
 background:#0b0f1d;border:10px solid #3b4468;box-shadow:0 40px 90px rgba(0,0,0,.65),0 0 0 6px rgba(255,188,13,.55);padding:22px;overflow:hidden}
.phone img{width:100%;height:100%;border-radius:56px;display:block;object-fit:cover}
.cap{position:absolute;left:50px;right:50px;bottom:70px;height:230px;display:flex;align-items:center;justify-content:center;text-align:center;
 font-size:62px;font-weight:900;line-height:1.35;color:#fff;background:rgba(255,255,255,.1);border:3px solid rgba(255,210,90,.7);border-radius:44px;padding:0 40px}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:90px;gap:44px}
.center img.logo{width:560px;height:560px}
.h1{font-size:96px;font-weight:900;line-height:1.35}
.sub{font-size:52px;font-weight:800;color:#FFD25A}
.emoji{font-size:150px}
.list{width:100%;display:flex;flex-direction:column;gap:30px}
.list div{background:rgba(255,255,255,.12);border:3px solid rgba(255,210,90,.7);border-radius:36px;padding:34px 44px;font-size:56px;font-weight:800;text-align:left;line-height:1.35}
.card-title{font-size:80px;font-weight:900;color:#FFD25A;line-height:1.35}
.tel{font-family:Helvetica,Arial,sans-serif;font-size:70px;font-weight:900;color:#111;letter-spacing:1px}
.cbox{width:100%;background:linear-gradient(160deg,#FFE08A,#FFBC0D);color:#111;border-radius:44px;padding:44px;font-size:60px;font-weight:900}
.link{font-family:Helvetica,Arial,sans-serif;font-size:50px;font-weight:800;color:#FFBC0D;word-break:break-all}
"""

def scene_html(sc, shot_path):
    k = sc["kind"]
    top = f'<div class="top"><img src="{LOGO}"><b>ಮಾಣಿ ಟ್ರೋಫಿ 2027</b>' + (f'<span class="chip">ಹಂತ {sc["step"]}</span>' if k=="shot" else '') + '</div>'
    if k == "title":
        body = f'<div class="center"><div class="emoji">{sc["emoji"]}</div><img class="logo" src="{LOGO}"><div class="h1">{sc["title"]}</div><div class="sub">{sc["sub"]}</div><div class="sub" style="font-size:44px;color:#fff">ದರ್ಖಾಸ್ತ್ ಕಾಲೋನಿ ಗೆಳೆಯರ ಬಳಗ</div></div>'
        top = ""
    elif k == "shot":
        body = f'<div class="phone"><img src="file://{shot_path}"></div><div class="cap">{sc["cap"]}</div>'
    elif k == "card":
        items = "".join(f"<div>{html.escape(i)}</div>" for i in sc["items"])
        body = f'<div class="center" style="justify-content:flex-start;padding-top:260px"><div class="card-title">{sc["title"]}</div><div class="list">{items}</div></div>'
    else:
        body = f'''<div class="center"><div class="card-title">📞 ಸಂದೇಹಗಳಿದ್ದರೆ ಸಂಪರ್ಕಿಸಿ</div>
        <div class="cbox">ರಮೇಶ್ ಲೋಬೋ<br><span class="tel">9353896918</span></div>
        <div class="cbox">ಸುಜಯ್ ಆರ್.ಕೆ<br><span class="tel">9611971405</span></div>
        <div class="link">https://maani-trophy.vercel.app</div>
        <div class="sub">ಎಲ್ಲರಿಗೂ ಶುಭವಾಗಲಿ! 🙏</div></div>'''
        top = ""
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{top}{body}</body></html>'

def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)

def build(name, scenes, only_shots=False):
    lst = []
    for i, sc in enumerate(scenes):
        base = f"{name}_{i:02d}"
        shot = f"{V}/shots/{base}.png"
        if sc["kind"] == "shot" and not os.path.exists(shot):
            run([SNAP, shot, "390", "844", sc["url"], js(sc["js"]), str(sc.get("delay", 3))], stdout=subprocess.DEVNULL)
        if only_shots: continue
        open(f"{V}/scenes/{base}.html", "w").write(scene_html(sc, shot))
        png = f"{V}/scenes/{base}.png"
        run([SNAP, png, "1080", "1920", f"file://{V}/scenes/{base}.html", "", "1.5", "540"], stdout=subprocess.DEVNULL)
        aud = f"{V}/audio/{base}.aiff"
        if not os.path.exists(aud):
            run(["say", "-v", "Soumya", "-r", "150", "-o", aud, sc["narr"]])
        lst.append(f"{png}|{aud}")
        print("ok", base, flush=True)
    if not only_shots:
        open(f"{V}/{name}.txt", "w").write("\n".join(lst))

if __name__ == "__main__":
    which = sys.argv[1]
    build("team", TEAM) if which == "team" else build("player", PLAYER)
