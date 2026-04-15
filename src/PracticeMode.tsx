import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useRef, useEffect, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .practice-root {
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
    --correct-bg: rgba(76,175,116,0.1);
    --correct-border: rgba(76,175,116,0.25);
    --wrong: #c94c4c;
    --wrong-bg: rgba(201,76,76,0.1);
    --wrong-border: rgba(201,76,76,0.25);

    min-height: 100vh;
    background: var(--bg);
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
  }

  .practice-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .practice-header-left {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }

  .practice-header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .practice-badge {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: #b06ecf;
    background: rgba(176,110,207,0.12);
    border: 1px solid rgba(176,110,207,0.25);
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
  }
  .back-btn:hover { border-color: var(--accent-dim); color: var(--accent); }

  .practice-body {
    display: flex;
    flex: 1;
  }

  /* ── Sidebar ── */
  .practice-sidebar {
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
  }

  .variation-sub {
    font-size: 15px;
    color: var(--text-secondary);
    margin-top: 8px;
    line-height: 1.5;
  }

  /* Drop-in info */
  .dropin-block {
    background: rgba(176,110,207,0.08);
    border: 1px solid rgba(176,110,207,0.2);
    border-radius: 10px;
    padding: 16px 18px;
  }

  .dropin-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    margin-bottom: 6px;
  }

  .dropin-value {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    color: #b06ecf;
  }

  /* Score */
  .score-block {
    display: flex;
    gap: 10px;
  }

  .score-card {
    flex: 1;
    border-radius: 8px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid;
  }

  .score-card.correct { background: var(--correct-bg); border-color: var(--correct-border); }
  .score-card.wrong   { background: var(--wrong-bg);   border-color: var(--wrong-border); }

  .score-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
  }

  .score-value {
    font-family: 'DM Mono', monospace;
    font-size: 28px;
    font-weight: 500;
  }

  .score-card.correct .score-value { color: var(--correct); }
  .score-card.wrong   .score-value { color: var(--wrong); }

  /* Weight bar — shows how likely a variation is to appear */
  .weight-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .weight-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .weight-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .weight-name {
    font-size: 11px;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
  }

  .weight-pct {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--text-dim);
    flex-shrink: 0;
  }

  .weight-track {
    height: 3px;
    background: var(--surface2);
    border-radius: 2px;
    overflow: hidden;
  }

  .weight-fill {
    height: 100%;
    border-radius: 2px;
    background: #b06ecf;
    transition: width 0.4s ease;
  }

  .weight-fill.active {
    background: var(--accent);
  }

  /* Feedback flash */
  .feedback-flash {
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
    opacity: 0;
    transition: opacity 0.2s ease;
    text-align: center;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feedback-flash.visible { opacity: 1; }
  .feedback-flash.correct { background: var(--correct-bg); border: 1px solid var(--correct-border); color: var(--correct); }
  .feedback-flash.wrong   { background: var(--wrong-bg);   border: 1px solid var(--wrong-border);   color: var(--wrong); }

  /* ── Board area ── */
  .practice-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: var(--bg);
  }

  .board-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
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
  }

  .orientation-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }

  .orientation-dot.white { background: #f0e8d8; }
  .orientation-dot.black { background: #2c2620; border: 2px solid var(--text-secondary); }

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

  /* ── Overlay ── */
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

  .overlay-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #b06ecf;
    margin-bottom: 4px;
  }

  .overlay-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .overlay-sub {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .overlay-stat {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: var(--text-secondary);
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .overlay-stat-val { color: var(--text-primary); }

  .overlay-actions {
    display: flex;
    gap: 10px;
    width: 100%;
    margin-top: 4px;
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
  .btn-secondary:hover { border-color: var(--accent-dim); color: var(--accent); }
`;

// ── Spaced repetition weight helpers ─────────────────────────────────────────

const INITIAL_WEIGHT = 10;
const CORRECT_DECAY  = 0.55;
const WRONG_BOOST    = 1.8;
const MIN_WEIGHT     = 1;
const MAX_WEIGHT     = 30;

function initWeights(count) {
  return Array(count).fill(INITIAL_WEIGHT);
}

function updateWeight(weights, index, correct) {
  return weights.map((w, i) => {
    if (i !== index) return w;
    const next = correct ? w * CORRECT_DECAY : w * WRONG_BOOST;
    return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, next));
  });
}

function pickWeightedIndex(weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function pickDropIn(moves, openingColor) {
  const maxDropIn = Math.min(4, Math.floor(moves.length / 2) * 2 - 2);
  const options = [0, 2, 4].filter(p => p <= Math.max(0, maxDropIn));
  if (openingColor === "black") {
    const blackOptions = [1, 3, 5].filter(p => p <= Math.max(1, maxDropIn + 1) && p < moves.length);
    if (blackOptions.length === 0) return 1;
    return blackOptions[Math.floor(Math.random() * blackOptions.length)];
  }
  return options[Math.floor(Math.random() * options.length)];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PracticeMode({ opening, onExit }) {
  const gameRef = useRef(new Chess());
  const openingColor = opening.name.includes("Defense") ? "black" : "white";

  const [weights, setWeights] = useState(() => initWeights(opening.variations.length));
  const [variationIndex, setVariationIndex] = useState(() => pickWeightedIndex(initWeights(opening.variations.length)));
  const [dropInAt, setDropInAt] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentVariation = opening.variations[variationIndex];
  const moves = currentVariation.moves;

  const setupRound = useCallback((varIdx, newWeights) => {
    const game = gameRef.current;
    while (game.history().length > 0) game.undo();

    const variation = opening.variations[varIdx];
    const dropIn = pickDropIn(variation.moves, openingColor);

    for (let i = 0; i < dropIn; i++) {
      game.move(variation.moves[i]);
    }

    setFen(game.fen());
    setVariationIndex(varIdx);
    setDropInAt(dropIn);
    setMoveIndex(dropIn);
    setWeights(newWeights);
  }, [opening, openingColor]);

  // Initial setup
  useEffect(() => {
    const idx = pickWeightedIndex(weights);
    setupRound(idx, weights);
  }, []);

  // Auto-play opponent moves
  // FIX: read moves fresh from opening.variations[variationIndex] inside the
  // effect to avoid stale closures when variationIndex and moveIndex update
  // in the same render cycle.
  useEffect(() => {
    const game = gameRef.current;
    const currentMoves = opening.variations[variationIndex].moves;
    if (moveIndex >= currentMoves.length) return;
    const isWhiteToMove = game.turn() === "w";
    const isOpeningWhite = openingColor === "white";
    if ((isWhiteToMove && !isOpeningWhite) || (!isWhiteToMove && isOpeningWhite)) {
      const timer = setTimeout(() => {
        const move = game.move(currentMoves[moveIndex], { sloppy: true });
        if (move) {
          setFen(game.fen());
          const nextMoveIndex = moveIndex + 1;
          setMoveIndex(nextMoveIndex);
          if (nextMoveIndex === currentMoves.length) finishRound(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [moveIndex, variationIndex, openingColor]);

  function showFeedback(type) {
    setFeedback(type);
    setTimeout(() => setFeedback(null), 800);
  }

  function finishRound(correct) {
    const newWeights = updateWeight(weights, variationIndex, correct);
    setRoundsPlayed(r => r + 1);
    if (correct) setSessionCorrect(c => c + 1);
    else setSessionWrong(w => w + 1);

    setTimeout(() => {
      const nextIdx = pickWeightedIndex(newWeights);
      setupRound(nextIdx, newWeights);
    }, 600);
  }

  function getMoveOptions(square) {
    const game = gameRef.current;

    const moves = game.moves({
      square,
      verbose: true
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};

    for (const move of moves) {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to)?.color !== game.get(square)?.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    }

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };

    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick({ square, piece }) {
    // FIX: was `overlayState !== "none"` which is undefined in this component;
    // the correct guard is the showSummary boolean.
    if (showSummary) return;

    // 1. No piece selected yet → select one
    if (!moveFrom) {
      if (!piece) return;
      const hasMoves = getMoveOptions(square);
      if (hasMoves) setMoveFrom(square);
      return;
    }

    // 2. Same square clicked → deselect
    if (square === moveFrom) {
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    // 3. Try to make move via onPieceDrop (source of truth)
    const success = onPieceDrop({ sourceSquare: moveFrom, targetSquare: square });

    if (success) {
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    // 4. Move failed → maybe selecting a new piece
    if (piece) {
      const hasMoves = getMoveOptions(square);
      setMoveFrom(hasMoves ? square : '');
    } else {
      setMoveFrom('');
      setOptionSquares({});
    }
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    const game = gameRef.current;
    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) { setFen(game.fen()); return false; }

      const expected = moves[moveIndex];
      if (move.san !== expected) {
        game.undo();
        setFen(game.fen());
        showFeedback("wrong");
        setSessionWrong(w => w + 1);
        setWeights(w => updateWeight(w, variationIndex, false));
        return false;
      }

      showFeedback("correct");
      const next = moveIndex + 1;
      setMoveIndex(next);
      setFen(game.fen());

      if (next === moves.length) finishRound(true);
      return true;
    } catch (e) {
      return false;
    }
  }

  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const variationSub = currentVariation.variation || "";
  const dropInMoveNum = Math.floor(dropInAt / 2) + 1;
  const accuracy = (sessionCorrect + sessionWrong) > 0
    ? Math.round((sessionCorrect / (sessionCorrect + sessionWrong)) * 100)
    : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="practice-root">

        <header className="practice-header">
          <div className="practice-header-left">
            <h1>{opening.name}</h1>
            <span className="practice-badge">Practice</span>
          </div>
          <button className="back-btn" onClick={onExit}>← Back to openings</button>
        </header>

        <div className="practice-body">

          <aside className="practice-sidebar">

            <div>
              <div className="sidebar-section-label">Current variation</div>
              <div className="variation-title">
                {variationSub ? variationSub.split(",")[0] : currentVariation.name?.split(":")?.[0]}
              </div>
              {variationSub.includes(",") && (
                <div className="variation-sub">{variationSub.split(",").slice(1).join(",").trim()}</div>
              )}
            </div>

            <div className="dropin-block">
              <div className="dropin-label">Starting from</div>
              <div className="dropin-value">
                {dropInAt === 0 ? "Move 1 — from the start" : `Move ${dropInMoveNum} — mid-line`}
              </div>
            </div>

            <div>
              <div className="sidebar-section-label">Session</div>
              <div className="score-block">
                <div className="score-card correct">
                  <span className="score-label">Correct</span>
                  <span className="score-value">{sessionCorrect}</span>
                </div>
                <div className="score-card wrong">
                  <span className="score-label">Wrong</span>
                  <span className="score-value">{sessionWrong}</span>
                </div>
              </div>
            </div>

            <div className={`feedback-flash ${feedback ? `visible ${feedback}` : ""}`}>
              {feedback === "correct" ? "✓ Correct" : feedback === "wrong" ? "✗ Wrong move — try again" : "‎"}
            </div>

            <div>
              <div className="sidebar-section-label">Variation weights</div>
              <div className="weight-list">
                {opening.variations.map((v, i) => {
                  const pct = Math.round((weights[i] / totalWeight) * 100);
                  const label = v.variation?.split(",")?.[0] || `Variation ${i + 1}`;
                  return (
                    <div key={i} className="weight-row">
                      <div className="weight-label-row">
                        <span className="weight-name">{label}</span>
                        <span className="weight-pct">{pct}%</span>
                      </div>
                      <div className="weight-track">
                        <div
                          className={`weight-fill ${i === variationIndex ? "active" : ""}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </aside>

          <main className="practice-main">
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
                    onSquareClick,
                    squareStyles: optionSquares,
                  }}
                />
              </div>
            </div>
          </main>

        </div>

        {showSummary && (
          <div className="overlay">
            <div className="overlay-card">
              <div className="overlay-eyebrow">Practice session</div>
              <div className="overlay-title">Good work.</div>
              <div className="overlay-sub">
                {roundsPlayed} variations completed in this session.
              </div>
              <div className="overlay-stat">
                <span>Accuracy</span>
                <span className="overlay-stat-val">{accuracy}%</span>
              </div>
              <div className="overlay-stat">
                <span>Correct / Wrong</span>
                <span className="overlay-stat-val">{sessionCorrect} / {sessionWrong}</span>
              </div>
              <div className="overlay-actions">
                <button className="btn-primary" onClick={() => setShowSummary(false)}>Keep going</button>
                <button className="btn-secondary" onClick={onExit}>Exit</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
