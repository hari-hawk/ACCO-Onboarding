import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/fonts.css';
import './styles/acco-tokens.css';
import './styles/base.css';
import './styles/app.css';
import { App } from './App';
import { BUILD, PREVIEW } from './lib/preview';
import { useApp } from './store/app';

/* Design-reference hooks (see DESIGN-REFERENCE.md): version stamp on <html>, a global for
   tooling, and credential-free sign-in via ?as=<role>. */
document.documentElement.dataset.appCommit = BUILD.commit;
document.documentElement.dataset.appBuiltAt = BUILD.builtAt;
if (PREVIEW.state) document.documentElement.dataset.previewState = PREVIEW.state;
window.__ACCO_DESIGN__ = { ...BUILD, preview: PREVIEW, reference: 'design-reference.json' };
if (PREVIEW.as && useApp.getState().account !== PREVIEW.as) useApp.getState().signIn(PREVIEW.as);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Hash routing so the static build works from any path, including hosted previews. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
