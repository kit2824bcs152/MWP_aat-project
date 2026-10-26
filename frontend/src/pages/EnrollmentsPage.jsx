import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ClipboardList,
  Calendar,
  BookOpen,
  GraduationCap,
  X,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  enrollmentsAPI,
  studentsAPI,
  coursesAPI,
  extractErrorMessage
} from '../services/api';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';

export default function EnrollmentsPage({ showToast, globalSearch, quickAction, clearQuickAction }) {
  const [enrollments, setEnrollments] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'Enrolled',
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
    if (quickAction === 'enroll-student') {
      openAddModal();
      clearQuickAction();
    }
  }, [quickAction]);

  // Fetch students and courses for dropdown selection
  const fetchDropdownData = async () => {
    try {
      const [resStudents, resCourses] = await Promise.all([
        studentsAPI.getAll({ limit: 100 }),
        coursesAPI.getAll({ limit: 100 }),
      ]);
      if (resStudents.data?.success) setStudentsList(resStudents.data.data);
      if (resCourses.data?.success) setCoursesList(resCourses.data.data);
    } catch (err) {
      console.error('Error fetching dropdown records', err);
    }
  };

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await enrollmentsAPI.getAll({
        search,
        status: selectedStatus,
        page,
        limit: 8,
      });

      if (res.data?.success) {
        setEnrollments(res.data.data);
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
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [search, selectedStatus, page]);

  const openAddModal = () => {
    setEditingEnrollment(null);
    setFormData({
      student: studentsList[0]?._id || '',
      course: coursesList[0]?._id || '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'Enrolled',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (enr) => {
    setEditingEnrollment(enr);
    setFormData({
      student: enr.student?._id || '',
      course: enr.course?._id || '',
      enrollmentDate: enr.enrollmentDate ? new Date(enr.enrollmentDate).toISOString().split('T')[0] : '',
      status: enr.status || 'Enrolled',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.student || !formData.course) {
      setFormError('Please select both a student and a course.');
      return;
    }

    try {
      setModalLoading(true);
      if (editingEnrollment) {
        // Updating existing enrollment (status / date)
        await enrollmentsAPI.update(editingEnrollment._id, {
          status: formData.status,
          enrollmentDate: formData.enrollmentDate,
        });
        showToast('success', 'Enrollment status updated successfully.');
      } else {
        // Creating new enrollment
        await enrollmentsAPI.create({
          student: formData.student,
          course: formData.course,
          enrollmentDate: formData.enrollmentDate,
          status: formData.status,
        });
        showToast('success', 'Student successfully enrolled in course.');
      }

      setIsModalOpen(false);
      fetchEnrollments();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = (enr) => {
    setEnrollmentToDelete(enr);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!enrollmentToDelete) return;
    try {
      setDeleteLoading(true);
      await enrollmentsAPI.delete(enrollmentToDelete._id);
      showToast('success', 'Enrollment record removed successfully.');
      setDeleteModalOpen(false);
      setEnrollmentToDelete(null);
      fetchEnrollments();
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
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Course Enrollments
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              {totalCount} Registrations
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Process student enrollments, record credit completion, and prevent duplicate course assignments.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          New Enrollment
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 card-shadow flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or course name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
          >
            <option value="All">All Statuses</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>

          <button
            onClick={fetchEnrollments}
            title="Refresh table"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Enrollments Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100 tracking-wider">
              <tr>
                <th className="py-4 px-6">Student Details</th>
                <th className="py-4 px-6">Course Information</th>
                <th className="py-4 px-6">Credits</th>
                <th className="py-4 px-6">Enrollment Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>Loading enrollment records...</span>
                    </div>
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                    No enrollment records match the criteria.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr) => {
                  const statusStyles = {
                    Enrolled: 'bg-blue-50 text-blue-700 border-blue-200',
                    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Dropped: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[enr.status] || 'bg-slate-50 text-slate-700 border-slate-200';

                  const formattedDate = enr.enrollmentDate
                    ? new Date(enr.enrollmentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={enr._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                          <span>{enr.student?.name || 'Unknown Student'}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {enr.student?.rollNumber} • {enr.student?.department}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>{enr.course?.courseName || 'Unknown Course'}</span>
                        </div>
                        <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-0.5">
                          {enr.course?.courseCode}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {enr.course?.credits || '—'} Credits
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles}`}>
                          {enr.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(enr)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Update Status"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(enr)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Add / Edit Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingEnrollment ? 'Update Enrollment Record' : 'Register New Student Enrollment'}
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
              {/* If editing, student and course are locked to preserve integrity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Student <span className="text-rose-500">*</span>
                </label>
                {editingEnrollment ? (
                  <input
                    type="text"
                    disabled
                    value={`${editingEnrollment.student?.name} (${editingEnrollment.student?.rollNumber})`}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed"
                  />
                ) : (
                  <select
                    required
                    value={formData.student}
                    onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  >
                    <option value="">Choose Student...</option>
                    {studentsList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.rollNumber}) — {s.department}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Course <span className="text-rose-500">*</span>
                </label>
                {editingEnrollment ? (
                  <input
                    type="text"
                    disabled
                    value={`${editingEnrollment.course?.courseName} (${editingEnrollment.course?.courseCode})`}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed"
                  />
                ) : (
                  <select
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  >
                    <option value="">Choose Course...</option>
                    {coursesList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.courseName} ({c.courseCode}) — {c.credits} Credits
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enrollment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.enrollmentDate}
                    onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enrollment Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  >
                    <option value="Enrolled">Enrolled</option>
                    <option value="Completed">Completed</option>
                    <option value="Dropped">Dropped</option>
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
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition flex items-center gap-2 shadow-sm shadow-indigo-500/20"
                >
                  {modalLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingEnrollment ? 'Save Status' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Remove Enrollment Record"
        message="Are you sure you want to remove this enrollment record? The student will no longer be registered in this course."
        itemName={
          enrollmentToDelete
            ? `${enrollmentToDelete.student?.name} (${enrollmentToDelete.student?.rollNumber}) in ${enrollmentToDelete.course?.courseName}`
            : ''
        }
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setEnrollmentToDelete(null);
        }}
      />
    </div>
  );
}
