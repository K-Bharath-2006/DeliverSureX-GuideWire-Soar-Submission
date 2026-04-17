import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import endpoints from '../config/api';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go to dashboard
    const userId = localStorage.getItem('userId');
    if (userId) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(endpoints.login, { phone, password });
      if (res.data.success) {
        localStorage.setItem('userId', res.data.user._id);
        localStorage.setItem('userCity', res.data.user.city);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Worker Login</h2>
          <p className="text-slate-500 text-sm mt-2 text-center">Welcome back to DeliverSure AI.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
            <input 
              required
              type="tel" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="+91 9999999999"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-4 flex justify-center items-center"
          >
            {loading ? 'Logging in...' : 'Login securely'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/" className="text-primary font-semibold hover:text-primary-dark hover:underline transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
