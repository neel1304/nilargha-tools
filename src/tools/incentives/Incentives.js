import { useNavigate } from "react-router-dom";

export default function Incentives() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#1a3a1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", color: "#a8d878" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=DM+Mono&display=swap');`}</style>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: "#f5a623", letterSpacing: "0.06em", marginBottom: 12 }}>💰</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10 }}>INCENTIVE CALCULATOR</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#5a8a42", marginBottom: 32 }}>COMING SOON — IN DEVELOPMENT</div>
      <button onClick={() => navigate('/')} style={{ background: "linear-gradient(135deg, #f5a623, #e8831a)", color: "#1a1a1a", border: "none", borderRadius: 8, padding: "10px 24px", fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer" }}>
        ← BACK TO TOOLS
      </button>
    </div>
  );
}
