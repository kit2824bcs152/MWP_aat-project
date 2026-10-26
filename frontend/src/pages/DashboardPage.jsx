import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Users2,
  ClipboardList,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { dashboardAPI, extractErrorMessage } from '../services/api';

const STATUS_COLORS = {
  Enrolled: '#2563eb', // blue
  Completed: '#10b981', // emerald
  Dropped: '#f43f5e', // rose
};

const DEPT_COLORS = ['#1e40af', '#3b82f6', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899'];

export default function DashboardPage({ setActiveTab, onTriggerQuickAction }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardAPI.getStats();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200/70 rounded-2xl" />
          <div className="h-80 bg-slate-200/70 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200/70 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-xl mx-auto my-12">
        <p className="text-rose-700 font-bold mb-2">Failed to load Dashboard data</p>
        <p className="text-xs text-rose-600 mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  const totals = data?.totals || { courses: 0, students: 0, faculty: 0, enrollments: 0 };
  const charts = data?.charts || {};
  const recentCourses = data?.recentCourses || [];
  const recentEnrollments = data?.recentEnrollments || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Action Banner / Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/60">
            System Operational
          </span>
          <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            Institutional Course & Enrollment Hub
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Real-time management for courses, student directories, faculty load, and term registrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onTriggerQuickAction('add-course')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Course
          </button>
          <button
            onClick={() => onTriggerQuickAction('enroll-student')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Enroll Student
          </button>
          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Courses"
          value={totals.courses}
          icon={BookOpen}
          subtitle="Offered curriculum"
          badgeText="Active"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          onClick={() => setActiveTab('courses')}
        />
        <StatsCard
          title="Total Students"
          value={totals.students}
          icon={GraduationCap}
          subtitle="Registered across years"
          badgeText="Undergraduate"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => setActiveTab('students')}
        />
        <StatsCard
          title="Faculty Members"
          value={totals.faculty}
          icon={Users2}
          subtitle="Academic professors"
          badgeText="Instructors"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => setActiveTab('faculty')}
        />
        <StatsCard
          title="Course Enrollments"
          value={totals.enrollments}
          icon={ClipboardList}
          subtitle="Term registrations"
          badgeText="Tracked"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => setActiveTab('enrollments')}
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Course Distribution by Department */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Courses by Department
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of courses across academic fields</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {charts.coursesByDepartment?.length || 0} Departments
            </span>
          </div>

          <div className="h-72 w-full">
            {charts.coursesByDepartment && charts.coursesByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.coursesByDepartment}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val} courses`, 'Count']}
                  />
                  <Bar dataKey="courses" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No course department data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Enrollment Status Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                Enrollment Status Breakdown
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Proportion of enrolled, completed, and dropped records</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {totals.enrollments} Total
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {charts.enrollmentsByStatus && charts.enrollmentsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.enrollmentsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {charts.enrollmentsByStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No enrollment status data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Recent Courses</h4>
              <p className="text-xs text-slate-500">Latest additions to the course catalog</p>
            </div>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <div key={course._id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{course.courseName}</span>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {course.courseCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {course.department} • {course.credits} Credits • {course.faculty?.name || 'Faculty unassigned'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">No courses registered yet.</div>
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Recent Enrollments</h4>
              <p className="text-xs text-slate-500">Latest student course registrations</p>
            </div>
            <button
              onClick={() => setActiveTab('enrollments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentEnrollments.length > 0 ? (
              recentEnrollments.map((enr) => {
                const status = enr.status || 'Enrolled';
                const statusStyles = {
                  Enrolled: 'bg-blue-50 text-blue-700 border-blue-200',
                  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  Dropped: 'bg-rose-50 text-rose-700 border-rose-200',
                }[status];

                return (
                  <div key={enr._id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        {enr.student?.name || 'Unknown Student'}
                        <span className="text-xs font-normal text-slate-400 ml-1.5">
                          ({enr.student?.rollNumber || 'N/A'})
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {enr.course?.courseName || 'Course'} ({enr.course?.courseCode})
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles}`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">No enrollment records found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
