// 👇 Import this FIRST — before React or App
import './i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next'; // ✅ Add this line
import i18n from './i18n'; // ✅ Import your i18n instance
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}> {/* ✅ Wrap your app here */}
      <App />
    </I18nextProvider>
  </StrictMode>
);
