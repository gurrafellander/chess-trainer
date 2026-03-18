import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useState } from "react"

export default function RecallMode({opening}){

  const [variation, setVariation] = useState(0)
  const [moveIndex, setMoveIndex] = useState(0)
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())

  const moves = opening.variations[variation]

  function onDrop(source, target){
    const move = game.move({
      from: source,
      to: target,
      promotion: "q"
    })

    if(!move) return false

    if(move.san !== moves[moveIndex]){
      alert("Wrong move")
      game.undo()
      setFen(game.fen()) // uppdatera fen efter undo
      return false
    }

    setMoveIndex(moveIndex + 1)
    setFen(game.fen()) // uppdatera fen efter giltigt drag

    if(moveIndex + 1 === moves.length){
      if(variation < opening.variations.length - 1){
        setVariation(variation + 1)
        setMoveIndex(0)
        const newGame = new Chess()
        setGame(newGame)
        setFen(newGame.fen())
      } else {
        alert("All variations complete!")
      }
    }

    return true
  }

  return(
    <div>
      <h2>Recall Mode</h2>
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
      />
      <p>Variation {variation + 1} of {opening.variations.length}</p>
      <p>Move {moveIndex + 1} of {moves.length}</p>
    </div>
  )
}
