import '@aurum/react/aurum.css';
import './docs.css';

import { autoSquircle } from '@aurum/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

// Continuous corners for plain .aurum-squircle markup in Safari and Firefox.
autoSquircle();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
