import { useState, useEffect } from 'react';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function TotalFees() {
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Active");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      // Sort by pending amount descending
      const sorted = res.data.sort((a, b) => b.pendingAmount - a.pendingAmount);
      setStudents(sorted);
    } catch (err) {
      // Ignored
    }
  };

  const filteredStudents = students.filter((s) => {
    if (statusFilter === "Active") {
      return s.status && s.status.startsWith("Active");
    }
    if (statusFilter === "Passout") {
      return s.status === "Passout";
    }
    if (statusFilter === "Payment Pending") {
      return s.status === "Active - Payment Pending" || (s.status && s.status.startsWith("Active") && s.pendingAmount > 0);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Total Fee Payments</h1>
        <p className="text-slate-500 mt-1">Track outstanding balances across all students.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-160px)] flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm font-semibold text-slate-700">Filter By Status</div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "Active", label: "Active" },
              { id: "Passout", label: "Passout" },
              { id: "Payment Pending", label: "Payment Pending" },
              { id: "All", label: "All Students" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fee</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={`http://127.0.0.1:5000/${student.imagePath}`} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right font-medium">₹{student.totalFee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 text-right font-medium">₹{student.paidAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 text-right font-bold">₹{student.pendingAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button 
                      onClick={() => navigate(`/students/${student._id}`)}
                      className="text-brand-600 hover:text-brand-800 hover:underline"
                    >
                      View History
                    </button>
                    {student.pendingAmount > 0 && (
                      <button 
                        onClick={() => navigate('/payments/add', { state: { student } })}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No students found matching this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
