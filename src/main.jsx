import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import TermsPage from './pages/TermsPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import AuthSuccess from './pages/AuthSuccess.jsx'

// Industrial identity network root

import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
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
            <Route path="/auth-success" element={<AuthSuccess />} />
          </Routes>
        </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
