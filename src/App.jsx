import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import Refrigerator from './pages/Refrigerator';
import ShoppingList from './pages/ShoppingList';
import NutritionGuide from './pages/NutritionGuide';
import History from './pages/History';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/recipe" element={<PrivateRoute><Recipe /></PrivateRoute>} />
          <Route path="/refrigerator" element={<PrivateRoute><Refrigerator /></PrivateRoute>} />
          <Route path="/shopping-list" element={<PrivateRoute><ShoppingList /></PrivateRoute>} />
          <Route path="/guide" element={<PrivateRoute><NutritionGuide /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
