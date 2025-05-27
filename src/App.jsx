// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';
import JobScheduling from './pages/JobScheduling';
import JobSchedulingSimulator from './pages/JobSchedulingSimulator';
import './styles/scrollbar.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/job-scheduling" element={<JobScheduling />} />
            <Route path="/jobSchedulingSimulator" element={<JobSchedulingSimulator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
