import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function TestBoard() {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());

  function onPieceDrop(pieceDropArgs) {
    console.log("Drop:", pieceDropArgs.sourceSquare, "→", pieceDropArgs.targetSquare);

    // only from, to, and optional promotion
    try {
      const move = game.move({ from: pieceDropArgs.sourceSquare, to: pieceDropArgs.targetSquare, promotion: "q" });
      console.log("Move accepted:", move.san);
      setFen(game.fen());    
      return true;
    } catch {
      return false
    }
  }

  return <Chessboard options={{ position: fen, onPieceDrop }} />;
}
