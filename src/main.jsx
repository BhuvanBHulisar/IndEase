import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import TermsPage from './pages/TermsPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'

// Industrial identity network root

import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';

const GOOGLE_CLIENT_ID = "911800685111-9o8jte5pa16gbpj8h36pv3gp3dcjh3ri.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/dashboard" element={<App />} />
            <Route path="/expert-dashboard" element={<App />} />
            <Route path="/consumer/login" element={<App />} />
            <Route path="/consumer/signup" element={<App />} />
            <Route path="/provider/login" element={<App />} />
            <Route path="/provider/signup" element={<App />} />
            <Route path="/expert/:id" element={<App />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
