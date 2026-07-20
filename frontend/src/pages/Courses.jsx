import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash } from '@phosphor-icons/react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    courseName: '',
    duration: '',
    domain: '',
    courseType: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add course. Please try again.');
    }
  };

  const handleDelete = async (id, courseId) => {
    if (window.confirm(`Are you sure you want to delete course ${courseId}?`)) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete course');
      }
    }
  };

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
                    <button
                      onClick={() => handleDelete(course._id, course.courseId)}
                      title="Delete Course"
                      className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash size={20} />
                    </button>
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
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Self-paced">Self-paced</option>
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
    </div>
  );
}
