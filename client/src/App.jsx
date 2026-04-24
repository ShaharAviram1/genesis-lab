import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LabData from './pages/LabData';
import LabSimulation from './pages/LabSimulation';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from '../components/ToastContainer';
import './App.css'

function App() {

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<h1>Genesis Lab Home</h1>} />
          <Route path="/lab-data" element={<LabData />} />
          <Route path="/lab-simulation" element={<LabSimulation />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App
