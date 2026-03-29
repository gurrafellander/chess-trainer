import { useState } from "react"
import StudyMode from "./StudyMode"
import RecallMode from "./RecallMode"
import PracticeMode from "./PracticeMode"

export default function Trainer({ opening, mode: initialMode, setOpening }) {
  const [mode, setMode] = useState(initialMode)

  const exit = () => setOpening(null)

  if (mode === "study") {
    return (
      <StudyMode
        opening={opening}
        setOpening={exit}
        done={() => setMode("recall")}
      />
    )
  }

  if (mode === "recall") {
    return (
      <RecallMode
        opening={opening}
        onExit={exit}
        onRestart={() => setMode("recall")}
      />
    )
  }

  if (mode === "practice") {
    return (
      <PracticeMode
        opening={opening}
        onExit={exit}
      />
    )
  }

  return null
}
