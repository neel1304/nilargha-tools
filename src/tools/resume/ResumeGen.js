import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── TEMPLATES ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: "jake",      name: "Jake's Resume",    desc: "Single-column · Clean · Most ATS-friendly · 500k+ users", preview: "Bold name header · Ruled sections · Bullet achievements" },
  { id: "deedy",     name: "Deedy's Resume",   desc: "Two-column · Dense · FAANG favourite · CS/Engineering",   preview: "Left sidebar (edu/skills) · Right column (experience)" },
  { id: "classic",   name: "Classic",          desc: "Traditional single-column · Universal · Any role",        preview: "Clean white · Dark text · All profiles" },
  { id: "modern",    name: "Modern",           desc: "Subtle navy accent · Clean hierarchy · Sales + BD",       preview: "Navy headers · Minimal · Great for sales" },
  { id: "executive", name: "Executive",        desc: "Bold serif · Strong hierarchy · Senior roles",            preview: "Georgia font · Burgundy accent · Management" },
];

const PROFILES = [
  { id: "swe", label: "Software Engineer" },
  { id: "b2b", label: "Sales — B2B" },
  { id: "b2c", label: "Sales — B2C" },
  { id: "bd",  label: "Business Development" },
  { id: "mgr", label: "Sales Manager / Team Lead" },
];

const PROFILE_SECTIONS = {
  swe: ["summary","skills","experience","projects","education","certifications"],
  b2b: ["summary","experience","achievements","skills","education","certifications"],
  b2c: ["summary","experience","achievements","skills","education"],
  bd:  ["summary","experience","achievements","skills","education","certifications"],
  mgr: ["summary","experience","achievements","skills","education","certifications"],
};

const SUMMARY_HINTS = {
  swe: "5+ years building scalable backend systems in Java and Node.js. Led migration to microservices reducing latency by 40%.",
  b2b: "B2B sales professional with 4+ years closing enterprise SaaS deals. Consistent 120%+ quota attainment using MEDDIC.",
  b2c: "High-energy B2C sales rep with 3+ years in EdTech. Converted 35% of inbound leads through consultative selling.",
  bd:  "Business Development Manager with 5+ years driving revenue growth in SaaS. Built outbound engine generating 40% YoY growth.",
  mgr: "Sales Manager with 3+ years leading 15-member teams. Improved ramp time by 30% and team attainment from 80% to 110%.",
};

const BULLET_HINTS = {
  swe: "Action verb + what you built + impact. e.g. 'Built RESTful API handling 2M daily requests, reducing response time by 35%'",
  b2b: "Lead with quota/metric. e.g. 'Closed 22 enterprise deals worth $1.2M ARR, achieving 130% of annual target'",
  b2c: "Lead with conversion/volume. e.g. 'Converted 38% of assigned leads to paid customers, ranking #2 of 25 reps'",
  bd:  "Lead with revenue/growth. e.g. 'Drove 40% YoY revenue growth by building outbound engine with Apollo.io'",
  mgr: "Lead with team outcome. e.g. 'Led 15-member BDR team to 115% collective quota attainment for 3 consecutive quarters'",
};

const emptyExp = () => ({ title:"",company:"",location:"",from:"",to:"",current:false,bullets:["","",""] });
const emptyEdu = () => ({ degree:"",field:"",school:"",location:"",from:"",to:"",gpa:"" });
const emptyProject = () => ({ name:"",tech:"",url:"",bullets:["",""] });
const emptyAchievement = () => ({ metric:"",context:"" });
const emptyCert = () => ({ name:"",issuer:"",year:"" });
const defaultForm = () => ({
  name:"",email:"",phone:"",location:"",linkedin:"",github:"",portfolio:"",
  summary:"",
  skills:{ languages:"",frameworks:"",tools:"",methodologies:"" },
  experience:[emptyExp()],
  projects:[emptyProject()],
  education:[emptyEdu()],
  achievements:[emptyAchievement(),emptyAchievement(),emptyAchievement()],
  certifications:[emptyCert()],
});

function fix(s) { if (!s) return ""; const t=s.trim().replace(/\s{2,}/g," "); return t.charAt(0).toUpperCase()+t.slice(1); }
function fixB(s) { if (!s) return ""; let t=fix(s); if (!t.match(/[.!?]$/)) t+="."; return t; }

// ─── JAKE'S RESUME — faithful HTML recreation ────────────────────────────────
function JakePreview({ f, profile }) {
  const isSWE = profile === "swe";
  const sections = PROFILE_SECTIONS[profile] || [];
  const expItems = f.experience.filter(e => e.company||e.title);
  const eduItems = f.education.filter(e => e.school||e.degree);
  const projItems = f.projects.filter(p => p.name);
  const achItems = f.achievements.filter(a => a.metric);
  const certItems = f.certifications.filter(c => c.name);
  const skills = f.skills;
  const hasSkills = Object.values(skills).some(v=>v.trim());

  const SHead = ({t}) => (
    <div style={{marginTop:12,marginBottom:5}}>
      <div style={{fontFamily:"'Computer Modern', 'Latin Modern', Georgia, serif",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:"#000",borderBottom:"1.2px solid #000",paddingBottom:2}}>{t}</div>
    </div>
  );

  const contactParts = [f.location,f.phone,f.email,f.linkedin&&`linkedin.com/in/${f.linkedin.replace(/.*linkedin\.com\/in\//,"")}`,f.github&&`github.com/${f.github.replace(/.*github\.com\//,"")}`].filter(Boolean);

  return (
    <div id="resume-preview" style={{fontFamily:"'Computer Modern','Latin Modern',Georgia,serif",fontSize:10,color:"#000",lineHeight:1.35,padding:"40px 46px",background:"#fff",width:"100%",minHeight:"1056px",boxSizing:"border-box"}}>
      {/* NAME */}
      <div style={{textAlign:"center",marginBottom:6}}>
        <div style={{fontSize:24,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.05em",textTransform:"uppercase"}}>{f.name||"YOUR NAME"}</div>
        <div style={{fontSize:9,marginTop:3,color:"#000",letterSpacing:"0.02em"}}>{contactParts.join(" | ")}</div>
      </div>

      {sections.includes("summary") && f.summary && (<><SHead t="Summary"/><p style={{margin:0,lineHeight:1.5,fontSize:10}}>{fix(f.summary)}</p></>)}

      {sections.includes("experience") && expItems.length>0 && (<><SHead t="Experience"/>
        {expItems.map((e,i)=>(
          <div key={i} style={{marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <div><span style={{fontWeight:700,fontSize:10.5}}>{fix(e.title)||"Role"}</span>{e.company&&<span style={{fontSize:10}}> · {fix(e.company)}</span>}</div>
              <div style={{fontSize:9,whiteSpace:"nowrap",marginLeft:8}}>{[e.location,[e.from,e.current?"Present":e.to].filter(Boolean).join(" – ")].filter(Boolean).join(" | ")}</div>
            </div>
            <ul style={{margin:"2px 0 0 14px",padding:0}}>{e.bullets.filter(b=>b.trim()).map((b,j)=><li key={j} style={{fontSize:9.5,lineHeight:1.45,marginBottom:1}}>{fixB(b)}</li>)}</ul>
          </div>
        ))}
      </>)}

      {sections.includes("achievements") && achItems.length>0 && (<><SHead t="Key Achievements"/>
        <ul style={{margin:"0 0 0 14px",padding:0}}>{achItems.map((a,i)=><li key={i} style={{fontSize:9.5,lineHeight:1.45,marginBottom:2}}><strong>{fix(a.metric)}</strong>{a.context?` — ${fix(a.context)}`:""}</li>)}</ul>
      </>)}

      {sections.includes("projects") && projItems.length>0 && (<><SHead t="Projects"/>
        {projItems.map((p,i)=>(
          <div key={i} style={{marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontWeight:700,fontSize:10}}>{fix(p.name)}</span>
              {p.tech&&<span style={{fontSize:9,fontStyle:"italic",marginLeft:8}}>{p.tech}</span>}
            </div>
            <ul style={{margin:"2px 0 0 14px",padding:0}}>{p.bullets.filter(b=>b.trim()).map((b,j)=><li key={j} style={{fontSize:9.5,lineHeight:1.45,marginBottom:1}}>{fixB(b)}</li>)}</ul>
          </div>
        ))}
      </>)}

      {sections.includes("skills") && hasSkills && (<><SHead t={isSWE?"Technical Skills":"Skills & Tools"}/>
        <div style={{fontSize:9.5,lineHeight:1.6}}>
          {isSWE ? <>
            {skills.languages&&<div><strong>Languages:</strong> {skills.languages}</div>}
            {skills.frameworks&&<div><strong>Frameworks:</strong> {skills.frameworks}</div>}
            {skills.tools&&<div><strong>Tools:</strong> {skills.tools}</div>}
            {skills.methodologies&&<div><strong>Methodologies:</strong> {skills.methodologies}</div>}
          </> : <>
            {skills.methodologies&&<div><strong>Sales Methodologies:</strong> {skills.methodologies}</div>}
            {skills.tools&&<div><strong>CRM & Tools:</strong> {skills.tools}</div>}
            {skills.languages&&<div><strong>Other Skills:</strong> {skills.languages}</div>}
          </>}
        </div>
      </>)}

      {sections.includes("education") && eduItems.length>0 && (<><SHead t="Education"/>
        {eduItems.map((e,i)=>(
          <div key={i} style={{marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <div>
              <span style={{fontWeight:700,fontSize:10}}>{fix(e.school)||"University"}</span>
              <span style={{fontSize:9.5,fontStyle:"italic"}}>{e.degree?` — ${fix(e.degree)}${e.field?`, ${fix(e.field)}`:""}`:""}</span>
              {e.gpa&&<span style={{fontSize:9}}> · GPA: {e.gpa}</span>}
            </div>
            <div style={{fontSize:9,whiteSpace:"nowrap",marginLeft:8}}>{[e.location,[e.from,e.to].filter(Boolean).join(" – ")].filter(Boolean).join(" | ")}</div>
          </div>
        ))}
      </>)}

      {sections.includes("certifications") && certItems.length>0 && (<><SHead t="Certifications"/>
        <ul style={{margin:"0 0 0 14px",padding:0}}>{certItems.map((c,i)=><li key={i} style={{fontSize:9.5,lineHeight:1.45}}>{fix(c.name)}{c.issuer?` — ${fix(c.issuer)}`:""}{c.year?` (${c.year})`:""}</li>)}</ul>
      </>)}
    </div>
  );
}

// ─── DEEDY'S RESUME — faithful two-column HTML recreation ────────────────────
function DeedyPreview({ f, profile }) {
  const isSWE = profile === "swe";
  const sections = PROFILE_SECTIONS[profile] || [];
  const expItems = f.experience.filter(e => e.company||e.title);
  const eduItems = f.education.filter(e => e.school||e.degree);
  const projItems = f.projects.filter(p => p.name);
  const achItems = f.achievements.filter(a => a.metric);
  const certItems = f.certifications.filter(c => c.name);
  const skills = f.skills;
  const hasSkills = Object.values(skills).some(v=>v.trim());

  const nameParts = (f.name||"Your Name").trim().split(" ");
  const firstName = nameParts.slice(0,-1).join(" ") || nameParts[0];
  const lastName = nameParts.length>1 ? nameParts[nameParts.length-1] : "";

  const LSect = ({title,children}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"#333",borderBottom:"0.8px solid #aaa",paddingBottom:2,marginBottom:5}}>{title}</div>
      {children}
    </div>
  );

  const RSect = ({title,children}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#333",borderBottom:"1px solid #ccc",paddingBottom:2,marginBottom:6}}>{title}</div>
      {children}
    </div>
  );

  const contactParts = [f.location,f.phone,f.email,f.linkedin,f.github].filter(Boolean);

  return (
    <div id="resume-preview" style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:9.5,color:"#2b2b2b",background:"#fff",width:"100%",minHeight:"1056px",boxSizing:"border-box",padding:0}}>
      {/* NAME HEADER */}
      <div style={{padding:"20px 28px 14px",borderBottom:"2px solid #333"}}>
        <div style={{marginBottom:4}}>
          <span style={{fontSize:30,fontWeight:300,color:"#2b2b2b",letterSpacing:"0.03em"}}>{firstName} </span>
          <span style={{fontSize:30,fontWeight:700,color:"#6a6a6a",letterSpacing:"0.03em"}}>{lastName}</span>
        </div>
        <div style={{fontSize:8.5,color:"#6a6a6a",letterSpacing:"0.04em"}}>{contactParts.join(" · ")}</div>
      </div>

      {/* TWO COLUMNS */}
      <div style={{display:"flex",padding:"0",minHeight:"calc(100% - 80px)"}}>
        {/* LEFT — 32% */}
        <div style={{width:"32%",padding:"14px 16px 14px 28px",borderRight:"0.8px solid #ddd",background:"#fafafa"}}>

          {eduItems.length>0 && (
            <LSect title="Education">
              {eduItems.map((e,i)=>(
                <div key={i} style={{marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:9.5,color:"#333"}}>{fix(e.school)}</div>
                  <div style={{fontSize:8.5,color:"#555",fontStyle:"italic"}}>{fix(e.degree)}{e.field?` in ${fix(e.field)}`:""}</div>
                  <div style={{fontSize:8,color:"#6a6a6a"}}>{[e.from,e.to].filter(Boolean).join(" – ")}{e.location?` · ${fix(e.location)}`:""}{e.gpa?<><br/>GPA: {e.gpa}</>:""}</div>
                </div>
              ))}
            </LSect>
          )}

          {hasSkills && (
            <LSect title={isSWE?"Skills":"Skills & Tools"}>
              {isSWE ? <>
                {skills.languages&&<div style={{marginBottom:5}}><div style={{fontWeight:700,fontSize:8.5,color:"#444"}}>Languages</div><div style={{fontSize:8,color:"#666",lineHeight:1.5}}>{skills.languages}</div></div>}
                {skills.frameworks&&<div style={{marginBottom:5}}><div style={{fontWeight:700,fontSize:8.5,color:"#444"}}>Frameworks</div><div style={{fontSize:8,color:"#666",lineHeight:1.5}}>{skills.frameworks}</div></div>}
                {skills.tools&&<div style={{marginBottom:5}}><div style={{fontWeight:700,fontSize:8.5,color:"#444"}}>Tools</div><div style={{fontSize:8,color:"#666",lineHeight:1.5}}>{skills.tools}</div></div>}
                {skills.methodologies&&<div style={{marginBottom:5}}><div style={{fontWeight:700,fontSize:8.5,color:"#444"}}>Methods</div><div style={{fontSize:8,color:"#666",lineHeight:1.5}}>{skills.methodologies}</div></div>}
              </> : <>
                {skills.methodologies&&<div style={{marginBottom:5}}><div style={{fontWeight:700,fontSize:8.5,color:"#444"}}>Methodologies</div><div style={{fontSize:8,color:"#666",lineHeight:1.5}}>{skills.methodologies}</div></div>}
                {skills.tools&&<div style={{marginBottom:5}}><div style={{fontWeight:700,fontSize:8.5,color:"#444"}}>CRM & Tools</div><div style={{fontSize:8,color:"#666",lineHeight:1.5}}>{skills.tools}</div></div>}
                {skills.languages&&<div style={{marginBottom:5}}><div style={{fontWeight:700,fontSize:8.5,color:"#444"}}>Other Skills</div><div style={{fontSize:8,color:"#666",lineHeight:1.5}}>{skills.languages}</div></div>}
              </>}
            </LSect>
          )}

          {certItems.length>0 && (
            <LSect title="Certifications">
              {certItems.map((c,i)=>(
                <div key={i} style={{fontSize:8.5,color:"#555",marginBottom:3}}>{fix(c.name)}{c.issuer?<span style={{color:"#888"}}> · {fix(c.issuer)}</span>:""}{c.year?<span style={{color:"#888"}}> {c.year}</span>:""}</div>
              ))}
            </LSect>
          )}
        </div>

        {/* RIGHT — 68% */}
        <div style={{width:"68%",padding:"14px 28px 14px 16px"}}>

          {sections.includes("summary") && f.summary && (
            <RSect title="Summary">
              <p style={{margin:0,fontSize:9.5,lineHeight:1.5,color:"#333"}}>{fix(f.summary)}</p>
            </RSect>
          )}

          {expItems.length>0 && (
            <RSect title="Experience">
              {expItems.map((e,i)=>(
                <div key={i} style={{marginBottom:9}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                    <div>
                      <span style={{fontWeight:700,fontSize:10,color:"#222"}}>{fix(e.company)||"Company"}</span>
                      <span style={{fontSize:9,color:"#6a6a6a",fontStyle:"italic"}}>{e.title?` · ${fix(e.title)}`:""}</span>
                    </div>
                    <div style={{fontSize:8.5,color:"#888",whiteSpace:"nowrap",marginLeft:8}}>{[e.from,e.current?"Present":e.to].filter(Boolean).join(" – ")}{e.location?` · ${fix(e.location)}`:""}</div>
                  </div>
                  <ul style={{margin:"3px 0 0 14px",padding:0}}>{e.bullets.filter(b=>b.trim()).map((b,j)=><li key={j} style={{fontSize:9,lineHeight:1.5,marginBottom:1,color:"#333"}}>{fixB(b)}</li>)}</ul>
                </div>
              ))}
            </RSect>
          )}

          {achItems.length>0 && (
            <RSect title="Key Achievements">
              <ul style={{margin:"0 0 0 14px",padding:0}}>{achItems.map((a,i)=><li key={i} style={{fontSize:9,lineHeight:1.5,marginBottom:2}}><strong>{fix(a.metric)}</strong>{a.context?` — ${fix(a.context)}`:""}</li>)}</ul>
            </RSect>
          )}

          {projItems.length>0 && (
            <RSect title="Projects">
              {projItems.map((p,i)=>(
                <div key={i} style={{marginBottom:8}}>
                  <div><span style={{fontWeight:700,fontSize:9.5}}>{fix(p.name)}</span>{p.tech&&<span style={{fontSize:8.5,color:"#6a6a6a",fontStyle:"italic"}}> · {p.tech}</span>}</div>
                  <ul style={{margin:"2px 0 0 14px",padding:0}}>{p.bullets.filter(b=>b.trim()).map((b,j)=><li key={j} style={{fontSize:9,lineHeight:1.5,marginBottom:1}}>{fixB(b)}</li>)}</ul>
                </div>
              ))}
            </RSect>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CLASSIC / MODERN / EXECUTIVE HTML ───────────────────────────────────────
function HTMLPreview({ f, profile, template }) {
  const isSWE = profile === "swe";
  const sections = PROFILE_SECTIONS[profile] || [];
  const expItems = f.experience.filter(e => e.company||e.title);
  const eduItems = f.education.filter(e => e.school||e.degree);
  const projItems = f.projects.filter(p => p.name);
  const achItems = f.achievements.filter(a => a.metric);
  const certItems = f.certifications.filter(c => c.name);
  const skills = f.skills;
  const hasSkills = Object.values(skills).some(v=>v.trim());

  const T = {
    classic:   { font:"Arial,sans-serif",        accent:"#000000", nameSize:22, ruleBorder:"2px solid #000" },
    modern:    { font:"Calibri,Arial,sans-serif", accent:"#1e3a6e", nameSize:24, ruleBorder:"2px solid #1e3a6e" },
    executive: { font:"Georgia,serif",            accent:"#7b0d0d", nameSize:26, ruleBorder:"2.5px solid #7b0d0d" },
  }[template]||{ font:"Arial,sans-serif", accent:"#000", nameSize:22, ruleBorder:"2px solid #000" };

  const SHead = ({t}) => (
    <div style={{marginTop:13,marginBottom:5}}>
      <div style={{fontFamily:T.font,fontSize:10.5,fontWeight:700,color:T.accent,textTransform:"uppercase",letterSpacing:"0.07em"}}>{t}</div>
      <div style={{borderBottom:T.ruleBorder,marginTop:2}}/>
    </div>
  );

  const contactParts = [f.location,f.phone,f.email,f.linkedin,f.github&&`GitHub: ${f.github}`].filter(Boolean);

  return (
    <div id="resume-preview" style={{fontFamily:T.font,fontSize:10,color:"#111",lineHeight:1.45,padding:"36px 42px",background:"#fff",width:"100%",minHeight:"1056px",boxSizing:"border-box"}}>
      <div style={{textAlign:"center",marginBottom:10}}>
        <div style={{fontSize:T.nameSize,fontWeight:700,fontFamily:T.font}}>{f.name||"YOUR NAME"}</div>
        <div style={{fontSize:9.5,marginTop:4,color:"#333"}}>{contactParts.join("  ·  ")}</div>
      </div>
      {sections.includes("summary")&&f.summary&&(<><SHead t="Professional Summary"/><p style={{margin:0,lineHeight:1.5,fontSize:9.5}}>{fix(f.summary)}</p></>)}
      {expItems.length>0&&(<><SHead t="Work Experience"/>
        {expItems.map((e,i)=>(
          <div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontWeight:700,fontSize:10.5}}>{fix(e.title)}{e.company?` — ${fix(e.company)}`:""}</span>
              <span style={{fontSize:8.5,whiteSpace:"nowrap",marginLeft:8}}>{[e.location,[e.from,e.current?"Present":e.to].filter(Boolean).join(" – ")].filter(Boolean).join(" | ")}</span>
            </div>
            <ul style={{margin:"2px 0 0 14px",padding:0}}>{e.bullets.filter(b=>b.trim()).map((b,j)=><li key={j} style={{fontSize:9.5,lineHeight:1.45,marginBottom:1}}>{fixB(b)}</li>)}</ul>
          </div>
        ))}
      </>)}
      {achItems.length>0&&(<><SHead t="Key Achievements"/><ul style={{margin:"0 0 0 14px",padding:0}}>{achItems.map((a,i)=><li key={i} style={{fontSize:9.5,lineHeight:1.45,marginBottom:2}}><strong>{fix(a.metric)}</strong>{a.context?` — ${fix(a.context)}`:""}</li>)}</ul></>)}
      {projItems.length>0&&(<><SHead t="Projects"/>
        {projItems.map((p,i)=>(
          <div key={i} style={{marginBottom:7}}>
            <div style={{fontWeight:700,fontSize:10}}>{fix(p.name)}{p.tech&&<span style={{fontWeight:400,fontSize:8.5,fontStyle:"italic"}}> · {p.tech}</span>}</div>
            <ul style={{margin:"2px 0 0 14px",padding:0}}>{p.bullets.filter(b=>b.trim()).map((b,j)=><li key={j} style={{fontSize:9.5,lineHeight:1.45,marginBottom:1}}>{fixB(b)}</li>)}</ul>
          </div>
        ))}
      </>)}
      {hasSkills&&(<><SHead t={isSWE?"Technical Skills":"Skills & Tools"}/>
        <div style={{fontSize:9.5,lineHeight:1.6}}>
          {isSWE?<>
            {skills.languages&&<div><strong>Languages:</strong> {skills.languages}</div>}
            {skills.frameworks&&<div><strong>Frameworks:</strong> {skills.frameworks}</div>}
            {skills.tools&&<div><strong>Tools:</strong> {skills.tools}</div>}
            {skills.methodologies&&<div><strong>Methodologies:</strong> {skills.methodologies}</div>}
          </>:<>
            {skills.methodologies&&<div><strong>Sales Methodologies:</strong> {skills.methodologies}</div>}
            {skills.tools&&<div><strong>CRM & Tools:</strong> {skills.tools}</div>}
            {skills.languages&&<div><strong>Other Skills:</strong> {skills.languages}</div>}
          </>}
        </div>
      </>)}
      {eduItems.length>0&&(<><SHead t="Education"/>
        {eduItems.map((e,i)=>(
          <div key={i} style={{marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <div><span style={{fontWeight:700}}>{fix(e.school)}</span><span style={{fontStyle:"italic"}}>{e.degree?` — ${fix(e.degree)}${e.field?`, ${fix(e.field)}`:""}`:""}  </span>{e.gpa&&<span style={{fontSize:8.5}}>· GPA {e.gpa}</span>}</div>
            <div style={{fontSize:8.5,whiteSpace:"nowrap",marginLeft:8}}>{[e.location,[e.from,e.to].filter(Boolean).join(" – ")].filter(Boolean).join(" | ")}</div>
          </div>
        ))}
      </>)}
      {certItems.length>0&&(<><SHead t="Certifications"/><ul style={{margin:"0 0 0 14px",padding:0}}>{certItems.map((c,i)=><li key={i} style={{fontSize:9.5,lineHeight:1.45}}>{fix(c.name)}{c.issuer?` — ${fix(c.issuer)}`:""}{c.year?` (${c.year})`:""}</li>)}</ul></>)}
    </div>
  );
}

// ─── FORM COMPONENTS ─────────────────────────────────────────────────────────
function Field({ label, hint, value, onChange, placeholder, multiline, required }) {
  const base = { width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(255,255,255,0.15)",color:"#e8f0e0",padding:"8px 11px",borderRadius:6,fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none",boxSizing:"border-box" };
  return (
    <div style={{marginBottom:12}}>
      <label style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:"#a8d878",letterSpacing:"0.08em",display:"block",marginBottom:4}}>{label}{required&&<span style={{color:"#f5a623"}}> *</span>}</label>
      {hint&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#5a8a42",marginBottom:4,lineHeight:1.5}}>{hint}</div>}
      {multiline?<textarea rows={3} style={{...base,resize:"vertical",lineHeight:1.6}} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>
        :<input style={base} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}
    </div>
  );
}
function BF({ value, onChange, label }) {
  return (
    <div style={{marginBottom:8}}>
      {label&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#6a9a52",marginBottom:3}}>{label}</div>}
      <textarea rows={2} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(255,255,255,0.12)",color:"#d4edaa",padding:"6px 10px",borderRadius:5,fontFamily:"'DM Mono',monospace",fontSize:11,outline:"none",resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}} value={value} onChange={e=>onChange(e.target.value)} placeholder="Action verb + what you did + measurable result."/>
    </div>
  );
}
function SC({ title, children }) {
  return (
    <div style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:18,marginBottom:16}}>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:700,color:"#f5a623",letterSpacing:"0.08em",marginBottom:14,textTransform:"uppercase"}}>{title}</div>
      {children}
    </div>
  );
}

// ─── PRINT HANDLER ───────────────────────────────────────────────────────────
function printResume() {
  window.print();
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ResumeGen() {
  const navigate = useNavigate();
  const [step, setStep] = useState("pick");
  const [profile, setProfile] = useState(null);
  const [template, setTemplate] = useState("jake");
  const [form, setForm] = useState(defaultForm());

  const sections = profile ? (PROFILE_SECTIONS[profile]||[]) : [];
  const isSWE = profile === "swe";

  const sf = (path, value) => {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length-1]] = value;
      return next;
    });
  };

  const setEF = (i,k,v) => setForm(p=>{const e=[...p.experience];e[i]={...e[i],[k]:v};return{...p,experience:e};});
  const setEB = (i,j,v) => setForm(p=>{const e=[...p.experience];const b=[...e[i].bullets];b[j]=v;e[i]={...e[i],bullets:b};return{...p,experience:e};});
  const addE = () => setForm(p=>({...p,experience:[...p.experience,emptyExp()]}));
  const delE = i => setForm(p=>({...p,experience:p.experience.filter((_,idx)=>idx!==i)}));

  const setDF = (i,k,v) => setForm(p=>{const e=[...p.education];e[i]={...e[i],[k]:v};return{...p,education:e};});
  const addD = () => setForm(p=>({...p,education:[...p.education,emptyEdu()]}));
  const delD = i => setForm(p=>({...p,education:p.education.filter((_,idx)=>idx!==i)}));

  const setPF = (i,k,v) => setForm(p=>{const e=[...p.projects];e[i]={...e[i],[k]:v};return{...p,projects:e};});
  const setPB = (i,j,v) => setForm(p=>{const e=[...p.projects];const b=[...e[i].bullets];b[j]=v;e[i]={...e[i],bullets:b};return{...p,projects:e};});
  const addP = () => setForm(p=>({...p,projects:[...p.projects,emptyProject()]}));

  const setAF = (i,k,v) => setForm(p=>{const e=[...p.achievements];e[i]={...e[i],[k]:v};return{...p,achievements:e};});
  const addA = () => setForm(p=>({...p,achievements:[...p.achievements,emptyAchievement()]}));

  const setCF = (i,k,v) => setForm(p=>{const e=[...p.certifications];e[i]={...e[i],[k]:v};return{...p,certifications:e};});
  const addC = () => setForm(p=>({...p,certifications:[...p.certifications,emptyCert()]}));

  const bs = { cursor:"pointer",border:"none",borderRadius:6,fontFamily:"'Oswald',sans-serif",fontSize:13,padding:"10px 22px",fontWeight:700,letterSpacing:"0.06em",transition:"all 0.18s" };

  // ── PICK ──
  if (step === "pick") return (
    <div style={{minHeight:"100vh",background:"#1a3a1a",color:"#e8f0e0"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{background:"linear-gradient(90deg,#071a07,#0d2a0d)",borderBottom:"3px solid #f5a623",padding:"16px 32px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={()=>navigate("/")} style={{background:"none",border:"none",color:"#5a8a42",fontFamily:"'DM Mono',monospace",fontSize:12,cursor:"pointer"}}>← TOOLS</button>
        <div style={{width:1,height:20,background:"rgba(255,255,255,0.1)"}}/>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:700,color:"#f5a623",letterSpacing:"0.1em"}}>RESUME GENERATOR</div>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"48px 24px"}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:32,fontWeight:700,color:"#a8d878",marginBottom:8}}>Build Your Resume</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#5a8a42",marginBottom:40}}>ATS-approved · 5 templates · No AI · Preview + download PDF</div>

        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:"#f5a623",letterSpacing:"0.1em",marginBottom:14}}>STEP 1 — SELECT PROFILE</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:40}}>
          {PROFILES.map(p=>(
            <div key={p.id} onClick={()=>setProfile(p.id)} style={{background:profile===p.id?"rgba(245,166,35,0.15)":"rgba(255,255,255,0.04)",border:profile===p.id?"2px solid #f5a623":"1.5px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"16px 14px",cursor:"pointer",textAlign:"center",transition:"all 0.18s"}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:700,color:profile===p.id?"#f5a623":"#a8d878"}}>{p.label}</div>
            </div>
          ))}
        </div>

        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:"#f5a623",letterSpacing:"0.1em",marginBottom:14}}>STEP 2 — SELECT TEMPLATE</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:40}}>
          {TEMPLATES.map(t=>(
            <div key={t.id} onClick={()=>setTemplate(t.id)} style={{background:template===t.id?"rgba(245,166,35,0.12)":"rgba(255,255,255,0.03)",border:template===t.id?"2px solid #f5a623":"1.5px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"14px 18px",cursor:"pointer",display:"flex",gap:16,alignItems:"flex-start",transition:"all 0.18s"}}>
              <div style={{minWidth:170}}>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:700,color:template===t.id?"#f5a623":"#c8e0a8"}}>{t.name}</div>
                {(t.id==="jake"||t.id==="deedy")&&<div style={{display:"inline-block",background:"rgba(168,216,120,0.15)",border:"1px solid rgba(168,216,120,0.3)",borderRadius:4,padding:"2px 8px",fontFamily:"'DM Mono',monospace",fontSize:9,color:"#a8d878",marginTop:4}}>HTML · Instant PDF</div>}
              </div>
              <div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#5a8a42"}}>{t.desc}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#3a6a28",marginTop:3}}>{t.preview}</div>
              </div>
            </div>
          ))}
        </div>

        <button disabled={!profile} onClick={()=>setStep("form")} style={{...bs,background:profile?"linear-gradient(135deg,#f5a623,#e8831a)":"rgba(255,255,255,0.1)",color:profile?"#1a1a1a":"#5a6a4a",cursor:profile?"pointer":"not-allowed",fontSize:14,padding:"13px 32px"}}>
          FILL IN YOUR DETAILS →
        </button>
      </div>
    </div>
  );

  // ── FORM ──
  if (step === "form") return (
    <div style={{minHeight:"100vh",background:"#1a3a1a",color:"#e8f0e0"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,textarea{color:#e8f0e0}input::placeholder,textarea::placeholder{color:rgba(200,220,180,0.3)}input:focus,textarea:focus{border-color:#f5a623!important;outline:none}`}</style>
      <div style={{background:"linear-gradient(90deg,#071a07,#0d2a0d)",borderBottom:"3px solid #f5a623",padding:"16px 32px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={()=>setStep("pick")} style={{background:"none",border:"none",color:"#5a8a42",fontFamily:"'DM Mono',monospace",fontSize:12,cursor:"pointer"}}>← BACK</button>
        <div style={{width:1,height:20,background:"rgba(255,255,255,0.1)"}}/>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:"#f5a623",letterSpacing:"0.1em"}}>RESUME GENERATOR</div>
        <div style={{marginLeft:"auto",fontFamily:"'DM Mono',monospace",fontSize:11,color:"#5a8a42"}}>{PROFILES.find(p=>p.id===profile)?.label} · {TEMPLATES.find(t=>t.id===template)?.name}</div>
      </div>
      <div style={{maxWidth:760,margin:"0 auto",padding:"36px 24px 80px"}}>

        <SC title="Contact Information">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Field label="Full Name" required value={form.name} onChange={v=>sf("name",v)} placeholder="Nilargha Roy"/>
            <Field label="Email" required value={form.email} onChange={v=>sf("email",v)} placeholder="you@email.com"/>
            <Field label="Phone" value={form.phone} onChange={v=>sf("phone",v)} placeholder="+91 98765 43210"/>
            <Field label="Location" value={form.location} onChange={v=>sf("location",v)} placeholder="Bangalore, India"/>
            <Field label="LinkedIn" value={form.linkedin} onChange={v=>sf("linkedin",v)} placeholder="linkedin.com/in/yourname"/>
            {isSWE&&<Field label="GitHub" value={form.github} onChange={v=>sf("github",v)} placeholder="github.com/username"/>}
          </div>
        </SC>

        <SC title="Professional Summary">
          <Field label="2–3 sentence summary" hint="No 'I' statements. Lead with years + domain + biggest win." value={form.summary} onChange={v=>sf("summary",v)} placeholder={SUMMARY_HINTS[profile]||""} multiline/>
        </SC>

        <SC title={isSWE?"Technical Skills":"Skills & Tools"}>
          {isSWE?<>
            <Field label="Programming Languages" value={form.skills.languages} onChange={v=>sf("skills.languages",v)} placeholder="Java, Python, JavaScript, TypeScript, SQL"/>
            <Field label="Frameworks & Libraries" value={form.skills.frameworks} onChange={v=>sf("skills.frameworks",v)} placeholder="Spring Boot, React, Node.js, Express"/>
            <Field label="Tools & Platforms" value={form.skills.tools} onChange={v=>sf("skills.tools",v)} placeholder="AWS, Docker, Kubernetes, Git, Jenkins"/>
            <Field label="Methodologies" value={form.skills.methodologies} onChange={v=>sf("skills.methodologies",v)} placeholder="Agile, Scrum, CI/CD, TDD, REST APIs"/>
          </>:<>
            <Field label="Sales Methodologies" value={form.skills.methodologies} onChange={v=>sf("skills.methodologies",v)} placeholder="MEDDIC, BANT, SPIN, Sandler, Challenger"/>
            <Field label="CRM & Sales Tools" value={form.skills.tools} onChange={v=>sf("skills.tools",v)} placeholder="Salesforce, Apollo.io, Outreach, HubSpot"/>
            <Field label="Other Skills" value={form.skills.languages} onChange={v=>sf("skills.languages",v)} placeholder="Cold Calling, Account Planning, SQL"/>
          </>}
        </SC>

        <SC title="Work Experience">
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#4a7a32",marginBottom:14,lineHeight:1.6}}>{BULLET_HINTS[profile]||""}</div>
          {form.experience.map((exp,i)=>(
            <div key={i} style={{borderTop:i>0?"1px solid rgba(255,255,255,0.07)":"none",paddingTop:i>0?16:0,marginTop:i>0?16:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"#a8d878"}}>Position {i+1}</div>
                {i>0&&<button onClick={()=>delE(i)} style={{background:"none",border:"none",color:"#ff8888",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11}}>✕ Remove</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                <Field label="Job Title" value={exp.title} onChange={v=>setEF(i,"title",v)} placeholder="Business Development Manager"/>
                <Field label="Company" value={exp.company} onChange={v=>setEF(i,"company",v)} placeholder="Scaler / Interviewbit"/>
                <Field label="Location" value={exp.location} onChange={v=>setEF(i,"location",v)} placeholder="Bangalore, India"/>
                <div/>
                <Field label="From" value={exp.from} onChange={v=>setEF(i,"from",v)} placeholder="Mar 2022"/>
                <Field label="To (blank = Present)" value={exp.to} onChange={v=>setEF(i,"to",v)} placeholder="Feb 2024"/>
              </div>
              <div style={{marginTop:8}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#5a8a42",marginBottom:8}}>BULLET POINTS — use metrics wherever possible</div>
                {exp.bullets.map((b,j)=><BF key={j} label={`Bullet ${j+1}`} value={b} onChange={v=>setEB(i,j,v)}/>)}
                <button onClick={()=>{const e=[...form.experience];e[i].bullets.push("");setForm(p=>({...p,experience:e}));}} style={{background:"none",border:"1px solid rgba(168,216,120,0.2)",color:"#5a8a42",borderRadius:5,padding:"4px 12px",fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer",marginTop:4}}>+ Add Bullet</button>
              </div>
            </div>
          ))}
          <button onClick={addE} style={{marginTop:16,background:"rgba(245,166,35,0.1)",border:"1px dashed rgba(245,166,35,0.3)",color:"#f5a623",borderRadius:6,padding:"8px 16px",fontFamily:"'Oswald',sans-serif",fontSize:12,cursor:"pointer",width:"100%",letterSpacing:"0.06em"}}>+ ADD ANOTHER POSITION</button>
        </SC>

        {sections.includes("achievements")&&(
          <SC title="Key Achievements">
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#4a7a32",marginBottom:14,lineHeight:1.6}}>Standalone metrics. e.g. "130% quota attainment — Q3 2023"</div>
            {form.achievements.map((a,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                <Field label={`Metric ${i+1}`} value={a.metric} onChange={v=>setAF(i,"metric",v)} placeholder="130% quota attainment"/>
                <Field label="Context" value={a.context} onChange={v=>setAF(i,"context",v)} placeholder="Q3 2023, team of 8"/>
              </div>
            ))}
            <button onClick={addA} style={{background:"rgba(245,166,35,0.1)",border:"1px dashed rgba(245,166,35,0.3)",color:"#f5a623",borderRadius:6,padding:"8px 16px",fontFamily:"'Oswald',sans-serif",fontSize:12,cursor:"pointer",width:"100%",letterSpacing:"0.06em"}}>+ ADD ACHIEVEMENT</button>
          </SC>
        )}

        {sections.includes("projects")&&(
          <SC title="Projects">
            {form.projects.map((p,i)=>(
              <div key={i} style={{borderTop:i>0?"1px solid rgba(255,255,255,0.07)":"none",paddingTop:i>0?16:0,marginTop:i>0?16:0}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                  <Field label="Project Name" value={p.name} onChange={v=>setPF(i,"name",v)} placeholder="E-commerce Platform"/>
                  <Field label="GitHub / URL" value={p.url} onChange={v=>setPF(i,"url",v)} placeholder="github.com/you/project"/>
                  <Field label="Tech Stack" value={p.tech} onChange={v=>setPF(i,"tech",v)} placeholder="React, Node.js, PostgreSQL, AWS"/>
                </div>
                {p.bullets.map((b,j)=><BF key={j} label={`Bullet ${j+1}`} value={b} onChange={v=>setPB(i,j,v)}/>)}
              </div>
            ))}
            <button onClick={addP} style={{marginTop:8,background:"rgba(245,166,35,0.1)",border:"1px dashed rgba(245,166,35,0.3)",color:"#f5a623",borderRadius:6,padding:"8px 16px",fontFamily:"'Oswald',sans-serif",fontSize:12,cursor:"pointer",width:"100%",letterSpacing:"0.06em"}}>+ ADD PROJECT</button>
          </SC>
        )}

        <SC title="Education">
          {form.education.map((e,i)=>(
            <div key={i} style={{borderTop:i>0?"1px solid rgba(255,255,255,0.07)":"none",paddingTop:i>0?16:0,marginTop:i>0?16:0}}>
              {i>0&&<button onClick={()=>delD(i)} style={{background:"none",border:"none",color:"#ff8888",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11,marginBottom:8}}>✕ Remove</button>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                <Field label="Degree" value={e.degree} onChange={v=>setDF(i,"degree",v)} placeholder="B.Tech / MBA"/>
                <Field label="Field of Study" value={e.field} onChange={v=>setDF(i,"field",v)} placeholder="Computer Science"/>
                <Field label="University" value={e.school} onChange={v=>setDF(i,"school",v)} placeholder="SRM University"/>
                <Field label="Location" value={e.location} onChange={v=>setDF(i,"location",v)} placeholder="Chennai, India"/>
                <Field label="From" value={e.from} onChange={v=>setDF(i,"from",v)} placeholder="Jul 2017"/>
                <Field label="To" value={e.to} onChange={v=>setDF(i,"to",v)} placeholder="May 2021"/>
              </div>
            </div>
          ))}
          <button onClick={addD} style={{marginTop:8,background:"rgba(245,166,35,0.1)",border:"1px dashed rgba(245,166,35,0.3)",color:"#f5a623",borderRadius:6,padding:"8px 16px",fontFamily:"'Oswald',sans-serif",fontSize:12,cursor:"pointer",width:"100%",letterSpacing:"0.06em"}}>+ ADD EDUCATION</button>
        </SC>

        {sections.includes("certifications")&&(
          <SC title="Certifications (Optional)">
            {form.certifications.map((c,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"0 12px"}}>
                <Field label="Certification Name" value={c.name} onChange={v=>setCF(i,"name",v)} placeholder="AWS Certified Solutions Architect"/>
                <Field label="Issuer" value={c.issuer} onChange={v=>setCF(i,"issuer",v)} placeholder="Amazon"/>
                <Field label="Year" value={c.year} onChange={v=>setCF(i,"year",v)} placeholder="2023"/>
              </div>
            ))}
            <button onClick={addC} style={{background:"rgba(245,166,35,0.1)",border:"1px dashed rgba(245,166,35,0.3)",color:"#f5a623",borderRadius:6,padding:"8px 16px",fontFamily:"'Oswald',sans-serif",fontSize:12,cursor:"pointer",width:"100%",letterSpacing:"0.06em"}}>+ ADD CERTIFICATION</button>
          </SC>
        )}

        <button onClick={()=>setStep("preview")} style={{...bs,background:"linear-gradient(135deg,#f5a623,#e8831a)",color:"#1a1a1a",fontSize:14,padding:"14px 36px",width:"100%",marginTop:8}}>
          PREVIEW & DOWNLOAD →
        </button>
      </div>
    </div>
  );

  // ── PREVIEW ──
  return (
    <div style={{minHeight:"100vh",background:"#0e1a0e",color:"#e8f0e0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media print {
          @page { margin: 0.4in; size: letter; }
          body * { visibility: hidden; }
          #resume-preview, #resume-preview * { visibility: visible !important; }
          #resume-preview {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: white !important;
          }
        }
      `}</style>
      <div className="no-print" style={{background:"linear-gradient(90deg,#071407,#0d2a0d)",borderBottom:"3px solid #f5a623",padding:"14px 28px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <button onClick={()=>setStep("form")} style={{background:"none",border:"none",color:"#5a8a42",fontFamily:"'DM Mono',monospace",fontSize:12,cursor:"pointer"}}>← EDIT</button>
        <div style={{width:1,height:20,background:"rgba(255,255,255,0.1)"}}/>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:"#f5a623",letterSpacing:"0.1em"}}>{TEMPLATES.find(t=>t.id===template)?.name}</div>
        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {TEMPLATES.map(t=>(
              <button key={t.id} onClick={()=>setTemplate(t.id)} style={{background:template===t.id?"rgba(245,166,35,0.2)":"transparent",border:template===t.id?"1.5px solid #f5a623":"1.5px solid rgba(255,255,255,0.15)",color:template===t.id?"#f5a623":"#7aaa58",borderRadius:5,padding:"5px 10px",fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer"}}>{t.name.split("'")[0].trim()||t.name}</button>
            ))}
          </div>
          <button onClick={()=>printResume()} style={{...bs,background:"linear-gradient(135deg,#f5a623,#e8831a)",color:"#1a1a1a",padding:"9px 22px"}}>⬇ DOWNLOAD PDF</button>
        </div>
      </div>
      <div className="no-print" style={{background:"rgba(245,166,35,0.08)",borderBottom:"1px solid rgba(245,166,35,0.2)",padding:"9px 28px",fontFamily:"'DM Mono',monospace",fontSize:11,color:"#7aaa58"}}>
        💡 Click <strong style={{color:"#f5a623"}}>DOWNLOAD PDF</strong> → print dialog opens → set <strong style={{color:"#f5a623"}}>Destination: Save as PDF</strong>, margins: None
      </div>
      <div style={{maxWidth:850,margin:"24px auto",background:"#fff",boxShadow:"0 8px 40px rgba(0,0,0,0.5)",borderRadius:4,overflow:"hidden"}}>
        {template==="jake"  && <JakePreview  f={form} profile={profile}/>}
        {template==="deedy" && <DeedyPreview f={form} profile={profile}/>}
        {["classic","modern","executive"].includes(template) && <HTMLPreview f={form} profile={profile} template={template}/>}
      </div>
      <div style={{height:48}}/>
    </div>
  );
}
