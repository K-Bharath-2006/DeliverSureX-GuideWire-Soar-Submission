import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClaimPage from './pages/ClaimPage';
import ResultPage from './pages/ResultPage';
import RoutingPage from './pages/RoutingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-center">DeliverSure AI</h1>
        </header>
        
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col pt-8">
          <Routes>
            <Route path="/" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/claim" element={<ClaimPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/routing" element={<RoutingPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
