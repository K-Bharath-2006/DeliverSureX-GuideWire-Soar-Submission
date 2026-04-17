import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import endpoints from '../config/api';
import { UserPlus, ShieldPlus } from 'lucide-react';

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    city: '',
    weeklyIncome: 2000
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already registered, go to dashboard
    const userId = localStorage.getItem('userId');
    if (userId) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(endpoints.register, formData);
      if (res.data.success) {
        localStorage.setItem('userId', res.data.user._id);
        localStorage.setItem('userCity', res.data.user.city);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed. Make sure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <ShieldPlus className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-sm mt-2 text-center">Join DeliverSure AI for dynamic safety and claim coverage.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
            <input 
              required
              type="tel" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="+91 9999999999"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">City / Zone</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. Mumbai, Delhi, indore"
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Average Weekly Income (₹)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="2000"
              value={formData.weeklyIncome}
              onChange={e => setFormData({...formData, weeklyIncome: Number(e.target.value)})}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-4 flex justify-center items-center"
          >
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-dark hover:underline transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
