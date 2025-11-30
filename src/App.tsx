import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import RoomRates from './pages/RoomRates';
import JurysCafe from './pages/JurysCafe';
import Contact from './pages/Contact';
import FunctionPackages from './pages/FunctionPackages';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/room-rates" element={<RoomRates />} />
          <Route path="/jurys-cafe" element={<JurysCafe />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/function-packages" element={<FunctionPackages />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
