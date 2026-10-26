import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ToastNotification from './components/ToastNotification';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import StudentsPage from './pages/StudentsPage';
import FacultyPage from './pages/FacultyPage';
import EnrollmentsPage from './pages/EnrollmentsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [quickAction, setQuickAction] = useState(null);

  // Global Toast Notification State
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const showToast = (type, message) => {
    setToast({
      isOpen: true,
      type,
      message,
    });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  };

  // Handler for dashboard quick action triggers
  const handleQuickAction = (action) => {
    if (action === 'add-course') {
      setActiveTab('courses');
      setQuickAction('add-course');
    } else if (action === 'enroll-student') {
      setActiveTab('enrollments');
      setQuickAction('enroll-student');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <Navbar
          activeTab={activeTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />

        {/* Dynamic Page View Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              onTriggerQuickAction={handleQuickAction}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesPage
              showToast={showToast}
              globalSearch={globalSearch}
              quickAction={quickAction}
              clearQuickAction={() => setQuickAction(null)}
            />
          )}

          {activeTab === 'students' && (
            <StudentsPage
              showToast={showToast}
              globalSearch={globalSearch}
              quickAction={quickAction}
              clearQuickAction={() => setQuickAction(null)}
            />
          )}

          {activeTab === 'faculty' && (
            <FacultyPage
              showToast={showToast}
              globalSearch={globalSearch}
              quickAction={quickAction}
              clearQuickAction={() => setQuickAction(null)}
            />
          )}

          {activeTab === 'enrollments' && (
            <EnrollmentsPage
              showToast={showToast}
              globalSearch={globalSearch}
              quickAction={quickAction}
              clearQuickAction={() => setQuickAction(null)}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="py-6 px-8 border-t border-slate-200/80 text-center text-xs text-slate-500 bg-white">
          <p>© {new Date().getFullYear()} CampusCore Academic Management System. Built with React.js, Express, and MongoDB.</p>
        </footer>
      </div>

      {/* Global Toast Alert */}
      {toast.isOpen && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
