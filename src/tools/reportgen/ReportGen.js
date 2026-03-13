import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const COLUMNS = [
  { key: "counselling", label: "COUNSELLING", short: "CNSL", cumulative: true  },
  { key: "tro",         label: "TRO",         short: "TRO",  cumulative: true  },
  { key: "tc",          label: "TC",          short: "TC",   cumulative: false },
  { key: "tf",          label: "TF",          short: "TF",   cumulative: false },
  { key: "windowExp",   label: "WIN EXP",     short: "WIN EXP", cumulative: false, computed: true },
  { key: "session",     label: "SESSION",     short: "SESSION", cumulative: true  },
  { key: "sales",       label: "SALES",       short: "SALES", cumulative: false },
];

const computeWindowExp = (row) => {
  const tro = parseInt(row?.tro) || 0;
  const tc  = parseInt(row?.tc)  || 0;
  const tf  = parseInt(row?.tf)  || 0;
  return Math.max(0, tro - (tc + tf));
};

const emptyRow = () => ({ counselling: "", tro: "", tc: "", tf: "", session: "", sales: "" });
const getDisplayVal = (key, row) => key === "windowExp" ? computeWindowExp(row) : (parseInt(row?.[key]) || 0);

// Light theme color tiers — color is accent only, background stays white/light
const getColorTier = (key, val, avg) => {
  if (key === "tf" || key === "windowExp") return { accent: "#999", numColor: "#444", tier: "neutral" };
  const v = parseInt(val) || 0;
  const a = avg || 0;
  if (a === 0 && v === 0) return { accent: "#e53935", numColor: "#c62828", tier: "below" };
  if (a === 0 && v >  0)  return { accent: "#2e7d32", numColor: "#1b5e20", tier: "above" };
  const ratio = v / a;
  if (ratio > 1.05)  return { accent: "#2e7d32", numColor: "#1b5e20", tier: "above" };
  if (ratio >= 0.95) return { accent: "#f57c00", numColor: "#e65100", tier: "avg"   };
  return                    { accent: "#e53935", numColor: "#c62828", tier: "below" };
};

const LS_DATA_KEY  = "reportgen_data_v2";
const LS_TEAMS_KEY = "reportgen_teams_v2";

const defaultTeams = [
  { id: 1, name: "Team Nilargha", members: [
    "Avanesh Patrikar DS","BALAMBIGAI K DS","Chitwan DS","GIRISH KUMAR DS",
    "Ishita Mahendra DS","Kanchanam Abhishek DS","Laiba Azeem DS","NAVDESH MUNDEJA DS",
    "Saptarshi Banerjee DS","Shivam Raj DS","Shivam Shukla DS","Sumit Kumar DS",
  ]},
];

const HEADER_MAP = {
  "counselling":"counselling","counseling":"counselling","counsel":"counselling","counsell":"counselling",
  "tro":"tro","fresh tro":"tro","freshtro":"tro","fresh":"tro",
  "tc":"tc","tf":"tf",
  "window expired":"windowExp","windowexpired":"windowExp","window exp":"windowExp","window":"windowExp","windowexp":"windowExp",
  "session":"session","session done":"session","sessions":"session",
  "sales":"sales","sale":"sales",
  "owner":"__name__","squad":"__name__","name":"__name__","agent":"__name__","rep":"__name__",
};

function normalizeHeader(h) {
  return h.toLowerCase().replace(/[\r\n]+/g," ").replace(/\s+/g," ").replace(/[^a-z ]/g,"").trim();
}

function parsePaste(text, members) {
  const rows = text.trim().split("\n").map(r => r.split("\t").map(c => c.trim()));
  const result = {};
  if (rows.length < 2) return result;
  let headerRowIdx = -1, colMap = [];
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    const candidate = rows[i].map(normalizeHeader).map(h => HEADER_MAP[h] !== undefined ? HEADER_MAP[h] : null);
    if (candidate.filter(v => v && v !== "__name__").length >= 2) { headerRowIdx = i; colMap = candidate; break; }
  }
  if (headerRowIdx === -1) {
    const PIVOT_ORDER = ["counselling","tro","sales","session","tc","tf","windowExp"];
    rows.filter(r => r[0] && !r[0].toLowerCase().includes("total"))
      .forEach((row, i) => { if (i < members.length) { const obj = emptyRow(); PIVOT_ORDER.forEach((k,j) => { obj[k] = row[j+1]||"0"; }); result[members[i]] = obj; }});
    return result;
  }
  let nameColIdx = colMap.findIndex(v => v === "__name__");
  if (nameColIdx === -1) nameColIdx = colMap.findIndex(v => v === null);
  if (nameColIdx === -1) nameColIdx = 0;
  const normalize = s => s.toLowerCase().replace(/\s+ds$/i,"").replace(/[^a-z0-9]/g,"");
  rows.slice(headerRowIdx + 1)
    .filter(r => { const n = (r[nameColIdx]||"").toLowerCase(); return n && !n.includes("grand total") && !n.includes("total stats"); })
    .forEach(row => {
      const rawName = row[nameColIdx] || "";
      const rName = normalize(rawName);
      const matched = members.find(m => { const mName = normalize(m.split("@")[0].replace(/[._]/g," ")); return mName===rName||rName.includes(mName)||mName.includes(rName); });
      const obj = emptyRow();
      colMap.forEach((mappedKey, colIdx) => { if (mappedKey && mappedKey !== "__name__") obj[mappedKey] = row[colIdx]||"0"; });
      if (matched) result[matched] = obj;
      else if (rawName) result[rawName] = obj;
    });
  return result;
}

export default function ReportGen() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("home");

  // Load teams from localStorage or use defaults
  const [teams, setTeams] = useState(() => {
    try { const s = localStorage.getItem(LS_TEAMS_KEY); return s ? JSON.parse(s) : defaultTeams; } catch { return defaultTeams; }
  });

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newMember, setNewMember] = useState("");

  // Load report data from localStorage
  const [allReportData, setAllReportData] = useState(() => {
    try { const s = localStorage.getItem(LS_DATA_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const [showReport, setShowReport] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [pasteSuccess, setPasteSuccess] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const reportRef = useRef();

  // Persist teams to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem(LS_TEAMS_KEY, JSON.stringify(teams)); } catch {}
  }, [teams]);

  const reportData = selectedTeam ? (allReportData[selectedTeam.id] || {}) : {};

  const updateCell = (member, key, value) => {
    setAllReportData(prev => ({
      ...prev,
      [selectedTeam.id]: {
        ...(prev[selectedTeam.id] || {}),
        [member]: { ...(prev[selectedTeam.id]?.[member] || emptyRow()), [key]: value }
      }
    }));
  };

  // Manual save to localStorage
  const handleSave = () => {
    try {
      localStorage.setItem(LS_DATA_KEY, JSON.stringify(allReportData));
      setSaveMsg("✓ Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch { setSaveMsg("⚠ Save failed"); }
  };

  const openTeam = (team) => {
    setSelectedTeam(team);
    setAllReportData(prev => {
      const existing = prev[team.id] || {};
      const patched = { ...existing };
      team.members.forEach(m => { if (!patched[m]) patched[m] = emptyRow(); });
      return { ...prev, [team.id]: patched };
    });
    setShowReport(false); setPasteMode(false); setPasteText(""); setPasteError(""); setPasteSuccess("");
    setScreen("report");
  };

  const handlePasteImport = () => {
    if (!pasteText.trim()) { setPasteError("Nothing pasted yet."); return; }
    const parsed = parsePaste(pasteText, selectedTeam.members);
    const matched = Object.keys(parsed).filter(k => selectedTeam.members.includes(k));
    const unmatched = Object.keys(parsed).filter(k => !selectedTeam.members.includes(k));
    if (matched.length === 0) { setPasteError("No rows matched. Include the header row and name column."); return; }
    setAllReportData(prev => {
      const teamData = prev[selectedTeam.id] || {};
      const next = { ...teamData };
      matched.forEach(member => {
        const existing = teamData[member] || emptyRow();
        const incoming = parsed[member];
        const merged = { ...existing };
        COLUMNS.forEach(({ key, cumulative, computed }) => {
          if (computed) return;
          merged[key] = cumulative
            ? (parseInt(existing[key])||0) + (parseInt(incoming[key])||0)
            : (incoming[key] ?? existing[key]);
        });
        next[member] = merged;
      });
      return { ...prev, [selectedTeam.id]: next };
    });
    const msg = unmatched.length > 0
      ? `✓ ${matched.length} imported. ${unmatched.length} unmatched: ${unmatched.slice(0,2).join(", ")}`
      : `✓ All ${matched.length} players updated!`;
    setPasteSuccess(msg); setPasteError("");
    if (unmatched.length === 0) setTimeout(() => { setPasteMode(false); setPasteSuccess(""); setPasteText(""); }, 1800);
  };

  const totals = () => {
    const t = {}; COLUMNS.forEach(({ key }) => { t[key] = 0; });
    if (!selectedTeam) return t;
    selectedTeam.members.forEach(m => {
      COLUMNS.forEach(({ key, computed }) => { if (!computed) t[key] = (t[key]||0) + (parseInt(reportData[m]?.[key])||0); });
    });
    t.windowExp = Math.max(0, (t.tro||0) - ((t.tc||0) + (t.tf||0)));
    return t;
  };

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    setTeams(prev => [...prev, { id: Date.now(), name: newTeamName.trim(), members: [] }]);
    setNewTeamName(""); setShowAddTeam(false);
  };
  const deleteTeam = (id) => setTeams(prev => prev.filter(t => t.id !== id));
  const addMember = () => {
    if (!newMember.trim() || !editingTeam) return;
    setTeams(prev => prev.map(t => t.id === editingTeam.id ? { ...t, members: [...t.members, newMember.trim()] } : t));
    setEditingTeam(prev => ({ ...prev, members: [...prev.members, newMember.trim()] }));
    setNewMember("");
  };
  const removeMember = (teamId, member) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: t.members.filter(m => m !== member) } : t));
    if (editingTeam?.id === teamId) setEditingTeam(prev => ({ ...prev, members: prev.members.filter(m => m !== member) }));
  };

  const tot = totals();

  return (
    <div style={{ minHeight: "100vh", background: "#1a3a1a", fontFamily: "'Georgia', serif", color: "#e8f0e0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .btn { cursor: pointer; border: none; border-radius: 6px; font-family: 'Oswald', sans-serif; font-size: 13px; padding: 9px 20px; transition: all 0.18s; letter-spacing: 0.05em; font-weight: 600; }
        .btn-primary { background: linear-gradient(135deg, #f5a623, #e8831a); color: #1a1a1a; box-shadow: 0 3px 12px rgba(245,166,35,0.4); }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.2); color: #c8e0b8; }
        .btn-outline:hover { border-color: #f5a623; color: #f5a623; }
        .btn-save { background: #1a3a1a; border: 2px solid #4ade80; color: #4ade80; font-family: 'Oswald', sans-serif; font-size: 12px; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-weight: 700; letter-spacing: 0.06em; transition: all 0.18s; }
        .btn-save:hover { background: rgba(74,222,128,0.15); }
        .btn-green { background: linear-gradient(135deg, #2a9d5c, #1e7a44); color: #fff; }
        .btn-green:hover { transform: translateY(-1px); }
        .btn-danger { background: transparent; border: 1.5px solid rgba(255,100,100,0.4); color: #ff8888; padding: 5px 12px; font-size: 11px; border-radius: 5px; font-family: 'DM Mono', monospace; cursor: pointer; }
        .btn-reset { background: transparent; border: 1.5px solid rgba(255,100,100,0.35); color: #ff9999; font-family: 'Oswald', sans-serif; font-size: 12px; padding: 7px 14px; border-radius: 6px; cursor: pointer; transition: all 0.18s; }
        input, textarea { outline: none; background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.18); color: #e8f0e0; padding: 9px 13px; border-radius: 7px; font-family: 'DM Mono', monospace; font-size: 12px; }
        input:focus, textarea:focus { border-color: #f5a623; box-shadow: 0 0 0 3px rgba(245,166,35,0.2); }
        input::placeholder, textarea::placeholder { color: rgba(200,220,180,0.35); }
        .team-card { background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 22px; cursor: pointer; transition: all 0.22s; }
        .team-card:hover { background: rgba(255,255,255,0.09); border-color: #f5a623; transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }

        /* ── SCOREBOARD: light background, high contrast ── */
        .scoreboard { border-collapse: collapse; width: 100%; background: #fff; }
        .scoreboard thead tr th {
          background: #1e2d3d;
          color: #ffffff;
          padding: 11px 14px;
          font-family: 'Oswald', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-align: center;
          border: 1px solid #2c3e50;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .scoreboard thead tr th.name-col {
          text-align: left;
          padding-left: 18px;
          min-width: 180px;
          background: #152232;
          border-right: 2px solid #f5a623;
        }
        .scoreboard tbody tr:nth-child(even) td { background: #f8f9fa; }
        .scoreboard tbody tr.totals-row td { background: #1e2d3d !important; color: #f5a623 !important; }
        .scoreboard tbody tr.totals-row td.name-td { background: #152232 !important; color: #ffffff !important; }
        .scoreboard tbody tr:nth-child(odd) td { background: #ffffff; }
        .scoreboard tbody tr:hover td { background: #fff8ee !important; }
        .scoreboard tbody td {
          padding: 10px 14px;
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 15px;
          font-weight: 700;
          border: 1px solid #e0e0e0;
          color: #1a1a1a;
        }
        .scoreboard tbody td.name-td {
          text-align: left;
          padding-left: 18px;
          font-family: 'Oswald', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1e2d3d;
          border-right: 2px solid #f5a623;
          background: #f0f4f8 !important;
        }
        .totals-row td {
          background: #1e2d3d !important;
          color: #f5a623 !important;
          font-family: 'Oswald', sans-serif !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          letter-spacing: 0.06em;
          border-top: 2px solid #f5a623 !important;
        }
        .totals-row td.name-td {
          color: #ffffff !important;
          font-size: 12px !important;
          letter-spacing: 0.08em;
          background: #152232 !important;
        }

        .edit-input { width: 60px; background: #f0f4f8; border: 1.5px solid #cdd5e0; color: #1a1a1a; text-align: center; padding: 6px 4px; border-radius: 5px; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600; }
        .edit-input:focus { border-color: #f5a623; background: #fff8ee; box-shadow: 0 0 0 2px rgba(245,166,35,0.2); }

        .paste-zone { border: 2px dashed rgba(168,216,120,0.3); border-radius: 12px; padding: 22px; background: rgba(0,0,0,0.2); margin-bottom: 20px; }
        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 12px; border-radius: 20px; font-family: 'Oswald', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; }

        @keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to {opacity:1;transform:translateY(0);} }
        .fade-in { animation: fadeIn 0.25s ease; }

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .scoreboard { font-size: 11px !important; }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(90deg, #071a07, #0d2a0d)", borderBottom: "3px solid #f5a623", padding: "0 32px", display: "flex", alignItems: "center", gap: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#5a8a42', fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: 'pointer', padding: '20px 16px 20px 0', letterSpacing: '0.06em' }}>
          ← TOOLS
        </button>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', marginRight: 16 }} />
        <div style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
          <div style={{ width: 4, height: 36, background: "#f5a623", borderRadius: 2 }} />
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: "#f5a623", letterSpacing: "0.12em", lineHeight: 1 }}>REPORT GENERATOR</div>
            {screen === "report" && selectedTeam && (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7aaa58", marginTop: 3 }}>▶ {selectedTeam.name.toUpperCase()}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── HOME ── */}
      {screen === "home" && (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 34, fontWeight: 700, color: "#a8d878", letterSpacing: "0.06em", marginBottom: 6 }}>SQUAD MANAGER</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a8a42", letterSpacing: "0.05em" }}>SELECT A TEAM TO UPDATE THE SCOREBOARD</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16, marginBottom: 32 }}>
            {teams.map((t) => (
              <div key={t.id} className="team-card" onClick={() => openTeam(t)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f5a623" }} />
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, fontWeight: 700, color: "#f5a623", letterSpacing: "0.05em" }}>{t.name}</div>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a8a42", marginBottom: 16 }}>{t.members.length} PLAYERS</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-outline" style={{ fontSize: 11, padding: "5px 12px" }} onClick={(e) => { e.stopPropagation(); setEditingTeam(t); setScreen("team"); }}>✎ Edit</button>
                  <button className="btn-danger" onClick={(e) => { e.stopPropagation(); deleteTeam(t.id); }}>✕ Delete</button>
                </div>
              </div>
            ))}
          </div>
          {showAddTeam ? (
            <div style={{ background: "rgba(0,0,0,0.25)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 20, display: "flex", gap: 10, alignItems: "center" }}>
              <input placeholder="Team name…" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTeam()} style={{ flex: 1 }} autoFocus />
              <button className="btn btn-primary" onClick={addTeam}>Create</button>
              <button className="btn btn-outline" onClick={() => setShowAddTeam(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowAddTeam(true)}>+ NEW TEAM</button>
          )}
        </div>
      )}

      {/* ── TEAM EDIT ── */}
      {screen === "team" && editingTeam && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5a623", letterSpacing: "0.06em", marginBottom: 32 }}>✎ {editingTeam.name.toUpperCase()}</div>
          <div style={{ marginBottom: 24 }}>
            {editingTeam.members.map((m) => (
              <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: "#c8e0a8" }}>{m}</span>
                <button className="btn-danger" onClick={() => removeMember(editingTeam.id, m)}>✕ Remove</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
            <input placeholder="Player name (e.g. Rohit Sharma DS)" value={newMember} onChange={(e) => setNewMember(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMember()} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={addMember}>+ Add</button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={() => { setTeams(prev => prev.map(t => t.id === editingTeam.id ? editingTeam : t)); setScreen("home"); }}>✓ Save & Back</button>
            <button className="btn btn-outline" onClick={() => setScreen("home")}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── REPORT ── */}
      {screen === "report" && selectedTeam && (
        <div style={{ padding: "28px 20px" }}>
          {!showReport ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
                <div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 24, fontWeight: 700, color: "#a8d878", letterSpacing: "0.06em" }}>UPDATE SCORECARD</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a8a42", marginTop: 4 }}>paste from sheets or edit manually · data auto-saves on import</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn btn-green" onClick={() => { setPasteMode(!pasteMode); setPasteError(""); setPasteSuccess(""); }}>
                    {pasteMode ? "✕ Close" : "⌘ Paste from Sheets"}
                  </button>
                  <button className="btn-save" onClick={handleSave}>
                    {saveMsg || "💾 SAVE"}
                  </button>
                  <button className="btn-reset" onClick={() => {
                    if (window.confirm("Reset all scores for this team?")) {
                      const fresh = {}; selectedTeam.members.forEach(m => { fresh[m] = emptyRow(); });
                      setAllReportData(prev => { const next = { ...prev, [selectedTeam.id]: fresh }; try { localStorage.setItem(LS_DATA_KEY, JSON.stringify(next)); } catch {} return next; });
                    }
                  }}>↺ Reset</button>
                  <button className="btn btn-primary" onClick={() => setShowReport(true)}>VIEW SCOREBOARD →</button>
                </div>
              </div>

              {pasteMode && (
                <div className="paste-zone fade-in">
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, color: "#f5a623", marginBottom: 10, letterSpacing: "0.15em" }}>📋 PASTE FROM GOOGLE SHEETS</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7aaa58", marginBottom: 14, lineHeight: 2 }}>
                    1. Select from <span style={{ color: "#f5a623" }}>header row</span> → last data row · 2. <span style={{ color: "#f5a623" }}>Ctrl+C</span> → click below → <span style={{ color: "#f5a623" }}>Ctrl+V</span> → <span style={{ color: "#f5a623" }}>Import</span><br/>
                    <span style={{ color: "#3a6a28", fontSize: 10 }}>CNSL, TRO, SESSION are cumulative (+added). TC, TF, SALES are replaced. Grand Total skipped.</span>
                  </div>
                  <textarea rows={5} style={{ width: "100%", resize: "vertical", lineHeight: 1.6, fontSize: 11, color: "#a8d878", background: "rgba(0,0,0,0.3)" }}
                    placeholder={"OWNER\tCOUNSELLING\tFRESH TRO\tSALES\tSESSION\tTC\tTF\tWindow Expired\nAvanesh Patrikar DS\t5\t2\t\t\t\t1\t1"}
                    value={pasteText} onChange={(e) => { setPasteText(e.target.value); setPasteError(""); setPasteSuccess(""); }}
                  />
                  {pasteError && <div style={{ marginTop: 8, color: "#ff8888", fontFamily: "'DM Mono', monospace", fontSize: 11, padding: "6px 10px", background: "rgba(255,80,80,0.1)", borderRadius: 5 }}>⚠ {pasteError}</div>}
                  {pasteSuccess && <div style={{ marginTop: 8, color: "#7adb8a", fontFamily: "'DM Mono', monospace", fontSize: 11, padding: "6px 10px", background: "rgba(50,200,100,0.1)", borderRadius: 5 }}>{pasteSuccess}</div>}
                  <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                    <button className="btn btn-primary" onClick={handlePasteImport}>⬆ Import Data</button>
                    <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => { setPasteText(""); setPasteError(""); setPasteSuccess(""); }}>Clear</button>
                  </div>
                </div>
              )}

              {/* Entry table — light bg */}
              <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dde3ea", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                <table className="scoreboard">
                  <thead>
                    <tr>
                      <th className="name-col">PLAYER</th>
                      {COLUMNS.map(c => (
                        <th key={c.key}>
                          {c.short}
                          {c.computed && <div style={{ fontSize: 8, color: "#f5a623", marginTop: 2, opacity: 0.9 }}>AUTO</div>}
                          {c.cumulative && <div style={{ fontSize: 8, color: "#a8d878", marginTop: 2, opacity: 0.8 }}>+ADD</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeam.members.map((m, i) => (
                      <tr key={m}>
                        <td className="name-td">{m}</td>
                        {COLUMNS.map(({ key, computed }) => (
                          <td key={key} style={{ padding: "7px 8px" }}>
                            {computed
                              ? <span style={{ color: "#e65100", fontWeight: 700, fontSize: 14 }}>{computeWindowExp(reportData[m])}</span>
                              : <input className="edit-input" type="number" min="0" value={reportData[m]?.[key] ?? ""} onChange={(e) => updateCell(m, key, e.target.value)} placeholder="0" />
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 12, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a7a32" }}>
                💾 Hit <strong style={{ color: "#4ade80" }}>SAVE</strong> to persist data across sessions. Data loads from last save on refresh.
              </div>
            </>
          ) : (
            <>
              {/* ── SCOREBOARD VIEW ── */}
              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, color: "#5a8a42", letterSpacing: "0.15em", marginBottom: 4 }}>LIVE SCORECARD</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 700, color: "#f5a623", letterSpacing: "0.06em" }}>{selectedTeam.name.toUpperCase()}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setShowReport(false)}>← EDIT</button>
                  <button className="btn btn-primary" onClick={() => window.print()}>⬇ EXPORT</button>
                </div>
              </div>

              <div ref={reportRef} style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dde3ea", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
                {(() => {
                  const memberCount = selectedTeam.members.length || 1;
                  const avgs = {};
                  COLUMNS.forEach(({ key }) => {
                    avgs[key] = selectedTeam.members.reduce((s, m) => s + getDisplayVal(key, reportData[m]), 0) / memberCount;
                  });
                  return (
                    <table className="scoreboard">
                      <thead>
                        <tr>
                          <th className="name-col">SQUAD</th>
                          {COLUMNS.map(c => (
                            <th key={c.key} style={{ minWidth: 74 }}>
                              {c.short}
                              <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 400, marginTop: 3 }}>
                                avg {avgs[c.key] % 1 === 0 ? avgs[c.key].toFixed(0) : avgs[c.key].toFixed(1)}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeam.members.map((m, i) => (
                          <tr key={m}>
                            <td className="name-td">{m}</td>
                            {COLUMNS.map(({ key }) => {
                              const val = getDisplayVal(key, reportData[m]);
                              const { accent, numColor, tier } = getColorTier(key, val, avgs[key]);
                              return (
                                <td key={key} style={{
                                  borderLeft: tier !== "neutral" ? `3px solid ${accent}` : "1px solid #e0e0e0",
                                  color: numColor,
                                  fontWeight: 700,
                                  fontSize: 16,
                                }}>
                                  {val}
                                  {tier !== "neutral" && (
                                    <div style={{ fontSize: 8, marginTop: 1, color: accent, fontWeight: 600, opacity: 0.8 }}>
                                      {tier === "above" ? "▲" : tier === "below" ? "▼" : "●"}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr className="totals-row">
                          <td className="name-td">TOTAL STATS RUNNING</td>
                          {COLUMNS.map(({ key }) => <td key={key}>{tot[key] || 0}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              <div className="no-print" style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3a6a28", letterSpacing: "0.1em" }}>LEGEND:</span>
                <span className="badge" style={{ background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7" }}>▲ Above avg</span>
                <span className="badge" style={{ background: "#fff3e0", color: "#e65100", border: "1px solid #ffcc80" }}>● At avg ±5%</span>
                <span className="badge" style={{ background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a" }}>▼ Below avg</span>
                <span className="badge" style={{ background: "#f5f5f5", color: "#757575", border: "1px solid #e0e0e0" }}>— TF / Win Exp (neutral)</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
