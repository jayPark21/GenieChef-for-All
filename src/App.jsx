import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import Refrigerator from './pages/Refrigerator';
import ShoppingList from './pages/ShoppingList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/refrigerator" element={<Refrigerator />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
      </Routes>
    </Router>
  );
}

export default App;
