import { useState, useEffect } from "react";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import { MagnifyingGlass, Plus, Eye, Trash, Pencil } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const navigate = useNavigate();

  // Updated Form State with new fields
  const [formData, setFormData] = useState({
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
    image: null,
  });

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

  const [coursesList, setCoursesList] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCoursesList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCourse = (courseName, isEdit = false) => {
    if (!courseName) return;
    const setForm = isEdit ? setEditFormData : setFormData;
    setForm((prev) => {
      const currentCourses = prev.courses || [];
      if (currentCourses.includes(courseName)) return prev;
      const newCourses = [...currentCourses, courseName];
      
      const durations = newCourses.map(name => {
        const course = coursesList.find(c => c.courseName === name);
        return course ? course.duration : "";
      }).filter(Boolean);
      const combinedDuration = durations.join(", ");
      
      return {
        ...prev,
        courses: newCourses,
        courseDuration: combinedDuration || prev.courseDuration
      };
    });
  };

  const handleRemoveCourse = (courseName, isEdit = false) => {
    const setForm = isEdit ? setEditFormData : setFormData;
    setForm((prev) => {
      const currentCourses = prev.courses || [];
      const newCourses = currentCourses.filter(c => c !== courseName);
      
      const durations = newCourses.map(name => {
        const course = coursesList.find(c => c.courseName === name);
        return course ? course.duration : "";
      }).filter(Boolean);
      const combinedDuration = durations.join(", ");
      
      return {
        ...prev,
        courses: newCourses,
        courseDuration: combinedDuration
      };
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courses || formData.courses.length === 0) {
      alert("Please select at least one course.");
      return;
    }
    const data = new FormData();

    // Appending all existing and new fields to FormData
    Object.keys(formData).forEach((key) => {
      if (key === "image") {
        if (formData.image) data.append("image", formData.image);
      } else if (key === "courses") {
        data.append("courses", JSON.stringify(formData.courses));
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      await api.post("/students", data);
      setShowAddModal(false);
      // Reset form state
      setFormData({
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
        image: null,
      });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    const formattedDob = student.dob ? new Date(student.dob).toISOString().split('T')[0] : '';
    setEditFormData({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      dob: formattedDob,
      parentName: student.parentName || "",
      emergencyContact: student.emergencyContact || "",
      address: student.address || "",
      highestQualification: student.highestQualification || "",
      courses: student.courses || (student.course ? [student.course] : []),
      courseDuration: student.courseDuration || "",
      totalFee: student.totalFee || "",
      status: (student.status && student.status.startsWith("Active")) ? "Active" : (student.status || "Active"),
      image: null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.courses || editFormData.courses.length === 0) {
      alert("Please select at least one course.");
      return;
    }
    const data = new FormData();

    Object.keys(editFormData).forEach((key) => {
      if (key === "image") {
        if (editFormData.image) data.append("image", editFormData.image);
      } else if (key === "courses") {
        data.append("courses", JSON.stringify(editFormData.courses));
      } else {
        data.append(key, editFormData[key]);
      }
    });

    try {
      await api.put(`/students/${editingStudent._id}`, data);
      setShowEditModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update student");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this student? This will also delete their payment history.",
      )
    ) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Manage Students</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus weight="bold" />
          <span>Add Student</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 block w-full sm:text-sm border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 p-2.5 outline-none border transition-colors"
            />
          </div>

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
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Profile
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Student ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Course
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          src={`http://127.0.0.1:5000/${student.imagePath}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {student.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {student.courses && student.courses.length > 0 ? student.courses.join(', ') : (student.course || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {student.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/students/${student._id}`)}
                        title="View Full Details"
                        className="text-brand-600 hover:text-brand-900 p-1.5 hover:bg-brand-50 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={20} />
                        <span className="hidden xl:inline text-xs font-semibold">View Details</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(student)}
                        title="Edit Student"
                        className="text-amber-600 hover:text-amber-900 p-1.5 hover:bg-amber-50 rounded cursor-pointer"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        title="Delete Student"
                        className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                Add New Student
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAddSubmit}
              className="p-6 overflow-y-auto space-y-4"
            >
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
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
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Row 3: Parent Name & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.parentName}
                    onChange={(e) =>
                      setFormData({ ...formData, parentName: e.target.value })
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
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: e.target.value,
                      })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Row 4: Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Permanent Address
                </label>
                <textarea
                  required
                  rows="2"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 resize-none"
                ></textarea>
              </div>

              {/* Row 5: Highest Qualification & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., B.Tech, XII"
                    value={formData.highestQualification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                  {formData.courses && formData.courses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-2 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                      {formData.courses.map((courseName) => (
                        <span key={courseName} className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-brand-200">
                          {courseName}
                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(courseName, false)}
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
                      handleAddCourse(e.target.value, false);
                      e.target.value = "";
                    }}
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-800 outline-none"
                  >
                    <option value="">Choose Course to Add...</option>
                    {coursesList
                      .filter((c) => !formData.courses?.includes(c.courseName))
                      .map((c) => (
                        <option key={c._id} value={c.courseName}>
                          {c.courseName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Row 6: Course Duration & Total Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Course Duration
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., 6 Months, 1 Year"
                    value={formData.courseDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                    value={formData.totalFee}
                    onChange={(e) =>
                      setFormData({ ...formData, totalFee: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Row 7: Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                Edit Student Details
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="p-6 overflow-y-auto space-y-4"
            >
              {/* Row 1: Name & Email */}
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

              {/* Row 2: Phone & Date of Birth */}
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

              {/* Row 3: Parent Name & Emergency Contact */}
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

              {/* Row 4: Address */}
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

              {/* Row 5: Highest Qualification & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., B.Tech, XII"
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
                            onClick={() => handleRemoveCourse(courseName, true)}
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
                      handleAddCourse(e.target.value, true);
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

              {/* Row 6: Course Duration & Total Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Course Duration
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., 6 Months, 1 Year"
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

              {/* Row 7: Status & Profile Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Passout">Passout</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Profile Photo (Leave blank to keep existing)
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
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
