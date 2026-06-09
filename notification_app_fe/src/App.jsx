import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Notifications from './pages/Notifications';
import PriorityInbox from './pages/PriorityInbox';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <h2>Affordmed Notifications</h2>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>All Notifications</NavLink>
            <NavLink to="/priority" className={({ isActive }) => isActive ? 'active' : ''}>Priority Inbox</NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Notifications />} />
            <Route path="/priority" element={<PriorityInbox />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
