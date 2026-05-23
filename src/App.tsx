import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import RoomRates from './pages/RoomRates';
import JurysCafe from './pages/JurysCafe';
import Contact from './pages/Contact';
import FunctionPackages from './pages/FunctionPackages';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import BookingHistory from './pages/BookingHistory';
import Inventory from './pages/Inventory';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with Layout (header/footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/room-rates" element={<RoomRates />} />
          <Route path="/jurys-cafe" element={<JurysCafe />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/function-packages" element={<FunctionPackages />} />
          <Route path="/booking" element={<Booking />} />
        </Route>

        {/* Admin routes without Layout (standalone pages) */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </Router>
  );
}

export default App;
