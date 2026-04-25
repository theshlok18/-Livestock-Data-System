import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import NewEntry from './components/NewEntry'
import SearchAnimal from './components/SearchAnimal'
import AnimalForm from './components/AnimalForm'
import HistoryViewer from './components/HistoryViewer'
import FeedingManagement from './components/FeedingManagement'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/"                element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/new-entry"       element={<PrivateRoute><NewEntry /></PrivateRoute>} />
        <Route path="/search"          element={<PrivateRoute><SearchAnimal /></PrivateRoute>} />
        <Route path="/form/:tagNo"     element={<PrivateRoute><AnimalForm /></PrivateRoute>} />
        <Route path="/history/:tagNo"  element={<PrivateRoute><HistoryViewer /></PrivateRoute>} />
        <Route path="/feeding"         element={<PrivateRoute><FeedingManagement /></PrivateRoute>} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
