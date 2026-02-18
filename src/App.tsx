// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './types/auth.types';

// Front Office Pages
import LandingPage from './pages/frontoffice/LandingPage';
import LoginPage from './pages/frontoffice/LoginPage';
import RegisterPage from './pages/frontoffice/RegisterPage';
import PricingPage from './pages/frontoffice/PricingPage';
import ClientPortal from './pages/frontoffice/ClientPortal';

// Back Office Pages
import Dashboard from './pages/backoffice/Dashboard';
import Clients from './pages/backoffice/Clients';
import Invoices from './pages/backoffice/Invoices';
import Expenses from './pages/backoffice/Expenses';
import Reports from './pages/backoffice/Reports';
import Team from './pages/backoffice/Team';
import Settings from './pages/backoffice/Settings';

// Layout
import BackOfficeLayout from './layouts/BackOfficeLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ─── Public Routes ───────────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* ─── Client Portal (CLIENT role only) ───────────────────── */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <ClientPortal />
              </ProtectedRoute>
            }
          />

          {/* ─── Back Office (all roles except CLIENT) ──────────────── */}
          <Route
            path="/app"
            element={
              <ProtectedRoute
                allowedRoles={[
                  Role.PLATFORM_ADMIN,
                  Role.BUSINESS_OWNER,
                  Role.BUSINESS_ADMIN,
                  Role.ACCOUNTANT,
                  Role.TEAM_MEMBER,
                ]}
              >
                <BackOfficeLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested routes inside BackOfficeLayout */}
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ─── Catch-all redirect ──────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;