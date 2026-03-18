import { useState } from "react"
import StudyMode from "./StudyMode"
import RecallMode from "./RecallMode"
import TestBoard from "./TestBoard.jsx"

export default function Trainer({opening}){

  const [mode,setMode] = useState("study")

  if(mode === "study"){
    return <TestBoard />
    // return <StudyMode opening={opening} done={()=>setMode("recall")} />
  }

  return <RecallMode opening={opening}/>
}
