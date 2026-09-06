import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthGate } from './components/auth/AuthGate';
import { WorkspaceProvider } from './lib/workspaceContext';
import { inject } from '@vercel/analytics';

inject();

const FirebaseAuthGate = lazy(() =>
  import('./components/auth/FirebaseAuthGate').then((module) => ({ default: module.FirebaseAuthGate })),
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <FirebaseAuthGate>
        <AuthGate>
          {/* WorkspaceProvider resolves workspaceId + userId after auth */}
          <WorkspaceProvider>
            <App />
          </WorkspaceProvider>
        </AuthGate>
      </FirebaseAuthGate>
    </Suspense>
  </StrictMode>,
);