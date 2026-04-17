import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import endpoints from '../config/api';
import { Shield, ShieldAlert, Zap, AlertTriangle, Clock, CheckCircle2, XCircle, Activity, LogOut, CloudRain, Wind, Car, Thermometer, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [premiumData, setPremiumData] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const navigate = useNavigate();

  const fetchLivePremium = async () => {
    setPremiumLoading(true);
    setLocationError(null);
    try {
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          (err) => reject(err)
        );
      });

      const res = await axios.post(endpoints.livePremium, { lat: coords.lat, lon: coords.lon });
      setPremiumData(res.data);
    } catch (err) {
      if (err.code === 1) {
        setLocationError("Location access denied. Please allow GPS access to see your live premium.");
      } else {
        setLocationError("Failed to fetch live environmental data. Please try again.");
      }
      console.error("Live premium error:", err);
    } finally {
      setPremiumLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, claimsRes] = await Promise.all([
          axios.get(endpoints.getUser(userId)),
          axios.get(endpoints.getUserClaims(userId))
        ]);
        
        const userData = userRes.data.user;
        setUser(userData);

        if (claimsRes.data.success) {
          setClaims(claimsRes.data.claims);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData().then(() => fetchLivePremium());
  }, [navigate]);

  const activatePolicy = async () => {
    try {
      const res = await axios.post(endpoints.activatePolicy, { userId: user._id });
      if (res.data.success) setUser(res.data.user);
    } catch (err) {
      alert('Failed to activate policy.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userCity');
    navigate('/login');
  };

  const getRiskBadgeColor = (level) => {
    if (level === 'High') return 'bg-red-100 text-red-700 border-red-200';
    if (level === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  if (loading) return (
    <div className="text-center mt-20 text-slate-500 font-medium flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      Loading your secure dashboard...
    </div>
  );
  if (!user) return null;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-2xl font-bold shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm font-medium">
              <span className="capitalize">{user.city} Zone</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>₹{user.weeklyIncome}/wk avg</span>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-end sm:items-center gap-4">
          {user.policyActive ? (
            <div className="inline-flex items-center text-green-700 font-bold bg-green-50 px-4 py-2 rounded-xl border border-green-200 shadow-sm">
              <Shield className="w-5 h-5 mr-2" /> Policy Active
            </div>
          ) : (
            <div className="inline-flex items-center text-red-700 font-bold bg-red-50 px-4 py-2 rounded-xl border border-red-200 shadow-sm">
              <ShieldAlert className="w-5 h-5 mr-2" /> Coverage Suspended
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 font-semibold"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">

          {/* Live Premium Card */}
          <div className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-1 relative z-10">
              <div>
                <h3 className="text-lg font-bold">Dynamic Premium Calculation</h3>
                <span className="text-slate-400 text-xs tracking-wider uppercase">Real-time APIs</span>
              </div>
              <button 
                onClick={fetchLivePremium}
                disabled={premiumLoading}
                title="Refresh live data"
                className="text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-slate-700/50"
              >
                <RefreshCw className={`w-4 h-4 ${premiumLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Location Error State */}
            {locationError && !premiumLoading && (
              <div className="mt-4 bg-red-900/30 border border-red-700/50 text-red-300 text-xs p-3 rounded-xl">
                {locationError}
              </div>
            )}

            {/* Loading state */}
            {premiumLoading && (
              <div className="mt-6 flex flex-col items-center gap-3 py-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-400 text-sm">Fetching live environmental data...</span>
              </div>
            )}

            {/* Data loaded */}
            {!premiumLoading && premiumData && (
              <>
                <div className={`mt-4 px-3 py-1 font-bold text-xs uppercase rounded-lg border inline-flex items-center ${getRiskBadgeColor(premiumData.riskLevel)}`}>
                  {premiumData.riskLevel} Risk
                </div>

                {/* Real Environmental Metrics from API */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                    <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                      <CloudRain className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase text-slate-400">Rainfall</span>
                    </div>
                    <p className="text-lg font-black">{premiumData.env?.rainfall_mm ?? 0}<span className="text-slate-400 text-xs font-medium ml-1">mm</span></p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{premiumData.env?.rain_status || 'No Rain'}</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                    <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                      <Wind className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase text-slate-400">Air Quality</span>
                    </div>
                    <p className="text-lg font-black">{premiumData.env?.aqi ?? 0}<span className="text-slate-400 text-xs font-medium ml-1">AQI</span></p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{premiumData.env?.aqi_status || '—'}</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                    <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                      <Car className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase text-slate-400">Traffic</span>
                    </div>
                    <p className="text-lg font-black">{premiumData.env?.traffic_congestion ?? 0}<span className="text-slate-400 text-xs font-medium ml-1">%</span></p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{premiumData.env?.traffic_congestion > 60 ? 'Congested' : 'Flowing'}</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                    <div className="flex items-center gap-1.5 text-yellow-300 mb-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase text-slate-400">Temp</span>
                    </div>
                    <p className="text-lg font-black">{premiumData.env?.temperature ?? '—'}<span className="text-slate-400 text-xs font-medium ml-1">°C</span></p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{premiumData.env?.weather_condition || '—'}</p>
                  </div>
                </div>

                {/* Risk Score Bar */}
                <div className="mt-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 font-medium text-sm">Composite Risk Score</span>
                    <span className="font-bold font-mono text-white">{premiumData.riskScore}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${premiumData.riskLevel === 'High' ? 'bg-red-500' : premiumData.riskLevel === 'Medium' ? 'bg-yellow-400' : 'bg-primary'}`}
                      style={{ width: `${premiumData.riskScore * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Premium Display */}
                <div className="flex flex-col items-center mt-5 mb-4">
                  <div className="flex items-start">
                    <span className="text-xl font-bold mt-1 mr-1">₹</span>
                    <span className="text-5xl font-black">{premiumData.premium}</span>
                    <span className="text-slate-400 self-end mb-1 ml-1 font-medium">/wk</span>
                  </div>
                  <p className="text-xs text-primary mt-2 font-medium bg-primary/10 px-3 py-1 rounded-full">{premiumData.note}</p>
                </div>

                {!user.policyActive ? (
                  <button 
                    onClick={activatePolicy}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.23)] hover:-translate-y-[1px] relative z-10 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" /> Activate Coverage
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/claim')}
                    className="w-full bg-white text-slate-900 border-2 border-white hover:bg-transparent hover:text-white font-bold py-3.5 px-6 rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" /> Report Disruption
                  </button>
                )}
              </>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Coverage Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-slate-600 font-medium">Coverage Plan</span>
                <span className="text-slate-900 font-bold">{premiumData?.coverage || 'Standard'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-slate-600 font-medium">Max Payout/Hr</span>
                <span className="text-slate-900 font-bold">₹120</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Verification Engine</span>
                <div className="flex items-center text-primary font-bold text-sm">
                  <Activity className="w-4 h-4 mr-1" /> LIVE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Claims History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Clock className="w-5 h-5 text-slate-400 mr-2" />
                Recent Claims & Payouts
              </h3>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-md">{claims.length} Ledger</span>
            </div>
            
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {claims.length === 0 ? (
                <div className="p-12 h-full flex items-center justify-center text-center text-slate-500 font-medium">
                  No claims filed yet. Your parametric ledger is currently empty.
                </div>
              ) : (
                claims.map(claim => (
                  <div key={claim._id} className="p-6 hover:bg-slate-50/80 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {claim.disruptionType}
                          </span>
                          <span className="inline-flex items-center bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {claim.duration} {claim.duration === 1 ? 'HR' : 'HRS'}
                          </span>
                        </div>
                        <p className="text-slate-900 font-bold">{new Date(claim.createdAt).toLocaleDateString()} at {new Date(claim.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="text-right">
                        {claim.status === 'Approved' ? (
                          <div className="flex flex-col items-end">
                            <span className="flex items-center text-green-600 font-bold text-sm mb-1"><CheckCircle2 className="w-4 h-4 mr-1"/> Approved</span>
                            <span className="text-xl font-black text-slate-900">+₹{claim.amount}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="flex items-center text-red-600 font-bold text-sm mb-1"><XCircle className="w-4 h-4 mr-1"/> Rejected</span>
                            <span className="text-slate-500 font-medium line-through decoration-slate-300">₹{120 * (claim.duration || 1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {claim.status === 'Rejected' && claim.reason && (
                      <p className="text-sm border-l-2 border-red-300 pl-3 mt-4 text-slate-600 bg-red-50/40 py-2.5 rounded-r-lg">
                        <strong className="text-red-800">API Rejection:</strong> {claim.reason}
                      </p>
                    )}
                    {claim.status === 'Approved' && (
                      <p className="text-sm border-l-2 border-green-300 pl-3 mt-4 text-slate-600 bg-green-50/40 py-2.5 rounded-r-lg">
                        Verified by Live API parameters. Instantly disbursed into wallet.
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
