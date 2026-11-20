import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { PHOTO_BUCKET } from "../lib/options";
import { NotConfigured } from "./Shared";
import "./Pages.css";

const toCSV = (rows) => {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "﻿" + [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
};
const download = (name, rows) => {
  const url = URL.createObjectURL(new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};
const ROLE_EN = { wicketkeeper: "Wicketkeeper", batsman: "Batsman", bowler: "Bowler", allrounder: "All-rounder" };
const roleEn = (v) => ROLE_EN[v] || v || "—";
const fmt = (d) => new Date(d).toLocaleString("en-IN");

function Login({ onDone }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!supabase) return setErr("ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ.");
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr("ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ.");
    else onDone();
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>ನಿರ್ವಾಹಕ ಲಾಗಿನ್</h2>
      <p className="sub">ಈ ಪುಟ ಆಯೋಜಕರಿಗೆ ಮಾತ್ರ.</p>
      <NotConfigured />
      {err && <div className="msg err">{err}</div>}
      <div className="field">
        <label>ಇಮೇಲ್</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>ಪಾಸ್‌ವರ್ಡ್</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn" disabled={busy}>{busy ? "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ…" : "ಲಾಗಿನ್"}</button>
    </form>
  );
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("teams");
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const [t, p] = await Promise.all([
      supabase.from("teams").select("*").order("created_at", { ascending: false }),
      supabase.from("players").select("*").order("created_at", { ascending: false }),
    ]);
    if (t.error || p.error) return setErr("Could not load data. Check that your user is added to the admins table.");
    setErr(""); setTeams(t.data); setPlayers(p.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (table, id, photoUrl) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    await supabase.from(table).delete().eq("id", id);
    if (photoUrl) await supabase.storage.from(PHOTO_BUCKET).remove([photoUrl.split("/").pop()]);
    load();
  };
  const match = (r) => JSON.stringify(Object.values(r)).toLowerCase().includes(q.toLowerCase());
  const rows = (tab === "teams" ? teams : players).filter(match);

  return (
    <div className="card wide">
      <h2>Admin Dashboard</h2>
      <p className="sub">Total teams: {teams.length} · Total players: {players.length}</p>
      {err && <div className="msg err">{err}</div>}
      <div className="toolbar">
        <button className={"btn small tab " + (tab === "teams" ? "active" : "ghost")} onClick={() => setTab("teams")}>Teams</button>
        <button className={"btn small tab " + (tab === "players" ? "active" : "ghost")} onClick={() => setTab("players")}>Players</button>
        <input
          placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ padding: ".5rem 1rem", borderRadius: 20, border: "2px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.08)", color: "#fff", fontFamily: "inherit" }}
        />
        <button className="btn small" onClick={() => download(tab + ".csv", rows)}>Download CSV</button>
        <button className="btn small ghost" onClick={load}>Refresh</button>
        <button className="btn small danger" onClick={onLogout}>Log out</button>
      </div>

      <div className="table-wrap">
        {tab === "teams" ? (
          <table>
            <thead><tr><th>Team</th><th>Owner</th><th>Mobile</th><th>Place</th><th>Registered on</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.team_name}</td><td>{r.owner_name}</td><td>{r.phone}</td><td>{r.place}</td>
                  <td>{fmt(r.created_at)}</td>
                  <td><button className="btn small danger" onClick={() => remove("teams", r.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Photo</th><th>Name</th><th>Role</th><th>Jersey name</th><th>Jersey size</th><th>Registered on</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.photo_url ? <a href={r.photo_url} target="_blank" rel="noreferrer"><img className="thumb" src={r.photo_url} alt="" /></a> : "—"}</td>
                  <td>{r.full_name}</td><td>{roleEn(r.role)}</td><td>{r.jersey_name}</td><td>{r.jersey_size}</td>
                  <td>{fmt(r.created_at)}</td>
                  <td><button className="btn small danger" onClick={() => remove("players", r.id, r.photo_url)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!rows.length && <p className="sub" style={{ marginTop: "1rem" }}>No records found.</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    if (!supabase) return setSession(null);
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const logout = () => supabase.auth.signOut();

  return (
    <>
      <Navbar />
      <div className="page">
        {session === undefined ? null : session ? (
          <Dashboard onLogout={logout} />
        ) : (
          <Login onDone={() => {}} />
        )}
      </div>
    </>
  );
}
