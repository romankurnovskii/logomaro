/**
 * @file main.tsx
 * @description Application entry point — mounts the React root with StrictMode.
 *
 * @features
 * - Renders App component inside StrictMode
 * - Imports global CSS
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
