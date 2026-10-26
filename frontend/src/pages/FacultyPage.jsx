import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Users2,
  Mail,
  Award,
  X,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';
import { facultyAPI, extractErrorMessage } from '../services/api';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';

export default function FacultyPage({ showToast, globalSearch, quickAction, clearQuickAction }) {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    department: 'Computer Science',
    specialization: '',
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
    if (quickAction === 'add-faculty') {
      openAddModal();
      clearQuickAction();
    }
  }, [quickAction]);

  // Fetch faculty
  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await facultyAPI.getAll({
        search,
        department: selectedDept,
        page,
        limit: 8,
      });

      if (res.data?.success) {
        setFaculty(res.data.data);
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
    fetchFaculty();
  }, [search, selectedDept, page]);

  const openAddModal = () => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      employeeId: '',
      email: '',
      department: 'Computer Science',
      specialization: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingFaculty(member);
    setFormData({
      name: member.name || '',
      employeeId: member.employeeId || '',
      email: member.email || '',
      department: member.department || 'Computer Science',
      specialization: member.specialization || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (
      !formData.name.trim() ||
      !formData.employeeId.trim() ||
      !formData.email.trim() ||
      !formData.specialization.trim()
    ) {
      setFormError('All fields including Specialization are required.');
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
        employeeId: formData.employeeId.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        specialization: formData.specialization.trim(),
      };

      if (editingFaculty) {
        await facultyAPI.update(editingFaculty._id, payload);
        showToast('success', `Faculty '${payload.name}' updated successfully.`);
      } else {
        await facultyAPI.create(payload);
        showToast('success', `Faculty member '${payload.name}' added successfully.`);
      }

      setIsModalOpen(false);
      fetchFaculty();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = (member) => {
    setFacultyToDelete(member);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!facultyToDelete) return;
    try {
      setDeleteLoading(true);
      await facultyAPI.delete(facultyToDelete._id);
      showToast('success', `Faculty member '${facultyToDelete.name}' deleted and courses unassigned.`);
      setDeleteModalOpen(false);
      setFacultyToDelete(null);
      fetchFaculty();
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
            <Users2 className="w-5 h-5 text-purple-600" />
            Faculty Members
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
              {totalCount} Instructors
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain professor directory, employee IDs, department assignments, and research fields.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Member
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 card-shadow flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, employee ID, specialization..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>

          <button
            onClick={fetchFaculty}
            title="Refresh table"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Faculty Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100 tracking-wider">
              <tr>
                <th className="py-4 px-6">Faculty Name & ID</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Specialization</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                      <span>Loading faculty members...</span>
                    </div>
                  </td>
                </tr>
              ) : faculty.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                    No faculty members match the criteria.
                  </td>
                </tr>
              ) : (
                faculty.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{member.name}</div>
                      <span className="inline-block text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 mt-0.5">
                        {member.employeeId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {member.department}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{member.specialization}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Edit Faculty"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(member)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Faculty"
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

      {/* Add / Edit Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingFaculty ? 'Edit Faculty Details' : 'Add New Faculty Member'}
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
                  Faculty Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alan Turing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAC-CS-009"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alan.turing@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specialization & Research Focus <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Algorithms"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
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
                  className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl transition flex items-center gap-2 shadow-sm shadow-purple-500/20"
                >
                  {modalLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingFaculty ? 'Save Changes' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Faculty Member"
        message="Are you sure you want to delete this faculty member? Any courses taught by them will become unassigned."
        itemName={facultyToDelete ? `${facultyToDelete.name} (${facultyToDelete.employeeId})` : ''}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setFacultyToDelete(null);
        }}
      />
    </div>
  );
}
