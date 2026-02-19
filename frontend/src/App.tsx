import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestGenie from './pages/TestGenie';
import Upload from './pages/Upload';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestGenie />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </Router>
  );
}

export default App;
