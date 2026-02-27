import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import Refrigerator from './pages/Refrigerator';
import ShoppingList from './pages/ShoppingList';
import NutritionGuide from './pages/NutritionGuide';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/refrigerator" element={<Refrigerator />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/guide" element={<NutritionGuide />} />
      </Routes>
    </Router>
  );
}

export default App;
