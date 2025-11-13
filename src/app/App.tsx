import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@pages/LandingPage/LandingPage.tsx';
import { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export const App = () => (
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: { background: 'var(--wink-border)', color: '#fff' },
        success: {
          icon: <FontAwesomeIcon icon={faCheckCircle} color="#10b981" />,
        },
        error: {
          icon: <FontAwesomeIcon icon={faExclamationCircle} color="#ef4444" />,
        },
      }}
    />
  </>
);
