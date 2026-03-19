import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useRef } from "react";

export default function RecallMode({ opening, onExit, onRestart }) {
  const gameRef = useRef(new Chess());

  const [fen, setFen] = useState(gameRef.current.fen());
  const [variationIndex, setVariationIndex] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);

  const [isComplete, setIsComplete] = useState(false);

  // Track stats per variation
  const [stats, setStats] = useState(
    opening.variations.map(() => ({
      correct: 0,
      incorrect: 0,
    }))
  );

  const moves = opening.variations[variationIndex];

  function updateStats(type) {
    setStats((prev) => {
      const updated = [...prev];
      updated[variationIndex] = {
        ...updated[variationIndex],
        [type]: updated[variationIndex][type] + 1,
      };
      return updated;
    });
  }

  function resetGame() {
    const game = gameRef.current;
    while (game.history().length > 0) game.undo();

    setFen(game.fen());
    setVariationIndex(0);
    setMoveIndex(0);
    setIsComplete(false);

    setStats(
      opening.variations.map(() => ({
        correct: 0,
        incorrect: 0,
      }))
    );
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    const game = gameRef.current;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) {
        setFen(game.fen());
        return false;
      }

      const expectedMove = moves[moveIndex];

      if (move.san !== expectedMove) {
        updateStats("incorrect");

        game.undo();
        setFen(game.fen());
        return false;
      }

      updateStats("correct");

      const nextMoveIndex = moveIndex + 1;
      setMoveIndex(nextMoveIndex);
      setFen(game.fen());

      // End of variation
      if (nextMoveIndex === moves.length) {
        if (variationIndex < opening.variations.length - 1) {
          const game = gameRef.current;

          setVariationIndex((v) => v + 1);
          setMoveIndex(0);

          while (game.history().length > 0) game.undo();
          setFen(game.fen());
        } else {
          setIsComplete(true);
        }
      }

      return true;
    } catch (e) {
      console.error("Move error:", e);
      return false;
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <h2>Recall Mode</h2>

      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
        }}
      />

      <p>
        Variation {variationIndex + 1} / {opening.variations.length}
      </p>
      <p>
        Move {moveIndex + 1} / {moves.length}
      </p>

      {/* OVERLAY */}
      {isComplete && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <h2>Module Complete</h2>

            <div>
              {stats.map((s, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <strong>Variation {i + 1}</strong>
                  <p>Correct: {s.correct}</p>
                  <p>Incorrect: {s.incorrect}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => {
                  if (onExit) onExit(); // hook for navigation
                }}
                style={buttonStyle}
              >
                Back to Menu
              </button>

              <button
                onClick={() => {
                  resetGame();
                  if (onRestart) onRestart(); // optional external hook
                }}
                style={buttonStyle}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "300px",
  textAlign: "center",
};

const buttonStyle = {
  margin: "10px",
  padding: "10px 15px",
  cursor: "pointer",
};
