import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LabData from './pages/LabData';
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Genesis Lab Home</h1>} />
        <Route path="/lab-data" element={<LabData />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
