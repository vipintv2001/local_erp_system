import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash, Pencil, Eye, Users, UserCheck } from '@phosphor-icons/react';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseId: '',
    courseName: '',
    duration: '',
    domain: '',
    courseType: '',
  });

  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    courseId: '',
    courseName: '',
    duration: '',
    domain: '',
    courseType: '',
  });

  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentTabFilter, setStudentTabFilter] = useState('All'); // 'All' | 'Active'
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');

  const courseTypeOptions = [
    "Full-time",
    "Crash Course",
    "Online",
    "Hybrid",
    "Internship",
    "Vacation Course",
    "Project",
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      // Ignored
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/courses', formData);
      setShowAddModal(false);
      setFormData({
        courseId: '',
        courseName: '',
        duration: '',
        domain: '',
        courseType: '',
      });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add course. Please try again.');
    }
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setEditFormData({
      courseId: course.courseId || '',
      courseName: course.courseName || '',
      duration: course.duration || '',
      domain: course.domain || '',
      courseType: course.courseType || '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    try {
      await api.put(`/courses/${editingCourse._id}`, editFormData);
      setShowEditModal(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update course.');
    }
  };

  const handleDeleteCourse = async (id, courseId) => {
    if (window.confirm(`Are you sure you want to delete course ${courseId}?`)) {
      try {
        await api.delete(`/courses/${id}`);
        if (selectedCourseDetails && selectedCourseDetails._id === id) {
          setShowDetailsModal(false);
        }
        fetchCourses();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const handleViewCourseDetails = async (course) => {
    setSelectedCourseDetails(course);
    setStudentTabFilter('All');
    setShowDetailsModal(true);
    try {
      const studentsRes = await api.get('/students');
      const allStudents = studentsRes.data || [];

      // Filter students enrolled in this course
      const matchingStudents = allStudents.filter(s =>
        (s.courses && s.courses.includes(course.courseName)) ||
        s.course === course.courseName
      );
      setEnrolledStudents(matchingStudents);
    } catch (err) {
      // Ignored
    }
  };

  const activeStudents = enrolledStudents.filter(s => s.status && s.status.startsWith('Active'));
  const displayedStudents = studentTabFilter === 'Active' ? activeStudents : enrolledStudents;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Courses</h1>
          <p className="text-slate-500 mt-1">Configure and manage course catalog details.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
        >
          <Plus weight="bold" />
          <span>Add Course</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Course ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Type</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{course.courseId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{course.courseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{course.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{course.domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-brand-50 border-brand-200 text-brand-700">
                      {course.courseType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewCourseDetails(course)}
                        title="View Course Details"
                        className="text-brand-600 hover:text-brand-900 p-1.5 hover:bg-brand-50 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={20} />
                        <span className="hidden xl:inline text-xs font-semibold">View Details</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(course)}
                        title="Edit Course"
                        className="text-amber-600 hover:text-amber-900 p-1.5 hover:bg-amber-50 rounded cursor-pointer"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id, course.courseId)}
                        title="Delete Course"
                        className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No courses configured yet. Click "Add Course" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Add New Course</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course ID</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. WD-101"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Web Development Bootcamp"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 6 Months"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Engineering, Marketing"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Type</label>
                <select
                  required
                  value={formData.courseType}
                  onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-800 outline-none"
                >
                  <option value="">Select Course Type</option>
                  {courseTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Edit Course Details</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCourse(null);
                  setEditError('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              {editError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course ID</label>
                <input
                  required
                  type="text"
                  value={editFormData.courseId}
                  onChange={(e) => setEditFormData({ ...editFormData, courseId: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                <input
                  required
                  type="text"
                  value={editFormData.courseName}
                  onChange={(e) => setEditFormData({ ...editFormData, courseName: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                  <input
                    required
                    type="text"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                  <input
                    required
                    type="text"
                    value={editFormData.domain}
                    onChange={(e) => setEditFormData({ ...editFormData, domain: e.target.value })}
                    className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Type</label>
                <select
                  required
                  value={editFormData.courseType}
                  onChange={(e) => setEditFormData({ ...editFormData, courseType: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2.5 border focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-800 outline-none"
                >
                  <option value="">Select Course Type</option>
                  {courseTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCourse(null);
                    setEditError('');
                  }}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm cursor-pointer"
                >
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Course Details Modal */}
      {showDetailsModal && selectedCourseDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">
                  Course Details: {selectedCourseDetails.courseName}
                </h3>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {selectedCourseDetails.courseId}
                </span>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <Users size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Enrolled Students</p>
                    <p className="text-xl font-bold text-slate-800">{enrolledStudents.length}</p>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Active Students</p>
                    <p className="text-xl font-bold text-slate-800">{activeStudents.length}</p>
                  </div>
                </div>
              </div>

              {/* Course Info Summary */}
              <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div><span className="text-slate-500 font-medium">Domain:</span> <span className="font-semibold text-slate-800">{selectedCourseDetails.domain}</span></div>
                <div><span className="text-slate-500 font-medium">Duration:</span> <span className="font-semibold text-slate-800">{selectedCourseDetails.duration}</span></div>
                <div><span className="text-slate-500 font-medium">Course Type:</span> <span className="font-semibold text-slate-800">{selectedCourseDetails.courseType}</span></div>
              </div>

              {/* Students Section Header with Filter Tabs */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h4 className="text-md font-bold text-slate-800">
                    Students List
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStudentTabFilter('All')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        studentTabFilter === 'All'
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      All Enrolled ({enrolledStudents.length})
                    </button>
                    <button
                      onClick={() => setStudentTabFilter('Active')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        studentTabFilter === 'Active'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Currently Active ({activeStudents.length})
                    </button>
                  </div>
                </div>

                {/* Clean Students Table showing Student Name */}
                {displayedStudents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm">
                    No {studentTabFilter === 'Active' ? 'active' : 'enrolled'} students in this course.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {displayedStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img
                                  src={`http://127.0.0.1:5000/${student.imagePath}`}
                                  alt={student.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <span className="text-sm font-semibold text-slate-900">
                                  {student.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-600 font-medium">
                              {student.studentId}
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <StatusBadge status={student.status} />
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-right text-sm">
                              <button
                                onClick={() => {
                                  setShowDetailsModal(false);
                                  navigate(`/students/${student._id}`);
                                }}
                                className="text-brand-600 hover:text-brand-900 font-semibold text-xs hover:underline cursor-pointer"
                              >
                                View Profile →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
