import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './styles/fonts.css';
import './styles/theme.css';
import { App } from './App';
import { registerServiceWorker } from './pwa';
import { installClickSounds } from './ui/sound';
import { installErrorCapture } from './report/context';
import { initReportSync } from './report/send';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

installErrorCapture();
registerServiceWorker();
installClickSounds();
initReportSync(); // bug reports saved offline go out now and when the device is back online
