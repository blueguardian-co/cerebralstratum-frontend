import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './components/AuthProvider/AuthProvider.tsx';
import { Dashboard } from './components/Dashboard/Dashboard.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  </React.StrictMode>
);
