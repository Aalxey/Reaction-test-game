import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signin from './pages/Signin'
import Dashboard from './pages/Dashboard'
import ReactionGame from './pages/ReactionGame'
import MainLayout from './layouts/MainLayout'
import './App.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />

        {/* Protected Dashboard Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Reaction Game (No layout for full screen immersion usually, but keeping layout for now or separate?) 
              Actually, usually reaction tests are full screen. Let's put it OUTSIDE MainLayout if we want full screen, 
              or INSIDE if we want sidebar. The user wants "click when green", implies full screen color change.
              My implementation of ReactionGame has `min-h-screen` and its own back button. 
              So it should be outside MainLayout or MainLayout needs to handle full screen override.
              Let's put it outside MainLayout for true full-screen experience. 
          */}
        </Route>

        <Route path="/reaction-game" element={<ReactionGame />} />
      </Routes>
    </Router>
  );
};

export default App;
