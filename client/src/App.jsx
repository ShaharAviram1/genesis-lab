import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LabData from './pages/LabData';
import LabSimulation from './pages/LabSimulation';
import Auth from './pages/Auth';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from '../components/ToastContainer';
import './App.css'
import { useState } from 'react';


function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [authUsername, setAuthUsername] = useState(localStorage.getItem("username"));
  const handleAuthSuccess = ({ username, token }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    setAuthToken(token);
    setAuthUsername(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setAuthToken(null);
    setAuthUsername(null);
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<h1>Genesis Lab Home</h1>} />
          <Route path="/lab-data" element={<LabData />} />
          <Route
            path="/lab-simulation"
            element={
              authToken
                ? <LabSimulation username={authUsername} onLogout={handleLogout} />
                : <Auth onAuthSuccess={handleAuthSuccess} />
            }
          />
          <Route path="/auth" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App
