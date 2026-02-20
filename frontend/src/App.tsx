import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestGenie from './pages/TestGenie';
import Upload from './pages/Upload';
import History from './pages/History';
import Templates from './pages/Templates';
import Subscription from './pages/Subscription';
import Docs from './pages/Docs';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestGenie />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/history" element={<History />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
    </Router>
  );
}

export default App;
