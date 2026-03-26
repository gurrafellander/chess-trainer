import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useRef, useEffect } from "react";

export default function StudyMode({ opening, setOpening, done }) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());

  const [variationIndex, setVariationIndex] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [justMoved, setJustMoved] = useState(false);

  const moves = opening.variations[variationIndex];
  const openingColor = opening.name.includes("Defense") ? "black" : "white";

  // Sync board to current progress
  useEffect(() => {
    console.log("Syncing board → variation:", variationIndex, "move:", moveIndex);

    const game = gameRef.current;

    if (openingColor === 'black') setJustMoved(true);

    // reset game
    while (game.history().length > 0) game.undo();

    // replay moves
    for (let i = 0; i < moveIndex; i++) {
      game.move(moves[i]);
    }

    setFen(game.fen());
  }, [variationIndex, moveIndex, opening.name, moves]);

 // Automatisk drag för motståndarens tur
  useEffect(() => {
    const game = gameRef.current;
    if (moveIndex >= moves.length) return;
    if (!justMoved) return;

    const isWhiteToMove = game.turn() === "w";
    const isOpeningWhite = openingColor === "white";

    // Om det är motståndarens tur
    if ((isWhiteToMove && !isOpeningWhite) || (!isWhiteToMove && isOpeningWhite)) {
      const autoMove = moves[moveIndex];
      const move = game.move(autoMove, { sloppy: true });
      if (move) {
        setFen(game.fen());
        setMoveIndex((prev) => prev + 1);
      }
      setJustMoved(false)
    }
  }, [moveIndex]);

  function onPieceDrop(args) {
    const { sourceSquare, targetSquare } = args;

    console.log("Drop:", sourceSquare, "→", targetSquare);

    const game = gameRef.current;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) {
        console.log("Illegal move");
        setFen(game.fen());
        return false;
      }

      const expectedMove = moves[moveIndex];

      if (move.san !== expectedMove) {
        console.log("Wrong move:", move.san, "expected:", expectedMove);
        game.undo();
        setFen(game.fen());
        return false;
      }

      console.log("Correct move:", move.san);

      setMoveIndex(moveIndex + 1);
      setFen(game.fen());
      setJustMoved(true)

      // next variation
      if (moveIndex + 1 === moves.length) {
        if (variationIndex < opening.variations.length - 1) {
          console.log("Next variation");

          setVariationIndex(variationIndex + 1);
          setMoveIndex(0);

          while (game.history().length > 0) game.undo();
          setFen(game.fen());
        } else {
          console.log("All done → recall mode");
          done();
        }
      }

      return true;
    } catch (e) {
      console.error("Move error:", e);
      return false;
    }
  }

  return (
    <div>
      <h2>Study Mode</h2>
      <p>{opening.name}</p>
      {moveIndex < moves.length && (
        <p>Next move: {moves[moveIndex]}</p>
      )}

      <Chessboard
        options={{
          position: fen,
          boardOrientation: openingColor,
          onPieceDrop,
        }}
      />

      <p>Variation {variationIndex + 1} / {opening.variations.length}</p>
      <p>Move {moveIndex + 1} / {moves.length}</p>
      <button type="" onClick={()=>{setOpening(null)}}>Return to menu</button>
    </div>
  );
}
