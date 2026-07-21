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
  Pencil,
  Trash,
} from "@phosphor-icons/react";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    parentName: "",
    emergencyContact: "",
    address: "",
    highestQualification: "",
    courses: [],
    courseDuration: "",
    totalFee: "",
    status: "Active",
    image: null,
  });

  useEffect(() => {
    fetchProfile();
    fetchCourses();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/students/${id}`);
      setData(res.data);
    } catch (err) {
      // Ignored
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCoursesList(res.data);
    } catch (err) {
      // Ignored
    }
  };

  const handleOpenEditModal = () => {
    if (!data?.student) return;
    const s = data.student;
    const formattedDob = s.dob ? new Date(s.dob).toISOString().split('T')[0] : '';
    setEditFormData({
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      dob: formattedDob,
      parentName: s.parentName || "",
      emergencyContact: s.emergencyContact || "",
      address: s.address || "",
      highestQualification: s.highestQualification || "",
      courses: s.courses || (s.course ? [s.course] : []),
      courseDuration: s.courseDuration || "",
      totalFee: s.totalFee || "",
      status: (s.status && s.status.startsWith("Active")) ? "Active" : (s.status || "Active"),
      image: null,
    });
    setShowEditModal(true);
  };

  const handleAddCourse = (courseName) => {
    if (!courseName) return;
    setEditFormData((prev) => {
      const currentCourses = prev.courses || [];
      if (currentCourses.includes(courseName)) return prev;
      const newCourses = [...currentCourses, courseName];
      const durations = newCourses.map(name => {
        const c = coursesList.find(item => item.courseName === name);
        return c ? c.duration : "";
      }).filter(Boolean);
      return {
        ...prev,
        courses: newCourses,
        courseDuration: durations.join(", ") || prev.courseDuration
      };
    });
  };

  const handleRemoveCourse = (courseName) => {
    setEditFormData((prev) => {
      const currentCourses = prev.courses || [];
      const newCourses = currentCourses.filter(c => c !== courseName);
      const durations = newCourses.map(name => {
        const c = coursesList.find(item => item.courseName === name);
        return c ? c.duration : "";
      }).filter(Boolean);
      return {
        ...prev,
        courses: newCourses,
        courseDuration: durations.join(", ")
      };
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.courses || editFormData.courses.length === 0) {
      alert("Please select at least one course.");
      return;
    }
    const formData = new FormData();
    Object.keys(editFormData).forEach((key) => {
      if (key === "image") {
        if (editFormData.image) formData.append("image", editFormData.image);
      } else if (key === "courses") {
        formData.append("courses", JSON.stringify(editFormData.courses));
      } else {
        formData.append(key, editFormData[key]);
      }
    });

    try {
      await api.put(`/students/${id}`, formData);
      setShowEditModal(false);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update student");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this student? This will also delete their payment history.")) {
      try {
        await api.delete(`/students/${id}`);
        navigate("/students");
      } catch (err) {
        // Ignored
      }
    }
  };

  if (!data)
    return (
      <div className="p-8 text-center text-slate-500">Loading profile...</div>
    );

  const { student, payments } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft weight="bold" />
          Back to Students
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleOpenEditModal}
            className="px-3.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-semibold flex items-center gap-1.5 border border-amber-200 shadow-sm transition-colors cursor-pointer"
          >
            <Pencil size={18} /> Edit Details
          </button>
          <button
            onClick={handleDelete}
            className="px-3.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-semibold flex items-center gap-1.5 border border-red-200 shadow-sm transition-colors cursor-pointer"
          >
            <Trash size={18} /> Delete Student
          </button>
        </div>
      </div>

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
                  {student.studentId} • {student.courses && student.courses.length > 0 ? student.courses.join(', ') : student.course}
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

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                Edit Student Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="p-6 overflow-y-auto space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    required
                    type="date"
                    value={editFormData.dob}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, dob: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    required
                    type="text"
                    value={editFormData.parentName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, parentName: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Emergency Contact No.
                  </label>
                  <input
                    required
                    type="tel"
                    value={editFormData.emergencyContact}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        emergencyContact: e.target.value,
                      })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Permanent Address
                </label>
                <textarea
                  required
                  rows="2"
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, address: e.target.value })
                  }
                  className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    required
                    type="text"
                    value={editFormData.highestQualification}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        highestQualification: e.target.value,
                      })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Enrolled Courses
                  </label>
                  {editFormData.courses && editFormData.courses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-2 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                      {editFormData.courses.map((courseName) => (
                        <span key={courseName} className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-brand-200">
                          {courseName}
                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(courseName)}
                            className="hover:text-brand-900 focus:outline-none font-bold text-[10px] ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <select
                    value=""
                    onChange={(e) => {
                      handleAddCourse(e.target.value);
                      e.target.value = "";
                    }}
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-800 outline-none"
                  >
                    <option value="">Choose Course to Add...</option>
                    {coursesList
                      .filter((c) => !editFormData.courses?.includes(c.courseName))
                      .map((c) => (
                        <option key={c._id} value={c.courseName}>
                          {c.courseName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Course Duration
                  </label>
                  <input
                    required
                    type="text"
                    value={editFormData.courseDuration}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        courseDuration: e.target.value,
                      })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Total Fee (₹)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={editFormData.totalFee}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, totalFee: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Change Profile Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, image: e.target.files[0] })
                  }
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
