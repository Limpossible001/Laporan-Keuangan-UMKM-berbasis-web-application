import { RouterProvider } from 'react-router';
import { router } from './routes';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </FinanceProvider>
    </AuthProvider>
  );
}