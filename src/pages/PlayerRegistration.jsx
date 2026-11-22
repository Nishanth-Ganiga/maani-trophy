import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { ROLES, JERSEY_SIZES, MAX_PHOTO_BYTES, MAX_ORIGINAL_BYTES, PHOTO_TYPES, PHOTO_BUCKET } from "../lib/options";
import { compressImage } from "../lib/image";
import { brandify } from "../lib/brand";
import { NotConfigured, cleanPhone, validPhone } from "./Shared";
import "./Pages.css";

const empty = { full_name: "", phone: "", role: "", jersey_name: "", jersey_size: "" };

export default function PlayerRegistration() {
  const [f, setF] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [prepping, setPrepping] = useState(false);
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pickPhoto = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    setStatus(null);
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      input.value = "";
      return setStatus({ ok: false, text: "ಕೇವಲ PNG ಅಥವಾ JPEG ಚಿತ್ರಗಳನ್ನು ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು." });
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      input.value = "";
      return setStatus({ ok: false, text: "ಚಿತ್ರ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ. ದಯವಿಟ್ಟು ಚಿಕ್ಕ ಚಿತ್ರವನ್ನು ಆರಿಸಿ." });
    }
    setPrepping(true);
    try {
      // photos up to 2 MB are kept exactly as they are; only bigger ones are reduced (quality first, size last)
      const small = file.size <= MAX_PHOTO_BYTES ? file : await compressImage(file, MAX_PHOTO_BYTES);
      setPhoto(small);
      setPreview(URL.createObjectURL(small));
    } catch {
      input.value = "";
      setStatus({ ok: false, text: "ಚಿತ್ರವನ್ನು ಸಿದ್ಧಪಡಿಸಲು ಆಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಚಿತ್ರವನ್ನು ಆರಿಸಿ." });
    }
    setPrepping(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!validPhone(f.phone))
      return setStatus({ ok: false, text: "ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ." });
    if (!photo) return setStatus({ ok: false, text: "ದಯವಿಟ್ಟು ಆಟಗಾರರ ಭಾವಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ." });
    if (!supabase) return setStatus({ ok: false, text: "ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ." });
    setBusy(true);

    const ext = photo.type === "image/png" ? "png" : "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, photo, { contentType: photo.type });
    if (up.error) {
      setBusy(false);
      return setStatus({ ok: false, text: "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ." });
    }
    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

    const { error } = await supabase.from("players").insert({
      full_name: f.full_name.trim(),
      phone: cleanPhone(f.phone),
      photo_url: data.publicUrl,
      role: f.role,
      jersey_name: f.jersey_name.trim(),
      jersey_size: f.jersey_size,
    });
    setBusy(false);
    if (error) {
      await supabase.storage.from(PHOTO_BUCKET).remove([path]);
      console.error("player insert failed", error);
      return setStatus({ ok: false, text: "ನೋಂದಣಿ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.", detail: error.message });
    }
    setStatus({ ok: true, text: "🏆 ನಿಮ್ಮ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ಧನ್ಯವಾದಗಳು." });
    setF(empty); setPhoto(null); setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <form className="card" onSubmit={submit}>
          <h2>ಆಟಗಾರ ನೋಂದಣಿ</h2>
          <p className="sub">{brandify("ಮಾಣಿ ಟ್ರೋಫಿಯಲ್ಲಿ ಆಡಲು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.")}</p>

          <div className="note">
            <b>ಗಮನಿಸಿ:</b> ತಂಡದ ಜೆರ್ಸಿ ಪಡೆಯಲು ಪ್ರತಿ ಆಟಗಾರರು ₹200 ನೋಂದಣಿ ಶುಲ್ಕವನ್ನು ಪಾವತಿಸುವುದು ಕಡ್ಡಾಯ.<br />ಆಟಗಾರರ ನೋಂದಣಿಗೆ ಕೊನೆಯ ದಿನಾಂಕ: 25 ಡಿಸೆಂಬರ್ 2026.
          </div>

          <NotConfigured />
          {status && <div className={"msg " + (status.ok ? "ok" : "err")}>{status.text}{status.detail && <small className="detail">Error: {status.detail}</small>}</div>}

          <div className="field">
            <label>ಆಟಗಾರರ ಹೆಸರು *</label>
            <input required autoComplete="name" enterKeyHint="next" value={f.full_name} onChange={set("full_name")} />
          </div>

          <div className="field">
            <label>ಆಟಗಾರರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *</label>
            <input required type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[6-9][0-9]{9}" maxLength={10} enterKeyHint="next" value={f.phone} onChange={set("phone")} />
          </div>

          <div className="field">
            <label>ಆಟಗಾರರ ಭಾವಚಿತ್ರ * (PNG / JPEG)</label>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={pickPhoto} />
            {prepping && <span className="hint">ಚಿತ್ರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…</span>}
            {preview && <img src={preview} alt="ಪೂರ್ವವೀಕ್ಷಣೆ" className="photo-preview" />}
          </div>

          <div className="field">
            <label>ಆಟಗಾರರ ಪಾತ್ರ *</label>
            <select required value={f.role} onChange={set("role")}>
              <option value="">— ಪಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ —</option>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="row">
            <div className="field">
              <label>ಜೆರ್ಸಿ ಹೆಸರು *</label>
              <input required maxLength={15} autoCapitalize="characters" enterKeyHint="done" value={f.jersey_name} onChange={set("jersey_name")} />
            </div>
            <div className="field">
              <label>ಜೆರ್ಸಿ ಗಾತ್ರ *</label>
              <select required value={f.jersey_size} onChange={set("jersey_size")}>
                <option value="">— ಗಾತ್ರ —</option>
                {JERSEY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button className="btn" disabled={busy || prepping}>{busy ? "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…" : "ನೋಂದಣಿ ಮಾಡಿ"}</button>
        </form>
      </div>
    </>
  );
}
