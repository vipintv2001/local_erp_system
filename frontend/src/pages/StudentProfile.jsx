import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft,
  EnvelopeSimple,
  Phone,
  CalendarBlank,
  MapPin,
  User,
  GraduationCap,
  Clock,
  ShieldWarning,
} from "@phosphor-icons/react";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/students/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data)
    return (
      <div className="p-8 text-center text-slate-500">Loading profile...</div>
    );

  const { student, payments } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors text-sm font-medium"
      >
        <ArrowLeft weight="bold" />
        Back to Students
      </button>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-700"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <img
              src={`http://127.0.0.1:5000/${student.imagePath}`}
              alt={student.name}
              className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
            />
            <div className="pb-2">
              <StatusBadge status={student.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1 & 2: Dynamic Extended Student Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {student.name}
                </h1>
                <p className="text-brand-600 font-medium">
                  {student.studentId} • {student.course}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">
                    Contact Information
                  </h3>
                  <div className="flex items-center gap-3">
                    <Phone className="text-slate-400" size={18} />{" "}
                    {student.phone}
                  </div>
                  <div className="flex items-center gap-3">
                    <EnvelopeSimple className="text-slate-400" size={18} />{" "}
                    {student.email}
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="text-slate-400 mt-0.5 shrink-0"
                      size={18}
                    />
                    <span className="break-words">{student.address}</span>
                  </div>
                </div>

                {/* Academic & Personal Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">
                    Academic & Personal
                  </h3>
                  <div className="flex items-center gap-3">
                    <CalendarBlank className="text-slate-400" size={18} /> DOB:{" "}
                    {student.dob
                      ? new Date(student.dob).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-slate-400" size={18} />{" "}
                    Qualification: {student.highestQualification}
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-slate-400" size={18} /> Duration:{" "}
                    {student.courseDuration}
                  </div>
                </div>
              </div>

              {/* Family & Emergency Details */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <User className="text-slate-400" size={18} />
                  <div>
                    <span className="text-slate-400">Parent Name:</span>{" "}
                    <span className="font-medium text-slate-800">
                      {student.parentName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldWarning className="text-slate-400" size={18} />
                  <div>
                    <span className="text-slate-400">Emergency Contact:</span>{" "}
                    <span className="font-medium text-slate-800">
                      {student.emergencyContact}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Fee Status Box */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center h-fit my-auto">
              <div className="space-y-4 text-center">
                <div className="border-b border-slate-200/60 pb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Course Fee
                  </p>
                  <p className="text-2xl font-black text-slate-800">
                    ₹{student.totalFee}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">
                      Paid
                    </p>
                    <p className="text-base font-bold text-emerald-600">
                      ₹{student.paidAmount}
                    </p>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-2">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">
                      Pending
                    </p>
                    <p className="text-base font-bold text-amber-600">
                      ₹{student.pendingAmount}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <CalendarBlank size={14} /> Admitted:{" "}
                    {new Date(student.admissionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Receipt ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(payment.datePaid).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {payment.receiptId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 text-right">
                    ₹{payment.amountPaid}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-slate-500 text-sm"
                  >
                    No payments recorded yet.
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
