import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  GraduationCap,
  Mail,
  FileText,
  X,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  BookOpen
} from 'lucide-react';
import { studentsAPI, extractErrorMessage } from '../services/api';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';

export default function StudentsPage({ showToast, globalSearch, quickAction, clearQuickAction }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // View Student Details Modal State
  const [viewStudentModalOpen, setViewStudentModalOpen] = useState(false);
  const [viewStudentData, setViewStudentData] = useState(null);
  const [viewStudentLoading, setViewStudentLoading] = useState(false);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: 'Computer Science',
    year: 1,
  });

  // Handle global search sync
  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== null) {
      setSearch(globalSearch);
      setPage(1);
    }
  }, [globalSearch]);

  // Handle quick action
  useEffect(() => {
    if (quickAction === 'add-student') {
      openAddModal();
      clearQuickAction();
    }
  }, [quickAction]);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentsAPI.getAll({
        search,
        department: selectedDept,
        year: selectedYear,
        page,
        limit: 8,
      });

      if (res.data?.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      showToast('error', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedDept, selectedYear, page]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      rollNumber: '',
      email: '',
      department: 'Computer Science',
      year: 1,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      rollNumber: student.rollNumber || '',
      email: student.email || '',
      department: student.department || 'Computer Science',
      year: student.year || 1,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openViewModal = async (studentId) => {
    try {
      setViewStudentLoading(true);
      setViewStudentModalOpen(true);
      const res = await studentsAPI.getById(studentId);
      if (res.data?.success) {
        setViewStudentData(res.data);
      }
    } catch (err) {
      showToast('error', extractErrorMessage(err));
      setViewStudentModalOpen(false);
    } finally {
      setViewStudentLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Form validation
    if (!formData.name.trim() || !formData.rollNumber.trim() || !formData.email.trim()) {
      setFormError('Name, Roll Number, and Email are required.');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    try {
      setModalLoading(true);
      const payload = {
        name: formData.name.trim(),
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        year: Number(formData.year),
      };

      if (editingStudent) {
        await studentsAPI.update(editingStudent._id, payload);
        showToast('success', `Student '${payload.name}' updated successfully.`);
      } else {
        await studentsAPI.create(payload);
        showToast('success', `Student '${payload.name}' registered successfully.`);
      }

      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      setDeleteLoading(true);
      await studentsAPI.delete(studentToDelete._id);
      showToast('success', `Student '${studentToDelete.name}' and enrollment records removed.`);
      setDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents();
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
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            Student Directory
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {totalCount} Enrolled
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage admitted students, track academic standings, and view enrolled course lists.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Register Student
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 card-shadow flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, roll number, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
          >
            <option value="All">All Years</option>
            <option value="1">Year 1 (Freshman)</option>
            <option value="2">Year 2 (Sophomore)</option>
            <option value="3">Year 3 (Junior)</option>
            <option value="4">Year 4 (Senior)</option>
          </select>

          <button
            onClick={fetchStudents}
            title="Refresh table"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100 tracking-wider">
              <tr>
                <th className="py-4 px-6">Student Name & Roll No</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Year of Study</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                      <span>Loading student records...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                    No students match the criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 mt-0.5">
                        {student.rollNumber}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {student.department}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
                        Year {student.year}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openViewModal(student._id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="View Enrollments"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(student)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Student"
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
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
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS202409"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Year of Study <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  >
                    <option value="1">Year 1 (Freshman)</option>
                    <option value="2">Year 2 (Sophomore)</option>
                    <option value="3">Year 3 (Junior)</option>
                    <option value="4">Year 4 (Senior)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.j@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
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
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition flex items-center gap-2 shadow-sm shadow-emerald-500/20"
                >
                  {modalLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Details & Active Enrollments Modal */}
      {viewStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Student Academic Profile
              </h3>
              <button
                onClick={() => {
                  setViewStudentModalOpen(false);
                  setViewStudentData(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewStudentLoading ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                <span>Loading profile...</span>
              </div>
            ) : viewStudentData ? (
              <div className="mt-4 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <h4 className="text-base font-extrabold text-slate-900">{viewStudentData.data?.name}</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-400">Roll Number:</span>{' '}
                      <span className="font-bold text-slate-800">{viewStudentData.data?.rollNumber}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Standing:</span>{' '}
                      <span className="font-bold text-slate-800">Year {viewStudentData.data?.year}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Email:</span>{' '}
                      <span className="font-medium text-slate-800">{viewStudentData.data?.email}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Department:</span>{' '}
                      <span className="font-medium text-slate-800">{viewStudentData.data?.department}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Enrolled Courses ({viewStudentData.enrollments?.length || 0})
                  </h5>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {viewStudentData.enrollments && viewStudentData.enrollments.length > 0 ? (
                      viewStudentData.enrollments.map((enr) => (
                        <div
                          key={enr._id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{enr.course?.courseName || 'Course'}</p>
                            <p className="text-[11px] text-slate-400">
                              {enr.course?.courseCode} • {enr.course?.credits} Credits
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                              enr.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : enr.status === 'Dropped'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {enr.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        No courses currently enrolled for this student.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Student"
        message="Are you sure you want to remove this student? All of their course enrollment history will also be permanently deleted."
        itemName={studentToDelete ? `${studentToDelete.name} (${studentToDelete.rollNumber})` : ''}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
      />
    </div>
  );
}
