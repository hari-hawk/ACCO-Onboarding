import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/fonts.css';
import './styles/acco-tokens.css';
import './styles/base.css';
import './styles/app.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Hash routing so the static build works from any path, including hosted previews. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
