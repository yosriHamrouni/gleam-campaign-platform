// src/App.jsx
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Dashboard from './pages/Dashboard';
import Competitions from './pages/Competitions';
import CreateCompetition from './pages/CreateCompetition';
import ManageCompetition from './pages/ManageCompetition';
import CampaignPage from './pages/CampaignPage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Creator area */}
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="competitions/new" element={<CreateCompetition />} />
          <Route path="competitions/:id" element={<ManageCompetition />} />
        </Route>

        {/* Public pages */}
        <Route path="c/:id" element={<CampaignPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
