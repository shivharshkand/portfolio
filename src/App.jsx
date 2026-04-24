import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { SYSTEMS } from './data.js';
import { Icon, RobotCanvas, NbPlaceholder } from './visuals.jsx';

/* =========================================================
   Routing — hash-based
   ========================================================= */
function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (!h) return { page: 'home' };
  const parts = h.split('/');
  if (parts[0] === 'systems') return { page: 'systems', id: parts[1] };
  if (parts[0] === 'project') return { page: 'project', id: parts[1] };
  if (['experience','contact','home'].includes(parts[0])) return { page: parts[0] };
  return { page: 'home' };
}
function navigate(path) { window.location.hash = path; }

const ProjectImage = ({ src, alt }) => {
  if (!src) {
    return <NbPlaceholder label={alt || 'Project image'} kind="image" />;
  }
  return <img src={src} className="sys-img" alt={alt || 'Project image'} loading="lazy" />;
};

/* =========================================================
   Top Nav
   ========================================================= */
const Nav = ({ route }) => {
  const links = [
    { id: 'home',     label: 'Home',       idx: '01', path: '' },
    { id: 'systems',  label: 'Systems',    idx: '02', path: '/systems' },
    { id: 'experience', label: 'Experience', idx: '03', path: '/experience' },
    { id: 'contact',  label: 'Contact',    idx: '04', path: '/contact' },
  ];
  const active = (id) => id === route.page || (id === 'systems' && route.page === 'project');
  return (
    <nav className="nav liquid-glass tier-2">
      <div className="brand">
        <div className="brand-mark" aria-hidden/>
        <div className="brand-text">
          <b>Shivharsh Kand</b>
          <span>CONTROLS · ROBOTICS</span>
        </div>
      </div>
      <div className="nav-links liquid-glass" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {links.map(l => (
          <button key={l.id} className={active(l.id) ? 'active' : ''} onClick={() => navigate(l.path)}>
            <span className="idx">{l.idx}</span>{l.label}
          </button>
        ))}
      </div>
      <div className="nav-meta">
        <div className="row"><span className="status-dot"/><span className="stat">ONLINE · <b>UCSD</b></span></div>
        <div className="stat">v2.4 · <b>2026</b></div>
      </div>
    </nav>
  );
};

/* =========================================================
   HOME
   ========================================================= */
const HomePage = () => {
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ w: 1000, h: 620 });

  useEffect(() => {
    if (!stageRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setStageSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  // 5 featured systems — nodes placed 0° to 180° around robot base
  const featured = [SYSTEMS[0], SYSTEMS[1], SYSTEMS[4], SYSTEMS[6], SYSTEMS[7]];

  return (
    <div className="page page-enter home-page">
      {/* ============ SCENE 1 — INTRO (metal banner) ============ */}
      <section className="home-scene home-intro">
        <img className="home-intro-bg" src="assets/hero-metal.jpg" alt=""/>
        <div className="home-intro-scrim"/>
        <div className="home-intro-content">
          <div className="kicker tag"><span className="dot"/>CONTROLS · ROBOTICS · INTELLIGENT SYSTEMS</div>
          <h1 className="h-display">Building real-world systems<br/>from <em>dynamics</em> to <em>deployment</em>.</h1>
          <div className="home-intro-sub">
            I'm Shivharsh Kand — a Controls & Robotics engineer at UC San Diego. I design, analyze, and build dynamic systems where hardware, control, and intelligence come together — and I validate them on the bench.
          </div>
          <div className="home-intro-btns">
            <button className="btn liquid-glass ghost" onClick={() => navigate('/systems')}>
              <span>View Systems</span><Icon name="arrow" size={14}/>
            </button>
            <button className="btn primary" onClick={() => navigate('/contact')}>
              <span>Contact Me</span><Icon name="arrow" size={14}/>
            </button>
          </div>
        </div>
        <div className="home-intro-scroll" onClick={() => document.querySelector('.home-scene-stage')?.scrollIntoView({ behavior: 'smooth' })}>
          <span>SCROLL · FEATURED SYSTEMS</span>
          <span className="sc-arrow">↓</span>
        </div>
      </section>

      {/* ============ SCENE 2 — ROBOT STAGE ============ */}
      <section className="home-scene home-scene-stage">
        <div className="stage-header">
          <div className="kicker"><span className="dot"/>FEATURED SYSTEMS · INTERACTIVE</div>
          <h2 className="h-2">Hover the stage. The arm follows.</h2>
          <p className="body-l">Five picks from eight builds — click any node to open the full writeup.</p>
        </div>
        <div className="hero-stage liquid-glass tier-3" ref={stageRef}>
          <RobotCanvas height={stageSize.h || 620}/>
          <div className="stage-label"><span className="dot"/>END-EFFECTOR · LIVE · 360° REACH</div>
          {/* large static project nodes around the robot */}
          {featured.map((sys, i) => {
            const nodePositions = [
              { left: '16%', top: '45%' },
              { left: '25%', top: '4%' },
              { left: '44%', top: '3%' },
              { left: '63%', top: '4%' },
              { left: '71%', top: '45%' },
            ];
            return (
              <div key={sys.id}
                   className="orbit-node liquid-glass featured-node"
                   style={nodePositions[i]}
                   onClick={() => navigate('/project/' + sys.id)}>
                <div className="idx">{sys.code}</div>
                <div className="name">{sys.name}</div>
                <div className="line">{sys.oneline}</div>
              </div>
            );
          })}
          <div className="featured-systems-script">Featured systems</div>

        </div>
      </section>

      {/* Home footer */}
      <div className="home-footer">
        <div className="phil-card liquid-glass tier-2">
          <h5>ENGINEERING PHILOSOPHY</h5>
          <ul>
            <li><span className="bullet">01</span>Systems over components.</li>
            <li><span className="bullet">02</span>Design through iteration.</li>
            <li><span className="bullet">03</span>Simulation must meet reality.</li>
            <li><span className="bullet">04</span>Tradeoffs define engineering.</li>
          </ul>
        </div>
        <div className="phil-card liquid-glass tier-2">
          <h5>CORE CAPABILITIES</h5>
          <ul>
            <li><span className="bullet">C</span>Control systems · LQR · MDO · state-space</li>
            <li><span className="bullet">H</span>Hardware prototyping · CAD · CNC · FDM</li>
            <li><span className="bullet">E</span>Embedded · ESP32 · ROS 2 · Jetson</li>
            <li><span className="bullet">S</span>Simulation · ANSYS · CoppeliaSim</li>
          </ul>
        </div>
        <div className="phil-card liquid-glass tier-2" style={{ padding: 0, overflow:'hidden', minHeight: 200, position:'relative' }}>
          <div style={{ padding: 22, position:'relative', zIndex:2 }}>
            <h5 style={{ margin:0 }}>QUICK LINKS</h5>
            <div style={{ display:'flex', flexDirection:'column', gap: 10, marginTop:16 }}>
              <button className="btn liquid-glass ghost" style={{justifyContent:'space-between', width:'100%'}} onClick={() => navigate('/systems')}>
                <span>All systems →</span><Icon name="orbit" size={14}/>
              </button>
              <button className="btn liquid-glass ghost" style={{justifyContent:'space-between', width:'100%'}} onClick={() => navigate('/experience')}>
                <span>Experience timeline →</span><Icon name="chart" size={14}/>
              </button>
              <button className="btn liquid-glass ghost" style={{justifyContent:'space-between', width:'100%'}} onClick={() => navigate('/contact')}>
                <span>Get in touch →</span><Icon name="mail" size={14}/>
              </button>
            </div>
          </div>
          <div style={{
            position:'absolute', right:-40, bottom:-40, width:220, height:220,
            borderRadius:'50%',
            background:'radial-gradient(circle at 30% 30%, rgba(158,203,255,0.25), transparent 60%)',
            filter:'blur(8px)',
            pointerEvents:'none'
          }}/>
        </div>
      </div>

      <div style={{
        marginTop: 30, paddingTop: 20, borderTop: '1px solid var(--line)',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        color:'var(--ink-3)', fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'.18em', textTransform:'uppercase'
      }}>
        <div>© 2026 Shivharsh Kand — All rights reserved</div>
        <div>Design · Analyze · Build · Repeat</div>
      </div>
    </div>
  );
};

/* =========================================================
   SYSTEMS PAGE
   ========================================================= */
const SystemsPage = ({ initialId }) => {
  const [activeId, setActiveId] = useState(initialId || SYSTEMS[0].id);
  const sys = SYSTEMS.find(s => s.id === activeId) || SYSTEMS[0];

  return (
    <div className="page page-enter">
      <div className="page-head">
        <div className="title">
          <div className="crumbs">Home<span className="sep">/</span>Systems<span className="sep">/</span><span style={{color:'var(--accent)'}}>{sys.code}</span></div>
          <h2 className="h-2">Systems dashboard.</h2>
          <div className="body-l" style={{maxWidth:620}}>Eight engineered systems. Each one picked because it taught me something I could not learn in a textbook — from haptic firmware to nested MDO to bench thermal validation.</div>
        </div>
        <div className="meta-col">
          <div>COUNT<b>{SYSTEMS.length}</b></div>
          <div>FILTER<b>All domains</b></div>
          <div>CURRENT<b>{sys.code}</b></div>
        </div>
      </div>

      <div className="systems-layout">
        <div className="sys-selector liquid-glass tier-2">
          <div className="head">
            <span className="k">System Index</span>
            <span className="n">{String(SYSTEMS.indexOf(sys) + 1).padStart(2,'0')} / {String(SYSTEMS.length).padStart(2,'0')}</span>
          </div>
          {SYSTEMS.map(s => (
            <div key={s.id} className={`sys-item ${s.id === activeId ? 'active' : ''}`} onClick={() => setActiveId(s.id)}>
              <div className="idx">{s.code.slice(5)}</div>
              <div>
                <div className="name">{s.name}</div>
                <div className="sub">{s.short}</div>
              </div>
              <div className="chev"><Icon name="chev" size={14}/></div>
            </div>
          ))}
        </div>

        <div className="sys-panel liquid-glass tier-3">
          <div className="sys-panel-head">
            <div className="l">
              <div className="kicker" style={{marginBottom:8}}><span className="dot"/>{sys.code} · {sys.domain}</div>
              <h2>{sys.name}</h2>
              <div className="sub">{sys.course} · {sys.year}</div>
            </div>
            <div className="r">
              <div>Status</div>
              <div style={{ color:'var(--accent)', marginTop:4 }}>● DEPLOYED</div>
            </div>
          </div>

          <div className="tags">
            {sys.tags.map(t => <span key={t} className="tag mono">{t}</span>)}
          </div>

          <div className="sys-panel-body">
            <div className="sys-narrative">
              <div className="block">
                <h4>The Problem</h4>
                <p>{sys.problem}</p>
              </div>
              <div className="block">
                <h4>My Approach</h4>
                <p>{sys.approach}</p>
              </div>
              <div className="block">
                <h4>Key Insight</h4>
                <p>{sys.insight}</p>
              </div>
              <div className="block results">
                <h4>Results</h4>
                <ul>{sys.results.map((r,i) => <li key={i}>{r}</li>)}</ul>
              </div>
            </div>
            <div className="sys-visuals">
              <div className="sys-diagram liquid-glass image-slot">
                <div className="image-cap">Image · {sys.code}</div>
                <ProjectImage src={sys.images?.main} alt={`${sys.name} main image`} />
              </div>
              <div className="sys-plot liquid-glass image-slot">
                <div className="image-cap">Detail · {sys.code}</div>
                <ProjectImage src={sys.images?.detail} alt={`${sys.name} detail image`} />
              </div>
            </div>

          </div>

          <div className="sys-panel-footer">
            <div className="l">
              {sys.metrics.slice(0,3).map(m => (
                <div key={m.k} className="mini-metric">
                  <div className="k">{m.k}</div>
                  <div className="v">{m.v} <span style={{color:'var(--ink-2)', fontSize:11, fontFamily:'var(--mono)'}}>{m.u}</span></div>
                </div>
              ))}
            </div>
            <button className="btn primary" onClick={() => navigate('/project/' + sys.id)}>
              <span>View Full Project</span><Icon name="arrow" size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   PROJECT PAGE
   ========================================================= */
const ProjectPage = ({ id }) => {
  const sys = SYSTEMS.find(s => s.id === id) || SYSTEMS[0];
  const idx = SYSTEMS.indexOf(sys);
  const prev = SYSTEMS[(idx - 1 + SYSTEMS.length) % SYSTEMS.length];
  const next = SYSTEMS[(idx + 1) % SYSTEMS.length];

  const notebook = [
    { label: 'Concept sketch · notebook', kind: 'image', span: 'span-3' },
    { label: 'CAD · mechanism', kind: 'chip', span: 'span-3' },
    { label: 'Test setup · bench', kind: 'node', span: 'span-2' },
    { label: 'Results plot', kind: 'chart', span: 'span-2' },
    { label: 'Final assembly', kind: 'arm', span: 'span-2' },
  ];

  return (
    <div className="page page-enter">
      <div className="page-head" style={{borderBottom:'none', paddingBottom:0, marginBottom:24}}>
        <div className="title">
          <div className="crumbs">
            <span onClick={() => navigate('')} style={{cursor:'pointer'}}>Home</span><span className="sep">/</span>
            <span onClick={() => navigate('/systems')} style={{cursor:'pointer'}}>Systems</span><span className="sep">/</span>
            <span style={{color:'var(--accent)'}}>{sys.code}</span>
          </div>
        </div>
        <div className="meta-col">
          <div onClick={() => navigate('/project/' + prev.id)} style={{cursor:'pointer'}}>PREV<b>← {prev.code}</b></div>
          <div onClick={() => navigate('/project/' + next.id)} style={{cursor:'pointer'}}>NEXT<b>{next.code} →</b></div>
          <div>BACK<b style={{cursor:'pointer'}} onClick={() => navigate('/systems')}>Systems</b></div>
        </div>
      </div>

      {/* Hero */}
      <div className="proj-hero liquid-glass tier-3">
        <div style={{position:'relative', zIndex:2}}>
          <div className="sys-code">{sys.code} · {sys.domain}</div>
          <h1>{sys.name.replace('—','·')}<br/><em style={{fontSize:'0.7em'}}>{sys.short}</em></h1>
          <div className="blurb">{sys.overview}</div>
        </div>
        <div className="spec">
          <div className="stat-card liquid-glass">
            <div className="k">COURSE</div><div className="v" style={{fontSize:13}}>{sys.course}</div>
          </div>
          <div className="stat-card liquid-glass">
            <div className="k">YEAR</div><div className="v">{sys.year}</div>
          </div>
          <div className="stat-card liquid-glass">
            <div className="k">DOMAIN</div><div className="v" style={{fontSize:13}}>{sys.domain}</div>
          </div>
          <div className="stat-card liquid-glass">
            <div className="k">STACK</div><div className="v" style={{fontSize:12}}>{sys.tags.slice(0,3).join(' · ')}</div>
          </div>
        </div>
      </div>

      {/* 1. Overview / Problem */}
      <div className="proj-section">
        <div>
          <div className="num">01 · Overview</div>
          <h3>What it is, why it matters.</h3>
        </div>
        <div className="content">
          <p>{sys.overview}</p>
        </div>
      </div>

      <div className="proj-section">
        <div>
          <div className="num">02 · Problem</div>
          <h3>The engineering challenge.</h3>
        </div>
        <div className="content">
          <p>{sys.problem}</p>
        </div>
      </div>

      <div className="proj-section">
        <div>
          <div className="num">03 · My Role</div>
          <h3>What I personally did.</h3>
        </div>
        <div className="content">
          <p>{sys.role}</p>
          <p style={{color:'var(--ink-2)'}}>Approach summary: {sys.approach}</p>
        </div>
      </div>

      {/* 4. System architecture */}
      <div className="proj-section">
        <div>
          <div className="num">04 · System Architecture</div>
          <h3>Inputs → control → outputs.</h3>
        </div>
        <div className="content">
          <div className="project-image-placeholder liquid-glass tier-2" style={{ padding: 28, borderRadius: 16, marginBottom: 18 }}>
            <ProjectImage src={sys.images?.main} alt={`${sys.name} architecture image`} />
            <div className="caption" style={{ borderTop:'1px solid var(--line)', marginTop:18, paddingTop:14 }}>
              <div className="t">System architecture image placeholder</div>
              <div className="n mono">IMG · ARCH</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
            {sys.architecture.map((a, i) => (
              <div key={i} className="liquid-glass tier-2" style={{ padding:14, borderRadius:10 }}>
                <div className="mono" style={{fontSize:10, color:'var(--ink-3)', letterSpacing:'.18em', textTransform:'uppercase'}}>{String(i+1).padStart(2,'0')}</div>
                <div style={{ fontSize:13.5, color:'var(--ink-0)', marginTop:4, fontWeight:500 }}>{a.label}</div>
                <div style={{ fontSize:11.5, color:'var(--ink-2)', marginTop:3 }}>{a.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Design process */}
      <div className="proj-section">
        <div>
          <div className="num">05 · Design Process</div>
          <h3>Sketches, FBDs, early ideas.</h3>
        </div>
        <div className="content">
          <div className="notebook">
            {sys.process.map((p, i) => (
              <div key={i} className={`nb-card liquid-glass tier-2 ${i === 0 ? 'span-3' : i === 1 ? 'span-3' : 'span-2'}`}>
                <ProjectImage src={i % 2 === 0 ? sys.images?.main : sys.images?.detail} alt={p} />
                <div className="caption">
                  <div className="t">{p}</div>
                  <div className="n mono">FIG · {String(i+1).padStart(2,'0')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Prototype / build */}
      <div className="proj-section">
        <div>
          <div className="num">06 · Prototype · Build</div>
          <h3>Hardware, CAD, wiring.</h3>
        </div>
        <div className="content">
          <div className="notebook">
            {sys.prototype.map((p, i) => (
              <div key={i} className={`nb-card liquid-glass tier-2 ${i === 0 ? 'span-4' : 'span-2'}`}>
                <ProjectImage src={i === 0 ? sys.images?.main : sys.images?.detail} alt={p} />
                <div className="caption">
                  <div className="t">{p}</div>
                  <div className="n mono">IMG · {String(i+1).padStart(2,'0')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Results */}
      <div className="proj-section">
        <div>
          <div className="num">07 · Results</div>
          <h3>Plots, metrics, validation.</h3>
        </div>
        <div className="content">
          <div className="metric-grid">
            {sys.metrics.map((m,i) => (
              <div key={i} className="metric-tile liquid-glass tier-2">
                <div className="v"><em>{m.v.toString().charAt(0) === '$' ? '' : ''}</em>{m.v} <span style={{fontSize:16, color:'var(--ink-2)'}}>{m.u}</span></div>
                <div className="k">{m.k}</div>
              </div>
            ))}
          </div>
          <div className="project-image-placeholder liquid-glass tier-2" style={{ padding:22, borderRadius:14, marginTop:16 }}>
            <ProjectImage src={sys.images?.detail} alt={`${sys.name} results image`} />
            <div className="caption" style={{ borderTop:'1px solid var(--line)', marginTop:18, paddingTop:14 }}>
              <div className="t">Results / validation image placeholder</div>
              <div className="n mono">IMG · RESULTS</div>
            </div>
          </div>
          <ul style={{ margin:'20px 0 0 0', padding:0, listStyle:'none' }}>
            {sys.results.map((r, i) => (
              <li key={i} style={{ fontSize:14, color:'var(--ink-1)', padding:'10px 0', borderBottom:'1px solid var(--line)' }}>
                <span className="mono" style={{color:'var(--ink-3)', marginRight:14}}>R.{String(i+1).padStart(2,'0')}</span>{r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 8. Insight */}
      <div className="proj-section">
        <div>
          <div className="num">08 · Key Insight</div>
          <h3>What I learned.</h3>
        </div>
        <div className="content">
          <div className="liquid-glass tier-2" style={{padding:28, borderRadius:14}}>
            <div className="serif" style={{fontSize:26, color:'var(--ink-0)', lineHeight:1.35, letterSpacing:'-0.01em'}}>
              "{sys.insight}"
            </div>
          </div>
        </div>
      </div>

      {/* 9. Future */}
      <div className="proj-section">
        <div>
          <div className="num">09 · Future Improvements</div>
          <h3>Where this goes next.</h3>
        </div>
        <div className="content">
          <p>{sys.future}</p>
        </div>
      </div>

      {/* prev / next */}
      <div style={{ marginTop: 48, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
        <div className="liquid-glass tier-2" style={{ padding: 22, borderRadius:14, cursor:'pointer' }} onClick={() => navigate('/project/' + prev.id)}>
          <div className="mono" style={{ fontSize:10, color:'var(--ink-3)', letterSpacing:'.2em' }}>← PREVIOUS · {prev.code}</div>
          <div style={{ fontSize:18, marginTop:6 }}>{prev.name}</div>
          <div className="body-s" style={{ marginTop:4 }}>{prev.oneline}</div>
        </div>
        <div className="liquid-glass tier-2" style={{ padding: 22, borderRadius:14, cursor:'pointer', textAlign:'right' }} onClick={() => navigate('/project/' + next.id)}>
          <div className="mono" style={{ fontSize:10, color:'var(--ink-3)', letterSpacing:'.2em' }}>NEXT · {next.code} →</div>
          <div style={{ fontSize:18, marginTop:6 }}>{next.name}</div>
          <div className="body-s" style={{ marginTop:4 }}>{next.oneline}</div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   EXPERIENCE
   ========================================================= */
const EXPERIENCE = [
  {
    year: 'Sep. 2024 – Present',
    role: 'Co-Founder & Lead Engineer',
    co: 'Crutch On You — Assistive Robotics Startup · San Diego, CA',
    desc: 'Designed a waist-supported crutch mechanism in SolidWorks, fabricated 5+ FDM prototype iterations, and conducted 80+ structured user interviews to define mechanical and electromechanical requirements.',
    chips: ['SolidWorks', 'FDM Prototyping', 'User Research', '2-DOF Mechanism'],
    current: true,
  },
  {
    year: 'Jun. 2024 – Aug. 2024',
    role: 'Engineering Support Intern',
    co: 'Encodia Inc. · San Diego, CA',
    desc: 'Improved thermal ramp-up performance by 13%, eliminated rig-to-rig heating variation through Ishikawa fault analysis, reduced assembly errors by 23%, fabricated SLA molds for PDMS flow-cell casting, and contributed to DHF documentation.',
    chips: ['Thermal Diagnostics', 'Ishikawa', 'QMS / DHF', 'SLA / PDMS'],
  },
  {
    year: 'Jun. 2023 – Aug. 2023',
    role: 'R&D Intern',
    co: 'iTech Robotics and Automation · Pune, India',
    desc: 'Reduced welding cycle time by 12% and increased robot utilization by 8% by optimizing FANUC robot sequencing, redesigning cell layout, and redistributing workflow to minimize idle time.',
    chips: ['FANUC', 'Cell Layout', 'Robot Sequencing', 'Workflow Optimization'],
  },
];

const ExperiencePage = () => {
  return (
    <div className="page page-enter">
      <div className="page-head">
        <div className="title">
          <div className="crumbs">Home<span className="sep">/</span><span style={{color:'var(--accent)'}}>Experience</span></div>
          <h2 className="h-2">Experience from my resume.</h2>
          <div className="body-l" style={{maxWidth:680}}>A resume-grounded timeline of my engineering roles, startup work, and robotics experience.</div>
        </div>
        <div className="meta-col">
          <div>ROLES<b>3</b></div>
          <div>AWARD<b>ASME 2nd · 2025</b></div>
          <div>CURRENTLY<b>Crutch On You</b></div>
        </div>
      </div>

      <div className="timeline-wrap liquid-glass tier-2">
        <div className="timeline">
          {EXPERIENCE.map((e, i) => (
            <div key={i} className={`tl-item ${e.current ? 'current' : ''}`}>
              <div className="year">{e.year}</div>
              <div className="node"/>
              <div className="tl-card liquid-glass">
                <div className="role">{e.role}</div>
                <div className="co">{e.co}</div>
                <div className="desc">{e.desc}</div>
                <div className="chips">
                  {e.chips.map(c => <span key={c}>{c}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        <div className="liquid-glass tier-2" style={{padding:24, borderRadius:14}}>
          <div className="kicker" style={{marginBottom:10}}><span className="dot"/>EDUCATION</div>
          <div style={{fontSize:18}}>M.S. Mechanical Engineering</div>
          <div className="body-s" style={{marginTop:4}}>Controls & Mechatronics · UC San Diego</div>
          <div className="body-s" style={{marginTop:2}}>Expected June 2026</div>
        </div>
        <div className="liquid-glass tier-2" style={{padding:24, borderRadius:14}}>
          <div className="kicker" style={{marginBottom:10}}><span className="dot"/>TECHNICAL SKILLS</div>
          <div className="body" style={{marginTop:6, lineHeight:1.7}}>ESP32 · Embedded C · FSRs · Servo Motors · FDM/SLA 3D Printing · CNC Machining · SolidWorks · ROS2 · Python · MATLAB · LQR · PID</div>
        </div>
        <div className="liquid-glass tier-2" style={{padding:24, borderRadius:14}}>
          <div className="kicker" style={{marginBottom:10}}><span className="dot"/>AWARDS</div>
          <div style={{fontSize:15, color:'var(--ink-0)'}}>ASME San Diego Section — 2nd Place Award</div>
          <div className="body-s" style={{marginTop:4}}>Unmanned Aerial Systems Hybrid Powertrain Testbed · Winter 2025</div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   CONTACT
   ========================================================= */
const ContactSphereCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = r.width * dpr; c.height = r.height * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    let t0 = performance.now();
    const loop = (t) => {
      const dt = (t - t0) / 1000;
      const W = c.width / dpr, H = c.height / dpr;
      ctx.clearRect(0,0,W,H);
      const cx = W / 2, cy = H / 2;
      // spheres cluster
      const spheres = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 + dt * 0.12;
        const lat = Math.sin(i * 1.37) * 1.2;
        const R = 70 + Math.sin(dt * 0.3 + i) * 6;
        const x = Math.cos(a) * Math.cos(lat) * R;
        const y = Math.sin(lat) * R;
        const z = Math.sin(a) * Math.cos(lat) * R;
        spheres.push({ x, y, z, r: 18 + Math.sin(i) * 4 });
      }
      spheres.sort((a, b) => a.z - b.z);
      spheres.forEach(s => {
        const sx = cx + s.x;
        const sy = cy + s.y;
        const scale = (s.z + 120) / 240;
        const rr = s.r * (0.7 + scale * 0.6);
        const g = ctx.createRadialGradient(sx - rr * 0.3, sy - rr * 0.3, 1, sx, sy, rr);
        g.addColorStop(0, `rgba(230,240,250,${0.4 + scale * 0.5})`);
        g.addColorStop(0.55, `rgba(120,140,160,${0.3 + scale * 0.3})`);
        g.addColorStop(1, `rgba(20,24,28,${0.15 + scale * 0.3})`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(sx, sy, rr, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${0.15 * scale})`;
        ctx.beginPath(); ctx.arc(sx, sy, rr, 0, Math.PI * 2); ctx.stroke();
      });
      requestAnimationFrame(loop);
    };
    const raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} style={{width:'100%', height:'100%'}}/>;
};

const ContactPage = () => (
  <div className="page page-enter">
    <div className="page-head">
      <div className="title">
        <div className="crumbs">Home<span className="sep">/</span><span style={{color:'var(--accent)'}}>Contact</span></div>
        <h2 className="h-2">Let's talk systems.</h2>
        <div className="body-l" style={{maxWidth:620}}>I'm open to research, full-time, and collaboration discussions — especially in controls, robotics, and hardware-rich product work.</div>
      </div>
      <div className="meta-col">
        <div>BASED IN<b>San Diego, CA</b></div>
        <div>TIMEZONE<b>PT · UTC-8</b></div>
        <div>RESPONSE<b>Within 24h</b></div>
      </div>
    </div>

    <div className="contact-layout">
      <div className="contact-card liquid-glass tier-3">
        <div>
          <div className="kicker" style={{marginBottom:20}}><span className="dot"/>REACH OUT</div>
          <h2>From <em>signals</em><br/>to conversations.</h2>
        </div>
        <div className="contact-lines">
          {[
            { k: 'Email', v: 'shivharshkand@gmail.com', icon: 'mail', href: 'mailto:shivharshkand@gmail.com' },
            { k: 'LinkedIn', v: 'linkedin.com/in/shivharshkand', icon: 'link', href: 'https://linkedin.com/in/shivharshkand' },
            { k: 'GitHub', v: 'github.com/shivharshkand', icon: 'git', href: 'https://github.com/shivharshkand' },
            { k: 'Phone', v: '(858) 260-9188', icon: 'node', href: 'tel:+18582609188' },
            { k: 'Resume', v: 'Download PDF', icon: 'download', href: '#' },
          ].map(l => (
            <a key={l.k} className="contact-line" href={l.href}>
              <div className="k">{l.k}</div>
              <div className="val">{l.v}</div>
              <div className="go row"><Icon name={l.icon} size={14}/><span>→</span></div>
            </a>
          ))}
        </div>
      </div>

      <div className="contact-right liquid-glass tier-3">
        <ContactSphereCanvas/>
        <div className="tag kicker"><span className="dot"/>BUILD WITH ME</div>
        <div className="now">
          <div className="k">CURRENTLY ACCEPTING</div>
          <div className="v">Full-time controls / robotics roles (Summer 2026 grad), research collaborations, and early-stage hardware startup conversations.</div>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   App shell
   ========================================================= */
const App = () => {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const fn = () => { setRoute(parseHash()); window.scrollTo({top:0, behavior:'instant'}); };
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);

  let body = null;
  if (route.page === 'home') body = <HomePage/>;
  else if (route.page === 'systems') body = <SystemsPage initialId={route.id}/>;
  else if (route.page === 'project') body = <ProjectPage id={route.id}/>;
  else if (route.page === 'experience') body = <ExperiencePage/>;
  else if (route.page === 'contact') body = <ContactPage/>;

  return (
    <>
      <div className="grid-overlay"/>
      <div className="scanline"/>
      <Nav route={route}/>
      <div key={route.page + (route.id || '')}>{body}</div>
    </>
  );
};

createRoot(document.getElementById('root')).render(<App/>);
