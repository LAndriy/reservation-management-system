import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReservationsProvider } from './context/ReservationContext';
import './config/axios'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider 
      clientId="535244753397-klj1cavj6snt1bt1u8ef09unv4vke8q7.apps.googleusercontent.com"
    >
      <BrowserRouter>
        <AuthProvider>
          <ReservationsProvider>
            <App />
          </ReservationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
