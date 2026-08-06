import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Make sure this matches your actual CSS file name if you have one

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
