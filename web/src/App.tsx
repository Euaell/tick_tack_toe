import React from 'react'
import '@/App.css'
import Game from '@/components/Game'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        <Route path="/:gameId" element={<Game />} />
        <Route path="/" element={<Game />} />
      </Routes>
    </Router>
  )
}

export default App
