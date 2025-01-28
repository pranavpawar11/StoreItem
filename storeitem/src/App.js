// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard';
import Login from './pages/Login';
import Inventory from './pages/InventoryManagement';
import Sales from './pages/SalesManagement';
import StockPrediction from './pages/StockPrediction';
import BrandAnalysis from './pages/BrandAnalysis';
import Reports from './pages/Reports';
import ExpiryAlerts from './pages/ExpiryNotifications';
import Profile from './pages/Profile';
import Membership from './pages/Membership'
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/membership" element={<Membership />} />
        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/predictions" element={<StockPrediction />} />
          <Route path="/brand-analysis" element={<BrandAnalysis />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/expiry-alerts" element={<ExpiryAlerts />} />
          <Route path="/profile" element={<Profile />} />
          
          
        </Route>

        {/* Redirect root to dashboard */}
        {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
      </Routes>
    </BrowserRouter>

  );
};

export default App;