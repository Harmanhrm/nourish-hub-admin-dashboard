import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import UserManagement from './components/UserManagement';
import ProductManagement from './components/ProductManagement';
import ReviewManagement from './components/ReviewManagement';
import Header from './components/Header';
import Statistics from './components/Statistics';
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<UserManagement />} /> 
        <Route path="/users" element={<UserManagement />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/reviews" element={<ReviewManagement />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </Router>
  );
}

export default App;
