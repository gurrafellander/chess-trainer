import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useRef, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .study-root {
    --bg: #1a1612;
    --surface: #221e19;
    --surface2: #2c2620;
    --border: #3d3530;
    --accent: #c9a84c;
    --accent-dim: #8a6f2e;
    --text-primary: #f0e8d8;
    --text-secondary: #9e8e78;
    --text-dim: #5a4e42;
    --correct: #4caf74;
    --wrong: #c94c4c;

    min-height: 100vh;
    background: var(--bg);
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
  }

  .study-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .study-header-left {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }

  .study-header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0.01em;
  }

  .eco-badge {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: var(--accent);
    background: rgba(201,168,76,0.12);
    border: 1px solid rgba(201,168,76,0.25);
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.18s ease;
    letter-spacing: 0.01em;
  }

  .back-btn:hover {
    border-color: var(--accent-dim);
    color: var(--accent);
  }

  .study-body {
    display: flex;
    flex: 1;
    gap: 0;
  }

  /* ── Sidebar ── */
  .study-sidebar {
    width: 360px;
    flex-shrink: 0;
    border-right: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    flex-direction: column;
    padding: 32px 28px;
    gap: 32px;
    overflow-y: auto;
  }

  .sidebar-section-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 12px;
  }

  .variation-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    line-height: 1.5;
    color: var(--text-primary);
    font-weight: 400;
  }

  .variation-sub {
    font-size: 15px;
    color: var(--text-secondary);
    margin-top: 8px;
    line-height: 1.5;
  }

  .progress-block {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .progress-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .progress-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress-label {
    font-size: 12px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .progress-value {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .progress-track {
    height: 5px;
    background: var(--surface2);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    background: var(--accent);
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-fill.moves {
    background: linear-gradient(90deg, #4c8ecf, #4caf74);
  }

  .hint-block {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 18px 20px;
  }

  .hint-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .hint-move {
    font-family: 'DM Mono', monospace;
    font-size: 26px;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.04em;
  }

  .hint-done {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    color: var(--correct);
    font-style: italic;
  }

  .move-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 4px;
  }

  .move-chip {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    padding: 4px 9px;
    border-radius: 5px;
    border: 1px solid transparent;
    transition: all 0.15s;
  }

  .move-chip.done {
    color: var(--text-dim);
    background: var(--surface2);
    border-color: var(--border);
    text-decoration: line-through;
    text-decoration-color: var(--text-dim);
  }

  .move-chip.current {
    color: var(--accent);
    background: rgba(201,168,76,0.1);
    border-color: rgba(201,168,76,0.3);
  }

  .move-chip.upcoming {
    color: var(--text-dim);
  }

  /* ── Board area ── */
  .study-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: var(--bg);
  }

  .board-wrap {
    width: min(960px, calc(100vw - 440px), calc(100vh - 240px));
    aspect-ratio: 1;
    border-radius: 4px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px var(--border),
      0 24px 80px rgba(0,0,0,0.6),
      0 8px 24px rgba(0,0,0,0.4);
  }

  .orientation-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 15px;
    color: var(--text-secondary);
    letter-spacing: 0.01em;
  }

  .orientation-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }

  .orientation-dot.white { background: #f0e8d8; }
  .orientation-dot.black { background: #2c2620; border: 2px solid var(--text-secondary); }

  .board-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  /* ── Overlays ── */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,8,6,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
  }

  .overlay-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 48px 44px;
    width: 420px;
    max-width: calc(100vw - 48px);
    box-shadow: 0 40px 100px rgba(0,0,0,0.7);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .overlay-icon { font-size: 40px; margin-bottom: 4px; }

  .overlay-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--correct);
  }

  .overlay-eyebrow.gold { color: var(--accent); }

  .overlay-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .overlay-sub {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .overlay-actions {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .btn-primary {
    flex: 1;
    background: var(--accent);
    color: #1a1612;
    border: none;
    border-radius: 8px;
    padding: 13px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .btn-primary:hover { background: #d4b45a; }

  .btn-secondary {
    flex: 1;
    background: none;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 13px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .btn-secondary:hover {
    border-color: var(--accent-dim);
    color: var(--accent);
  }
`;

export default function StudyMode({ opening, setOpening, done }) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [variationIndex, setVariationIndex] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [justMoved, setJustMoved] = useState(false);
  // 'none' | 'variation' | 'complete'
  const [overlayState, setOverlayState] = useState("none");

  const currentVariation = opening.variations[variationIndex];
  const moves = currentVariation.moves;
  const openingColor = opening.name.includes("Defense") ? "black" : "white";

  // Sync board whenever variation or moveIndex changes
  useEffect(() => {
    const game = gameRef.current;
    while (game.history().length > 0) game.undo();
    for (let i = 0; i < moveIndex; i++) game.move(moves[i]);
    setFen(game.fen());
    // For black openings at start of variation, trigger opponent's first move
    if (moveIndex === 0 && openingColor === "black") setJustMoved(true);
  }, [variationIndex, opening.name]);

  // Auto-play opponent moves
  useEffect(() => {
    const game = gameRef.current;
    if (moveIndex >= moves.length || !justMoved) return;
    const isWhiteToMove = game.turn() === "w";
    const isOpeningWhite = openingColor === "white";
    if ((isWhiteToMove && !isOpeningWhite) || (!isWhiteToMove && isOpeningWhite)) {
      const autoMove = moves[moveIndex];
      const move = game.move(autoMove, { sloppy: true });
      if (move) {
        setFen(game.fen());

        const nextMoveIndex = moveIndex + 1;
        setMoveIndex(nextMoveIndex);
      
        setJustMoved(false);
        if (nextMoveIndex === moves.length) {
          console.log("variation done");
          console.log(variationIndex, opening.variations.length - 1)
          // Variation complete — show overlay instead of immediately resetting
          if (variationIndex < opening.variations.length - 1) {
            setOverlayState("variation");
          } else {
            setOverlayState("complete");
          }
        }
      }
    }
  }, [moveIndex, justMoved]);

  function advanceToNextVariation() {
    setOverlayState("none");
    setMoveIndex(0);
    setJustMoved(false);
    setVariationIndex(v => v + 1);
  }

  function onPieceDrop(args) {
    if (overlayState !== "none") return false;
    const { sourceSquare, targetSquare } = args;
    const game = gameRef.current;
    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) { setFen(game.fen()); return false; }

      const expectedMove = moves[moveIndex];
      if (move.san !== expectedMove) {
        game.undo();
        setFen(game.fen());
        return false;
      }

      const nextMoveIndex = moveIndex + 1;
      setMoveIndex(nextMoveIndex);
      setFen(game.fen());
      setJustMoved(true);

      if (nextMoveIndex === moves.length) {
        console.log("variation done");
        console.log(variationIndex, opening.variations.length - 1)
        // Variation complete — show overlay instead of immediately resetting
        if (variationIndex < opening.variations.length - 1) {
          setOverlayState("variation");
        } else {
          setOverlayState("complete");
        }
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  const varPct = (variationIndex / opening.variations.length) * 100;
  const movePct = (moveIndex / moves.length) * 100;

  const variationSub = currentVariation.variation || "";
  const variationMain = currentVariation.name?.split(":")?.[0] ?? opening.name;
  const nextVariation = opening.variations[variationIndex + 1];
  const nextVariationName = nextVariation?.variation?.split(",")?.[0] || `Variation ${variationIndex + 2}`;

  return (
    <>
      <style>{styles}</style>
      <div className="study-root">

        <header className="study-header">
          <div className="study-header-left">
            <h1>{opening.name}</h1>
            {currentVariation.eco && (
              <span className="eco-badge">{currentVariation.eco}</span>
            )}
          </div>
          <button className="back-btn" onClick={() => setOpening(null)}>
            ← Back to openings
          </button>
        </header>

        <div className="study-body">
          <aside className="study-sidebar">

            <div>
              <div className="sidebar-section-label">Current variation</div>
              {variationSub ? (
                <>
                  <div className="variation-title">{variationSub.split(",")[0]}</div>
                  {variationSub.includes(",") && (
                    <div className="variation-sub">{variationSub.split(",").slice(1).join(",").trim()}</div>
                  )}
                </>
              ) : (
                <div className="variation-title">{variationMain}</div>
              )}
            </div>

            <div className="progress-block">
              <div className="progress-row">
                <div className="progress-label-row">
                  <span className="progress-label">Variation</span>
                  <span className="progress-value">{variationIndex + 1} / {opening.variations.length}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${varPct}%` }} />
                </div>
              </div>
              <div className="progress-row">
                <div className="progress-label-row">
                  <span className="progress-label">Moves</span>
                  <span className="progress-value">{moveIndex} / {moves.length}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill moves" style={{ width: `${movePct}%` }} />
                </div>
              </div>
            </div>

            <div className="hint-block">
              <div className="hint-label">Your move</div>
              {moveIndex < moves.length ? (
                <div className="hint-move">{moves[moveIndex]}</div>
              ) : (
                <div className="hint-done">Variation complete ✓</div>
              )}
            </div>

            <div>
              <div className="sidebar-section-label">Move sequence</div>
              <div className="move-list">
                {moves.map((m, i) => (
                  <span
                    key={i}
                    className={`move-chip ${i < moveIndex ? "done" : i === moveIndex ? "current" : "upcoming"}`}
                  >
                    {i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ""}{m}
                  </span>
                ))}
              </div>
            </div>

          </aside>

          <main className="study-main">
            <div className="board-column">
              <div className="orientation-badge">
                <div className={`orientation-dot ${openingColor}`} />
                Playing as {openingColor}
              </div>
              <div className="board-wrap">
                <Chessboard
                  options={{
                    position: fen,
                    boardOrientation: openingColor,
                    onPieceDrop,
                  }}
                />
              </div>
            </div>
          </main>
        </div>

        {/* Variation complete overlay */}
        {overlayState === "variation" && (
          <div className="overlay">
            <div className="overlay-card">
              <div className="overlay-icon">✓</div>
              <div className="overlay-eyebrow">Variation complete</div>
              <div className="overlay-title">Nice work.</div>
              <div className="overlay-sub">
                Up next: <strong>{nextVariationName}</strong>
              </div>
              <div className="overlay-actions">
                <button className="btn-primary" onClick={advanceToNextVariation}>
                  Next variation →
                </button>
                <button className="btn-secondary" onClick={() => setOpening(null)}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All variations complete — move to recall */}
        {overlayState === "complete" && (
          <div className="overlay">
            <div className="overlay-card">
              <div className="overlay-icon">♟</div>
              <div className="overlay-eyebrow gold">Study complete</div>
              <div className="overlay-title">All variations learned.</div>
              <div className="overlay-sub">
                You've studied all {opening.variations.length} variations of {opening.name}. Ready to test yourself?
              </div>
              <div className="overlay-actions">
                <button className="btn-primary" onClick={done}>
                  Start recall mode →
                </button>
                <button className="btn-secondary" onClick={() => setOpening(null)}>
                  Back to menu
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
