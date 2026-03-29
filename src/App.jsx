import { openings } from "./openings"
import { useState } from "react"
import Trainer from "./Trainer"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .home-root {
    --bg: #1a1612;
    --surface: #221e19;
    --surface2: #2c2620;
    --border: #3d3530;
    --accent: #c9a84c;
    --accent-dim: #8a6f2e;
    --text-primary: #f0e8d8;
    --text-secondary: #9e8e78;
    --text-dim: #5a4e42;

    min-height: 100vh;
    background: var(--bg);
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Hero ── */
  .home-hero {
    padding: 64px 48px 48px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    position: relative;
    overflow: hidden;
  }

  /* Subtle chess-pattern background */
  .home-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      repeating-conic-gradient(
        rgba(201,168,76,0.03) 0% 25%,
        transparent 0% 50%
      );
    background-size: 48px 48px;
    pointer-events: none;
  }

  .hero-inner {
    position: relative;
    max-width: 860px;
  }

  .hero-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hero-eyebrow::before {
    content: '';
    display: block;
    width: 24px;
    height: 1px;
    background: var(--accent);
  }

  .home-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .home-hero h1 em {
    font-style: italic;
    color: var(--accent);
  }

  .hero-sub {
    font-size: 16px;
    color: var(--text-secondary);
    font-weight: 300;
    line-height: 1.6;
    max-width: 480px;
  }

  .hero-stats {
    display: flex;
    gap: 32px;
    margin-top: 36px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ── Search / filter bar ── */
  .home-toolbar {
    padding: 20px 48px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--surface);
  }

  .search-wrap {
    position: relative;
    flex: 1;
    max-width: 360px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-dim);
    font-size: 14px;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 9px 12px 9px 36px;
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color 0.18s;
  }

  .search-input::placeholder { color: var(--text-dim); }
  .search-input:focus { border-color: var(--accent-dim); }

  .result-count {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--text-dim);
    margin-left: auto;
  }

  /* ── Grid ── */
  .home-grid-wrap {
    padding: 40px 48px 64px;
  }

  .home-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }

  .opening-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 22px 24px;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    overflow: hidden;
  }

  .opening-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0 0 12px 12px;
  }

  .opening-card:hover {
    background: var(--surface2);
    border-color: var(--accent-dim);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }

  .opening-card:hover::after {
    transform: scaleX(1);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .card-name {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text-primary);
  }

  .card-arrow {
    color: var(--text-dim);
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
    transition: transform 0.2s ease, color 0.2s ease;
  }

  .opening-card:hover .card-arrow {
    transform: translate(3px, -3px);
    color: var(--accent);
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-variations {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--text-dim);
  }

  .card-color-badge {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 3px;
    border: 1px solid;
  }

  .card-color-badge.white {
    color: #d4c9b4;
    border-color: #3d3530;
    background: rgba(240, 232, 216, 0.05);
  }

  .card-color-badge.black {
    color: var(--accent);
    border-color: rgba(201,168,76,0.25);
    background: rgba(201,168,76,0.06);
  }

  /* Mini variation bar */
  .card-bar-track {
    height: 3px;
    background: var(--surface2);
    border-radius: 2px;
    overflow: hidden;
  }

  .card-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-dim), var(--accent));
    border-radius: 2px;
  }

  /* ── Mode picker overlay ── */
  .mode-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,8,6,0.82);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    backdrop-filter: blur(6px);
  }

  .mode-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 40px;
    width: 480px;
    max-width: calc(100vw - 32px);
    box-shadow: 0 40px 100px rgba(0,0,0,0.7);
    position: relative;
  }

  .mode-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: color 0.15s;
  }
  .mode-close:hover { color: var(--text-secondary); }

  .mode-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 10px;
  }

  .mode-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
    line-height: 1.2;
  }

  .mode-sub {
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 28px;
    font-family: 'DM Mono', monospace;
  }

  .mode-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mode-option {
    display: grid;
    grid-template-columns: 40px 1fr;
    grid-template-rows: auto auto;
    column-gap: 14px;
    row-gap: 2px;
    text-align: left;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 18px;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s, transform 0.15s;
    font-family: 'DM Sans', sans-serif;
  }

  .mode-option:hover {
    border-color: var(--accent-dim);
    background: #2f2a23;
    transform: translateX(3px);
  }

  .mode-option-icon {
    grid-row: 1 / 3;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mode-option-label {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    align-self: end;
  }

  .mode-option-desc {
    font-size: 12px;
    color: var(--text-dim);
    align-self: start;
    line-height: 1.4;
  }

  /* Empty state */
  .empty-state {
    padding: 80px;
    text-align: center;
    color: var(--text-dim);
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 18px;
  }
`;

const MAX_VARIATIONS = Math.max(...openings.map(o => o.variations.length));

export default function App() {
  const [opening, setOpening] = useState(null);
  const [pendingOpening, setPendingOpening] = useState(null); // opening awaiting mode selection
  const [mode, setMode] = useState(null);
  const [search, setSearch] = useState("");

  if (opening && mode) {
    return <Trainer opening={opening} mode={mode} setOpening={() => { setOpening(null); setMode(null); }} />;
  }

  const filtered = openings.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalVariations = openings.reduce((s, o) => s + o.variations.length, 0);

  return (
    <>
      <style>{styles}</style>
      <div className="home-root">

        {/* Hero */}
        <header className="home-hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">Chess Opening Trainer</div>
            <h1>Master your <em>openings</em>,<br />one line at a time.</h1>
            <p className="hero-sub">
              Study variations linearly, move by move. Build pattern recognition through deliberate repetition.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">{openings.length}</span>
                <span className="stat-label">Openings</span>
              </div>
              <div className="stat">
                <span className="stat-value">{totalVariations.toLocaleString()}</span>
                <span className="stat-label">Variations</span>
              </div>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="home-toolbar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search openings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="result-count">{filtered.length} openings</span>
        </div>

        {/* Grid */}
        <div className="home-grid-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">No openings match "{search}"</div>
          ) : (
            <div className="home-grid">
              {filtered.map(o => {
                const isDefense = o.name.includes("Defense");
                const barWidth = Math.round((o.variations.length / MAX_VARIATIONS) * 100);
                return (
                  <div
                    key={o.name}
                    className="opening-card"
                    onClick={() => setPendingOpening(o)}
                  >
                    <div className="card-top">
                      <span className="card-name">{o.name}</span>
                      <span className="card-arrow">↗</span>
                    </div>
                    <div className="card-bar-track">
                      <div className="card-bar-fill" style={{ width: `${barWidth}%` }} />
                    </div>
                    <div className="card-meta">
                      <span className="card-variations">{o.variations.length} variations</span>
                      <span className={`card-color-badge ${isDefense ? "black" : "white"}`}>
                        {isDefense ? "Black" : "White"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mode picker overlay */}
        {pendingOpening && (
          <div className="mode-overlay" onClick={() => setPendingOpening(null)}>
            <div className="mode-card" onClick={e => e.stopPropagation()}>
              <button className="mode-close" onClick={() => setPendingOpening(null)}>✕</button>
              <div className="mode-eyebrow">Choose mode</div>
              <div className="mode-title">{pendingOpening.name}</div>
              <div className="mode-sub">{pendingOpening.variations.length} variations</div>
              <div className="mode-options">
                <button className="mode-option" onClick={() => { setOpening(pendingOpening); setMode("study"); setPendingOpening(null); }}>
                  <div className="mode-option-icon">📖</div>
                  <div className="mode-option-label">Study</div>
                  <div className="mode-option-desc">Learn variations move by move with guidance</div>
                </button>
                <button className="mode-option" onClick={() => { setOpening(pendingOpening); setMode("recall"); setPendingOpening(null); }}>
                  <div className="mode-option-icon">🧠</div>
                  <div className="mode-option-label">Recall</div>
                  <div className="mode-option-desc">Test yourself through all variations in order</div>
                </button>
                <button className="mode-option" onClick={() => { setOpening(pendingOpening); setMode("practice"); setPendingOpening(null); }}>
                  <div className="mode-option-icon">⚡</div>
                  <div className="mode-option-label">Practice</div>
                  <div className="mode-option-desc">Spaced repetition — dropped in at a random move</div>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
