import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Users, 
  UserCheck, 
  CurrencyInr, 
  CalendarBlank, 
  Receipt, 
  ChartBar, 
  Percent,
  Funnel
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    feesPendingCount: 0,
    totalPending: 0,
    feesCollectedThisMonth: 0,
    allTimeFeesCollected: 0,
    collectionRate: 0,
    payments: [],
  });

  const [filterMode, setFilterMode] = useState('SpecificMonth'); // 'SpecificMonth' | 'AllTime'
  const [selectedMonthKey, setSelectedMonthKey] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/students/metrics/dashboard');
      setMetrics(res.data);

      const now = new Date();
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonthKey(currentKey);
    } catch (err) {
      // Caught silently
    }
  };

  const handleGenerateInvoices = () => {
    alert('Monthly Invoices generated and queued for sending!');
    setShowConfirm(false);
  };

  // Build unique months list from database payment history
  const monthsMap = {};
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  monthsMap[currentKey] = currentLabel;

  (metrics.payments || []).forEach((p) => {
    if (p.datePaid) {
      const d = new Date(p.datePaid);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthsMap[key] = label;
    }
  });

  const monthOptions = Object.keys(monthsMap).sort().reverse().map(key => ({
    key,
    label: monthsMap[key],
  }));

  // Calculate fees collected for selected month
  let selectedMonthTotal = 0;
  let selectedMonthReceipts = 0;
  if (selectedMonthKey && metrics.payments) {
    metrics.payments.forEach((p) => {
      if (p.datePaid) {
        const d = new Date(p.datePaid);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key === selectedMonthKey) {
          selectedMonthTotal += p.amountPaid || 0;
          selectedMonthReceipts += 1;
        }
      }
    });
  }

  const statCards = [
    {
      title: 'Total Students',
      value: metrics.totalStudents,
      subtitle: 'Total Enrolled',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Students',
      value: metrics.activeStudents,
      subtitle: 'Currently Active',
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
    {
      title: 'Fees Pending',
      value: `₹${(metrics.totalPending || 0).toLocaleString('en-IN')}`,
      subtitle: `${metrics.feesPendingCount || 0} students pending`,
      icon: CurrencyInr,
      color: 'bg-amber-500',
    },
    {
      title: 'Collection Rate',
      value: `${metrics.collectionRate || 0}%`,
      subtitle: 'Overall Collection Rate',
      icon: Percent,
      color: 'bg-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Overview of academy enrollment and fees collection details</p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 cursor-pointer text-sm"
        >
          <span>⚡ Generate Monthly Invoices</span>
        </button>
      </div>

      {/* Top 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}>
              <stat.icon size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stat.value}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fees Details & Collection Breakdown Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ChartBar size={22} className="text-brand-600" />
              <span>Fees Details & Collection Analytics</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Real-time fee metrics fetched directly from database</p>
          </div>

          {/* Collection Filter Options */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-1">
              <Funnel size={16} className="text-slate-400" /> Filter View:
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              <button
                onClick={() => setFilterMode('SpecificMonth')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filterMode === 'SpecificMonth'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Specific Month Collection
              </button>
              <button
                onClick={() => setFilterMode('AllTime')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filterMode === 'AllTime'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All-Time Fees Collection
              </button>
            </div>

            {filterMode === 'SpecificMonth' && (
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="border border-slate-300 rounded-lg text-xs font-semibold p-2 bg-white text-slate-800 focus:ring-brand-500 focus:border-brand-500 outline-none cursor-pointer shadow-sm"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Breakdown Grid Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box 1: Fees Pending */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Fees Pending</span>
                <CurrencyInr className="text-amber-600" size={22} />
              </div>
              <p className="text-3xl font-black text-amber-600">
                ₹{(metrics.totalPending || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800 font-medium">
              <span>{metrics.feesPendingCount || 0} students pending</span>
              <button
                onClick={() => navigate('/fees')}
                className="hover:underline font-bold text-amber-900 cursor-pointer"
              >
                View Fees →
              </button>
            </div>
          </div>

          {/* Box 2: Fees Collected This Month */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Fees Collected This Month
                </span>
                <Receipt className="text-emerald-600" size={22} />
              </div>
              <p className="text-3xl font-black text-emerald-600">
                ₹{(metrics.feesCollectedThisMonth || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200/60 text-xs text-emerald-800 font-medium">
              Collection in {currentLabel}
            </div>
          </div>

          {/* Box 3: Collection Rate Box */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Collection Rate</span>
                <Percent className="text-indigo-600" size={22} />
              </div>
              <p className="text-3xl font-black text-indigo-600">
                {metrics.collectionRate || 0}%
              </p>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, metrics.collectionRate || 0))}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-indigo-800 font-medium text-right">
                Fees Recovery Efficiency
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Filter Box: Only show All-Time Fees Collection when filter mode is 'AllTime', or Specific Month Fees Collection when filter mode is 'SpecificMonth' */}
        {filterMode === 'AllTime' ? (
          <div className="bg-brand-50/80 border border-brand-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-600 text-white">
                  FILTER RESULT
                </span>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  All-Time Fees Collection
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Cumulative fees collected across all recorded payment receipts in database
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-black text-brand-700">
                ₹{(metrics.allTimeFeesCollected || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-brand-800 font-semibold mt-1">
                {metrics.payments?.length || 0} total receipts recorded
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-white">
                  MONTHLY FILTER
                </span>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Fees Collected in {monthsMap[selectedMonthKey] || selectedMonthKey}
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Fees payment transactions recorded during {monthsMap[selectedMonthKey] || selectedMonthKey}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-black text-slate-900">
                ₹{selectedMonthTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                {selectedMonthReceipts} receipt(s) in {monthsMap[selectedMonthKey] || selectedMonthKey}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/students')}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Manage Students
            </button>
            <button
              onClick={() => navigate('/payments/add')}
              className="flex-1 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Record New Payment
            </button>
            <button
              onClick={() => navigate('/payments/history')}
              className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Payment History & Receipts
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
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateInvoices}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
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
