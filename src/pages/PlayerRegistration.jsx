import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { ROLES, JERSEY_SIZES, MAX_PHOTO_BYTES, PHOTO_TYPES, PHOTO_BUCKET } from "../lib/options";
import { NotConfigured } from "./Shared";
import "./Pages.css";

const empty = { full_name: "", role: "", jersey_name: "", jersey_size: "" };

export default function PlayerRegistration() {
  const [f, setF] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    setStatus(null);
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      e.target.value = "";
      return setStatus({ ok: false, text: "ಕೇವಲ PNG ಅಥವಾ JPEG ಚಿತ್ರಗಳನ್ನು ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು." });
    }
    if (file.size > MAX_PHOTO_BYTES) {
      e.target.value = "";
      return setStatus({ ok: false, text: "ಚಿತ್ರದ ಗಾತ್ರ 2 MB ಗಿಂತ ಹೆಚ್ಚು ಇರಬಾರದು." });
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
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
      photo_url: data.publicUrl,
      role: f.role,
      jersey_name: f.jersey_name.trim(),
      jersey_size: f.jersey_size,
    });
    setBusy(false);
    if (error) {
      await supabase.storage.from(PHOTO_BUCKET).remove([path]);
      return setStatus({ ok: false, text: "ನೋಂದಣಿ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ." });
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
          <p className="sub">ಮಾಣಿ ಟ್ರೋಫಿಯಲ್ಲಿ ಆಡಲು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.</p>

          <div className="note">
            <b>ಗಮನಿಸಿ:</b> ತಂಡದ ಜೆರ್ಸಿ ಪಡೆಯಲು ಪ್ರತಿ ಆಟಗಾರರು ₹200 ನೋಂದಣಿ ಶುಲ್ಕವನ್ನು ಪಾವತಿಸುವುದು ಕಡ್ಡಾಯ.
          </div>

          <NotConfigured />
          {status && <div className={"msg " + (status.ok ? "ok" : "err")}>{status.text}</div>}

          <div className="field">
            <label>ಆಟಗಾರರ ಹೆಸರು *</label>
            <input required value={f.full_name} onChange={set("full_name")} />
          </div>

          <div className="field">
            <label>ಆಟಗಾರರ ಭಾವಚಿತ್ರ * (PNG / JPEG, ಗರಿಷ್ಠ 2 MB)</label>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={pickPhoto} />
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
              <input required maxLength={15} value={f.jersey_name} onChange={set("jersey_name")} />
            </div>
            <div className="field">
              <label>ಜೆರ್ಸಿ ಗಾತ್ರ *</label>
              <select required value={f.jersey_size} onChange={set("jersey_size")}>
                <option value="">— ಗಾತ್ರ —</option>
                {JERSEY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button className="btn" disabled={busy}>{busy ? "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…" : "ನೋಂದಣಿ ಮಾಡಿ"}</button>
        </form>
      </div>
    </>
  );
}
