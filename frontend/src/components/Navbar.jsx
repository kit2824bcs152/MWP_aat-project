import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const titlesMap = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'Institutional statistics, analytics, and activity'
  },
  courses: {
    title: 'Course Catalog & Management',
    subtitle: 'Configure departments, credit requirements, and assigned faculty'
  },
  students: {
    title: 'Student Directory',
    subtitle: 'Manage enrolled student records, departments, and class standing'
  },
  faculty: {
    title: 'Faculty Members',
    subtitle: 'Manage professors, instructors, employee IDs, and specializations'
  },
  enrollments: {
    title: 'Enrollment Records',
    subtitle: 'Process course registrations, track completions, and status changes'
  }
};

export default function Navbar({ activeTab, onOpenSidebar, globalSearch, setGlobalSearch }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const currentMeta = titlesMap[activeTab] || titlesMap.dashboard;

  const notifications = [
    {
      id: 1,
      title: 'Database Synchronized',
      time: 'Just now',
      desc: 'MongoDB collections are active and running on port 5000.',
      icon: CheckCircle,
      color: 'text-emerald-500'
    },
    {
      id: 2,
      title: 'Spring Term Enrollments Active',
      time: '10m ago',
      desc: 'Students can now be registered across all active departments.',
      icon: Sparkles,
      color: 'text-blue-500'
    },
    {
      id: 3,
      title: 'Faculty Load Balanced',
      time: '1h ago',
      desc: 'All 6 faculty members assigned to their respective courses.',
      icon: Clock,
      color: 'text-amber-500'
    }
  ];

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left side: Hamburger (mobile) + Page Titles */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {currentMeta.title}
          </h2>
          <p className="hidden sm:block text-xs font-medium text-slate-500 mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Search field, Notifications dropdown, Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search input field */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search records..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  3 unread
                </span>
              </div>
              <div className="space-y-3">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg bg-slate-100 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <span className="text-[10px] text-slate-400">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white font-bold text-sm flex items-center justify-center shadow-sm">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Admin User</p>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
