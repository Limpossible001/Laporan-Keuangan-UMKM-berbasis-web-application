import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Reports } from './views/Reports';
import { Settings } from './pages/Settings';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { InputPembelian } from './pages/InputPembelian';
import { InputPenjualan } from './pages/InputPenjualan';
import { InputKas } from './pages/InputKas';
import { InputInventory } from './pages/InputInventory';
import { Panduan } from './pages/Panduan';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/register',
    Component: RegisterPage,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
    ],
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Reports },
    ],
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Settings },
    ],
  },
  {
    path: '/input-pembelian',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: InputPembelian },
    ],
  },
  {
    path: '/input-penjualan',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: InputPenjualan },
    ],
  },
  {
    path: '/input-kas',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: InputKas },
    ],
  },
  {
    path: '/input-inventory',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: InputInventory },
    ],
  },
  {
    path: '/panduan',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Panduan },
    ],
  },
]);