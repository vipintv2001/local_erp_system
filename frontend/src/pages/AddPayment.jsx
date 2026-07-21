import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { MagnifyingGlass, CheckCircle } from '@phosphor-icons/react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AddPayment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [method, setMethod] = useState('Cash');
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.student) {
      setSelectedStudent(location.state.student);
      setSearchQuery(location.state.student.name);
    }
  }, [location.state]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0 && !selectedStudent) {
        setIsSearching(true);
        api.get(`/students/search?q=${searchQuery}`)
          .then(res => {
            setSearchResults(res.data);
            setIsSearching(false);
          })
          .catch(err => {
            setIsSearching(false);
          });
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedStudent]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery(student.name);
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return alert('Please select a student first.');
    
    try {
      await api.post('/payments', {
        student: selectedStudent._id,
        amountPaid,
        method
      });
      // Redirect to history/print page after successful payment
      navigate('/payments/history');
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Record New Payment</h1>
        <p className="text-slate-500 mt-1">Search for a student and log their fee payment.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="relative" ref={searchRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">Search Student</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlass className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedStudent(null);
                }}
                className="pl-10 block w-full sm:text-sm border-slate-300 rounded-lg p-3 outline-none border focus:ring-brand-500 focus:border-brand-500 transition-colors bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg max-h-60 overflow-auto">
                {searchResults.map(student => (
                  <div 
                    key={student._id}
                    onClick={() => handleSelectStudent(student)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0"
                  >
                    <img src={`http://127.0.0.1:5000/${student.imagePath}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.studentId} • {student.courses && student.courses.length > 0 ? student.courses.join(', ') : student.course}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-4">
              <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={24} weight="fill" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Student Selected</h4>
                <p className="text-sm text-emerald-700 mt-1">
                  Name: {selectedStudent.name} <br/>
                  Course: {selectedStudent.courses && selectedStudent.courses.length > 0 ? selectedStudent.courses.join(', ') : selectedStudent.course} <br/>
                  Pending Dues: ₹{selectedStudent.pendingAmount}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="block w-full sm:text-sm border-slate-300 rounded-lg p-3 outline-none border focus:ring-brand-500 focus:border-brand-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="block w-full sm:text-sm border-slate-300 rounded-lg p-3 outline-none border focus:ring-brand-500 focus:border-brand-500 bg-slate-50 focus:bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={!selectedStudent || !amountPaid}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Record Payment & Print Receipt
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
