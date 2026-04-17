import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Activity, CloudRain, Users, Map } from 'lucide-react';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const claim = location.state?.claim;

  if (!claim) {
    return (
      <div className="text-center mt-20">
        <p>No result found.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary underline">Go Home</button>
      </div>
    );
  }

  const isApproved = claim.status === 'Approved';
  const isPending = claim.status === 'Pending';
  const isRejected = claim.status === 'Rejected';

  return (
    <div className="flex-1 flex justify-center items-center py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-slate-100 text-center">
        
        {isApproved && (
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>
        )}
        {isPending && (
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-4 rounded-full">
              <Activity className="w-16 h-16 text-yellow-500" />
            </div>
          </div>
        )}
        {isRejected && (
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
               <XCircle className="w-16 h-16 text-red-500" />
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {isApproved ? 'Claim Approved!' : isPending ? 'Manual Review Needed' : 'Claim Rejected'}
        </h2>
        
        {isApproved && (
          <p className="text-slate-600 mb-4">
            Your disruption report has been verified by the AI Engine. A parametric payout of <strong className="text-slate-900 text-lg">₹{claim.amount}</strong> has been credited to your wallet to cover the estimated time loss.
          </p>
        )}
        
        {isPending && (
          <p className="text-slate-600 mb-4">
            The AI determined a moderate Risk score. This claim will be manually reviewed by an administration agent.
          </p>
        )}

        {isRejected && (
          <p className="text-slate-600 mb-4">
            We could not approve your claim at this time. Reason: <br/>
            <span className="font-semibold text-slate-800 mt-2 block">{claim.reason}</span>
          </p>
        )}

        {/* AI Breakdown Area */}
        {claim.breakdown && (
           <div className="bg-slate-50 rounded-xl p-5 mb-6 text-left border border-slate-200">
             <div className="flex justify-between items-center mb-3">
               <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">AI Decision Engine</span>
               <span className="bg-primary/10 text-primary font-bold text-xs px-2 py-1 rounded">Score: {claim.riskScore}</span>
             </div>
             
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center text-slate-600 font-medium text-sm">
                   <Activity className="w-4 h-4 mr-2 text-indigo-500"/> Activity Sync
                 </div>
                 <span className="text-sm font-bold">{claim.breakdown.activityScore}</span>
               </div>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center text-slate-600 font-medium text-sm">
                   <CloudRain className="w-4 h-4 mr-2 text-blue-500"/> Environment Risk
                 </div>
                 <span className="text-sm font-bold">{claim.breakdown.environmentScore}</span>
               </div>

               <div className="flex items-center justify-between">
                 <div className="flex items-center text-slate-600 font-medium text-sm">
                   <Map className="w-4 h-4 mr-2 text-amber-500"/> Route Viability
                 </div>
                 <span className="text-sm font-bold">{claim.breakdown.routeScore}</span>
               </div>

               <div className="flex items-center justify-between">
                 <div className="flex items-center text-slate-600 font-medium text-sm">
                   <Users className="w-4 h-4 mr-2 text-purple-500"/> Crowd Presence
                 </div>
                 <span className="text-sm font-bold">{claim.breakdown.crowdScore}</span>
               </div>
             </div>
           </div>
        )}

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-lg transition-colors flex justify-center items-center"
        >
          Return to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
