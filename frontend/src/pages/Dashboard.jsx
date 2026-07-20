import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, UserCheck, CurrencyInr, ChartLineUp } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    feesPending: 0,
    fullyPaid: 0,
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/students/metrics/dashboard');
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateInvoices = () => {
    // In a real app, this would trigger an email or SMS batch job.
    alert('Monthly Invoices generated and queued for sending!');
    setShowConfirm(false);
  };

  const statCards = [
    { title: 'Total Students', value: metrics.totalStudents, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Students', value: metrics.activeStudents, icon: UserCheck, color: 'bg-emerald-500' },
    { title: 'Fees Pending', value: metrics.feesPending, icon: CurrencyInr, color: 'bg-amber-500' },
    { title: 'Fully Paid Students', value: metrics.fullyPaid, icon: ChartLineUp, color: 'bg-brand-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <span>⚡ Generate Monthly Invoices</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0`}>
              <stat.icon size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/students')}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
            >
              Manage Students
            </button>
            <button
              onClick={() => navigate('/payments/add')}
              className="flex-1 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-medium transition-colors"
            >
              Record New Payment
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Invoice Generation</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Are you sure you want to generate monthly invoices for all active students? This action cannot be undone and will queue notifications.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateInvoices}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                Yes, Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
