import { openings } from "./openings"
import { useState } from "react"
import Trainer from "./Trainer"

export default function App(){

  const [opening,setOpening] = useState(null)

  if(opening){
    return <Trainer opening={opening} setOpening={setOpening}/>
  }

  return(
    <div>
      <h1>Chess Opening Trainer</h1>

      {openings.map(o => (
        <button key={o.name} onClick={()=>setOpening(o)}>
          {o.name}
        </button>
      ))}

    </div>
  )
}
