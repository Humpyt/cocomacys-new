import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Women } from './pages/Women';
import { Men } from './pages/Men';
import { ProductPage } from './pages/ProductPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/women" element={<Women />} />
          <Route path="/men" element={<Men />} />
          <Route path="/product" element={<ProductPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
