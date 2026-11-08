// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Competitions from './pages/Competitions'
import CompetitionEntry from './pages/CompetitionEntry'
import QuickDraws from './pages/QuickDraws'
import Rewards from './pages/Rewards'
import Captures from './pages/Captures'
import Galleries from './pages/Galleries'
import Settings from './pages/Settings'
import ActiveCompetitions from './pages/ActiveCompetitions'
import CreateCompetition from './pages/CreateCompetition'
import Login from './pages/Login'
import Register from './pages/Register'
import RequireAuth from './components/RequireAuth'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="competitions/:id" element={<CompetitionEntry />} />
          <Route path="competitions/active" element={<ActiveCompetitions />} />
          <Route path="quick-draws" element={<QuickDraws />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="captures" element={<Captures />} />
          <Route path="galleries" element={<Galleries />} />
          <Route path="settings" element={<Settings />} />
          <Route path="competitions/create" element={<RequireAuth><CreateCompetition /></RequireAuth>} />
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
