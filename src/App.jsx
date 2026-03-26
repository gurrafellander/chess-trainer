import { openings } from "./openings"
import { useState } from "react"
import Trainer from "./Trainer"
import "./App.css"

export default function App(){

  const [opening,setOpening] = useState(null)

  if(opening){
    return <Trainer opening={opening} setOpening={setOpening}/>
  }

  return(
    <div>
      <h1>Chess Opening Trainer</h1>

      <div className="openings-grid">
        {openings.map(o => (
          <div
            key={o.name}
            className="opening-card"
            onClick={() => setOpening(o)}
          >
            <div className="card-content">
              <div>
                <h3>{o.name}</h3>
                <p>{o.variations.length} variationer</p>
              </div>

              <div className="arrow">
                →
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
