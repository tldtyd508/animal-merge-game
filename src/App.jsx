import { useState } from 'react'
import MergeGame from './game/MergeGame'
import StartScreen from './ui/StartScreen'

export default function App() {
  const [playerName, setPlayerName] = useState(null)

  if (!playerName) {
    return <StartScreen onStart={setPlayerName} />
  }

  return <MergeGame playerName={playerName} />
}
