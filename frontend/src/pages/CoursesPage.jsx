import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  BookOpen,
  UserCheck,
  X,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';
import { coursesAPI, facultyAPI, extractErrorMessage } from '../services/api';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';

export default function CoursesPage({ showToast, globalSearch, quickAction, clearQuickAction }) {
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    department: 'Computer Science',
    credits: 3,
    faculty: '',
    description: '',
  });

  // Handle global search sync
  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== null) {
      setSearch(globalSearch);
      setPage(1);
    }
  }, [globalSearch]);

  // Handle quick action from Dashboard
  useEffect(() => {
    if (quickAction === 'add-course') {
      openAddModal();
      clearQuickAction();
    }
  }, [quickAction]);

  // Fetch faculty list for dropdown selection
  const fetchFaculty = async () => {
    try {
      const res = await facultyAPI.getAll({ limit: 100 });
      if (res.data?.success) {
        setFacultyList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching faculty for dropdown', err);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await coursesAPI.getAll({
        search,
        department: selectedDept,
        page,
        limit: 8,
      });

      if (res.data?.success) {
        setCourses(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);

        // Collect distinct departments
        const depts = new Set(res.data.data.map((c) => c.department));
        if (depts.size > 0) {
          setDepartments((prev) => Array.from(new Set([...prev, ...Array.from(depts)])));
        }
      }
    } catch (err) {
      showToast('error', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [search, selectedDept, page]);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      courseName: '',
      courseCode: '',
      department: departments[0] || 'Computer Science',
      credits: 3,
      faculty: '',
      description: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName || '',
      courseCode: course.courseCode || '',
      department: course.department || 'Computer Science',
      credits: course.credits || 3,
      faculty: course.faculty?._id || course.faculty || '',
      description: course.description || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.courseName.trim() || !formData.courseCode.trim() || !formData.department.trim()) {
      setFormError('Course Name, Code, and Department are required.');
      return;
    }

    if (Number(formData.credits) < 1 || Number(formData.credits) > 10) {
      setFormError('Credits must be a number between 1 and 10.');
      return;
    }

    try {
      setModalLoading(true);
      const payload = {
        ...formData,
        courseCode: formData.courseCode.trim().toUpperCase(),
        credits: Number(formData.credits),
        faculty: formData.faculty === '' ? null : formData.faculty,
      };

      if (editingCourse) {
        await coursesAPI.update(editingCourse._id, payload);
        showToast('success', `Course '${payload.courseName}' updated successfully.`);
      } else {
        await coursesAPI.create(payload);
        showToast('success', `Course '${payload.courseName}' created successfully.`);
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      setDeleteLoading(true);
      await coursesAPI.delete(courseToDelete._id);
      showToast('success', `Course '${courseToDelete.courseName}' and its enrollments deleted.`);
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      showToast('error', extractErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Courses Directory
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {totalCount} Total
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure catalog courses, assign faculty instructors, and manage requirements.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Add New Course
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 card-shadow flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code, title, or keywords..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              {departments.map((dept) => (
                !['Computer Science', 'Electrical Engineering', 'Information Technology', 'Mathematics', 'Mechanical Engineering'].includes(dept) && (
                  <option key={dept} value={dept}>{dept}</option>
                )
              ))}
            </select>
          </div>

          <button
            onClick={fetchCourses}
            title="Refresh table"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Courses Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100 tracking-wider">
              <tr>
                <th className="py-4 px-6">Course Name & Code</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Credits</th>
                <th className="py-4 px-6">Assigned Faculty</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Loading courses from database...</span>
                    </div>
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                    No courses match the criteria.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{course.courseName}</div>
                      <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 mt-0.5">
                        {course.courseCode}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {course.department}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {course.credits} <span className="text-xs font-normal text-slate-400">Credits</span>
                    </td>
                    <td className="py-4 px-6">
                      {course.faculty ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>{course.faculty.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-xs text-slate-500">
                      {course.description || '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(course)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(course)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          pageSize={8}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCourse ? 'Edit Course Information' : 'Add New Course'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Operating Systems"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS401"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Credits (1 - 10) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Faculty
                  </label>
                  <select
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="">None (Unassigned)</option>
                    {facultyList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Overview of syllabus, prerequisites, and learning objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition flex items-center gap-2 shadow-sm shadow-blue-500/20"
                >
                  {modalLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Course"
        message="Are you sure you want to delete this course? All associated student enrollments in this course will also be removed."
        itemName={courseToDelete ? `${courseToDelete.courseName} (${courseToDelete.courseCode})` : ''}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
      />
    </div>
  );
}
