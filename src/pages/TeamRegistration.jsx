import { useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { PLACES } from "../lib/places";
import { brandify } from "../lib/brand";
import { NotConfigured, cleanPhone, validPhone } from "./Shared";
import "./Pages.css";

const empty = { team_name: "", owner_name: "", phone: "", place: "" };

export default function TeamRegistration() {
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!validPhone(f.phone))
      return setStatus({ ok: false, text: "ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ." });
    if (!supabase) return setStatus({ ok: false, text: "ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ." });
    setBusy(true);
    const { error } = await supabase.from("teams").insert({
      team_name: f.team_name.trim(),
      owner_name: f.owner_name.trim(),
      phone: cleanPhone(f.phone),
      place: f.place,
    });
    setBusy(false);
    if (error)
      return setStatus({
        ok: false,
        text: error.code === "23505"
          ? "ಈ ಹೆಸರಿನ ತಂಡ ಈಗಾಗಲೇ ನೋಂದಣಿಯಾಗಿದೆ. ಬೇರೆ ಹೆಸರು ಬಳಸಿ."
          : "ನೋಂದಣಿ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
      });
    setStatus({ ok: true, text: "🏆 ನಿಮ್ಮ ತಂಡದ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ಧನ್ಯವಾದಗಳು." });
    setF(empty);
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <form className="card" onSubmit={submit}>
          <h2>ತಂಡ ನೋಂದಣಿ</h2>
          <p className="sub">{brandify("ಮಾಣಿ ಟ್ರೋಫಿಗಾಗಿ ನಿಮ್ಮ ತಂಡದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.")}</p>
          <div className="note">
            <b>ಗಮನಿಸಿ:</b>
            <ul>
              <li>ಪ್ರತಿ ತಂಡದ ಪ್ರವೇಶ ಶುಲ್ಕ: ₹3,000.</li>
              <li>ತಂಡ ನೋಂದಣಿಗಾಗಿ ತಂಡದ ಮಾಲೀಕರು ಮುಂಗಡವಾಗಿ ₹1,000 ಪಾವತಿಸಬೇಕು.</li>
              <li>ತಂಡ ನೋಂದಣಿಗೆ ಕೊನೆಯ ದಿನಾಂಕ: 25 ಡಿಸೆಂಬರ್ 2026.</li>
            </ul>
          </div>
          <NotConfigured />
          {status && <div className={"msg " + (status.ok ? "ok" : "err")}>{status.text}</div>}
          <div className="field">
            <label>ತಂಡದ ಹೆಸರು *</label>
            <input required value={f.team_name} onChange={set("team_name")} />
          </div>
          <div className="field">
            <label>ಮಾಲೀಕರ ಹೆಸರು *</label>
            <input required value={f.owner_name} onChange={set("owner_name")} />
          </div>
          <div className="field">
            <label>ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *</label>
            <input required inputMode="numeric" maxLength={10} value={f.phone} onChange={set("phone")} />
          </div>
          <div className="field">
            <label>ಊರು *</label>
            <select required value={f.place} onChange={set("place")}>
              <option value="">— ಊರು ಆಯ್ಕೆ ಮಾಡಿ —</option>
              {PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button className="btn" disabled={busy}>{busy ? "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…" : "ನೋಂದಣಿ ಮಾಡಿ"}</button>
        </form>
      </div>
    </>
  );
}
