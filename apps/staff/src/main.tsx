import { StrictMode, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useAuth } from './store/auth';
import './styles.css';

function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return <RouterProvider router={router} />;
}

const container = document.getElementById('root');
if (!container) throw new Error('Staff root container is missing.');
// Vite may evaluate this entry again during HMR; keep one root per document.
const previousRoot: ReactDOM.Root | undefined = import.meta.hot?.data.staffRoot;
const root = previousRoot ?? ReactDOM.createRoot(container);
if (import.meta.hot) import.meta.hot.data.staffRoot = root;
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
