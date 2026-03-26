import { useState } from "react"
import StudyMode from "./StudyMode"
import RecallMode from "./RecallMode"
import TestBoard from "./TestBoard.jsx"

export default function Trainer({opening, setOpening}){

  const [mode,setMode] = useState("study")

  if(mode === "study"){
    return <StudyMode opening={opening} setOpening={setOpening} done={()=>setMode("recall")} />
  }

  return <RecallMode opening={opening} setOpening={setOpening} onExit={()=>setOpening(null)}/>
}
