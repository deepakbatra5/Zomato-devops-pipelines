import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './components/Header';
import Chatbot from './components/Chatbot';

export default function App() {
  const [cart, setCart] = useState([]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="app">
      <Header cartCount={cartCount} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/r/:id" element={<Restaurant cart={cart} setCart={setCart} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}
