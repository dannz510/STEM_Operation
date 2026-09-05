import { lazy, StrictMode, Suspense } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthGate } from './components/auth/AuthGate';

const FirebaseAuthGate = lazy(() => import('./components/auth/FirebaseAuthGate').then((module) => ({ default: module.FirebaseAuthGate })));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <FirebaseAuthGate>
        <AuthGate>
          <App />
        </AuthGate>
      </FirebaseAuthGate>
    </Suspense>
  </StrictMode>,
);
