import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useRef } from "react";

export default function StudyMode({ opening, done }) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [variationIndex, setVariationIndex] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);

  const moves = opening.variations[variationIndex];

  function onPieceDrop(source, target, piece) {
    console.log("Dropped piece:", piece, "from", source, "to", target);
    const game = gameRef.current;

    const move = game.move({ from: source, to: target, promotion: "q" });
    if (!move) {
      console.log("Invalid move according to chess.js");
      setFen(game.fen());
      return false;
    }

    const expectedMove = moves[moveIndex];
    if (move.san !== expectedMove) {
      console.log("Move not expected:", move.san, "expected:", expectedMove);
      game.undo();
      setFen(game.fen());
      alert(`Wrong move! Expected: ${expectedMove}`);
      return false;
    }

    console.log("Move accepted:", move.san);
    setMoveIndex(moveIndex + 1);
    setFen(game.fen());

    if (moveIndex + 1 === moves.length) {
      if (variationIndex < opening.variations.length - 1) {
        console.log("Next variation");
        setVariationIndex(variationIndex + 1);
        setMoveIndex(0);
        const g = gameRef.current;
        while (g.history().length > 0) g.undo();
        setFen(g.fen());
      } else {
        console.log("All variations done");
        done();
      }
    }

    return true;
  }

  return (
    <div>
      <h2>Study Mode</h2>
      {moveIndex < moves.length && <p>Next move: {moves[moveIndex]}</p>}
      <Chessboard
        id="study-chessboard"
        position={fen}
        onPieceDrop={onPieceDrop} // <-- correct for v5
      />
      <p>
        Variation {variationIndex + 1} of {opening.variations.length}
      </p>
      <p>
        Move {moveIndex + 1} of {moves.length}
      </p>
    </div>
  );
}
