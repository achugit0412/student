import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Search,
  Moon,
  Sun,
  Bell,
  User,
  GraduationCap,
  Briefcase,
  Trophy,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Award,
  BookOpen,
  MapPin,
  Clock,
  ChevronRight,
  Plus,
  Send,
  Download,
  Users,
  Shield,
  BarChart2,
  RefreshCw,
  Edit3,
  X
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [users, setUsers] = useState([
    {
      id: 'std-001',
      name: 'Alex Morgan',
      email: 'alex.morgan@educloud.ac.in',
      role: 'student',
      department: 'Computer Science & Engg',
      year_semester: 'Year 3 - Semester 6',
      roll_number: '21CS1042',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'fac-101',
      name: 'Prof. Sarah Jenkins',
      email: 'sarah.jenkins@educloud.ac.in',
      role: 'faculty',
      department: 'Computer Science & Engg',
      year_semester: 'Department Chair & Professor',
      roll_number: 'FAC-CS-101',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'adm-001',
      name: 'Dr. Robert Vance',
      email: 'admin@educloud.ac.in',
      role: 'admin',
      department: 'Institutional Administration',
      year_semester: 'Dean of Academic Affairs',
      roll_number: 'ADM-001',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    }
  ]);
  const [currentUser, setCurrentUser] = useState(users[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Modals state
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [newVenue, setNewVenue] = useState('');
  const [venueNote, setVenueNote] = useState('');

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'academic', priority: 'medium' });

  const [showHackathonModal, setShowHackathonModal] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [teamName, setTeamName] = useState('');

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedAttCourse, setSelectedAttCourse] = useState(null);
  const [attForm, setAttForm] = useState({ attended: 0, total: 0 });

  // CGPA Calculator state
  const [cgpaCourses, setCgpaCourses] = useState([
    { id: 1, name: 'Distributed Cloud Computing', credits: 4, gradePoints: 10 },
    { id: 2, name: 'Design & Analysis of Algorithms', credits: 4, gradePoints: 9 },
    { id: 3, name: 'Database Management Systems', credits: 3, gradePoints: 9 },
    { id: 4, name: 'Artificial Intelligence Lab', credits: 2, gradePoints: 10 }
  ]);
  const [calculatedSgpa, setCalculatedSgpa] = useState(null);

  // Projection simulator state
  const [selectedSimCourse, setSelectedSimCourse] = useState(null);
  const [simAttend, setSimAttend] = useState(3);
  const [simMiss, setSimMiss] = useState(1);

  // Toggle Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch Dashboard Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/students/std-001/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        if (data.attendance && data.attendance.length > 0) {
          setSelectedSimCourse(data.attendance[1] || data.attendance[0]);
        }
      }
      const adminRes = await fetch(`${API_BASE}/admin/metrics`);
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setAdminMetrics(adminData);
      }
    } catch (err) {
      console.error('API Error, using fallback state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Venue Update (Faculty/Admin)
  const handleUpdateVenue = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;
    try {
      const res = await fetch(`${API_BASE}/exams/${selectedExam.id}/venue`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue_hall: newVenue, update_note: venueNote })
      });
      if (res.ok) {
        setShowVenueModal(false);
        fetchData();
        alert('Exam venue updated and broadcasted successfully!');
      }
    } catch (err) {
      alert('Error updating venue');
    }
  };

  // Handle Attendance Update (Faculty)
  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    if (!selectedAttCourse) return;
    try {
      const res = await fetch(`${API_BASE}/attendance/mark`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'std-001',
          course_id: selectedAttCourse.course_id,
          attended_classes: parseInt(attForm.attended),
          total_classes: parseInt(attForm.total)
        })
      });
      if (res.ok) {
        setShowAttendanceModal(false);
        fetchData();
        alert('Attendance updated successfully!');
      }
    } catch (err) {
      alert('Error updating attendance');
    }
  };

  // Handle Publish Notice
  const handlePublishNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noticeForm,
          author: currentUser.name
        })
      });
      if (res.ok) {
        setShowNoticeModal(false);
        setNoticeForm({ title: '', content: '', category: 'academic', priority: 'medium' });
        fetchData();
        alert('Notice published successfully to campus network!');
      }
    } catch (err) {
      alert('Error publishing notice');
    }
  };

  // Handle Apply to Placement
  const handleApplyPlacement = async (placementId) => {
    try {
      const res = await fetch(`${API_BASE}/placements/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: 'std-001', placement_id: placementId })
      });
      if (res.ok) {
        fetchData();
        alert('Application submitted successfully!');
      }
    } catch (err) {
      alert('Error applying to placement');
    }
  };

  // Handle Hackathon Register
  const handleRegisterHackathon = async (e) => {
    e.preventDefault();
    if (!selectedHackathon) return;
    try {
      const res = await fetch(`${API_BASE}/hackathons/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'std-001',
          hackathon_id: selectedHackathon.id,
          team_name: teamName
        })
      });
      if (res.ok) {
        setShowHackathonModal(false);
        setTeamName('');
        alert('Team registered for hackathon!');
      }
    } catch (err) {
      alert('Error registering for hackathon');
    }
  };

  // Calculate CGPA locally
  const handleCalculateCgpa = () => {
    let totalCreds = 0;
    let totalPoints = 0;
    cgpaCourses.forEach((c) => {
      totalCreds += parseFloat(c.credits) || 0;
      totalPoints += (parseFloat(c.credits) || 0) * (parseFloat(c.gradePoints) || 0);
    });
    const sgpa = totalCreds > 0 ? (totalPoints / totalCreds).toFixed(2) : '0.00';
    setCalculatedSgpa({ sgpa, totalCreds });
  };

  // Projection formula helper
  const calcProjectedPct = (item, addAttended, addTotal) => {
    if (!item) return 0;
    const newAtt = item.attended_classes + addAttended;
    const newTot = item.total_classes + addTotal;
    return newTot > 0 ? ((newAtt / newTot) * 100).toFixed(1) : 0;
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return <span className="badge badge-cyan"><GraduationCap size={12} /> Student</span>;
      case 'faculty':
        return <span className="badge badge-amber"><BookOpen size={12} /> Faculty</span>;
      case 'admin':
        return <span className="badge badge-rose"><Shield size={12} /> Admin</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Header Bar */}
      <header
        className="glass-panel"
        style={{
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Cloud size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Edu<span className="text-gradient">Cloud</span>
                </h1>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  v2.4 Live
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Centralized Cloud Academic Intelligence Platform
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, exams, placement drives, hackathons..."
              className="input-field"
              style={{ paddingLeft: '38px', borderRadius: '20px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Dark/Light Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-secondary"
              style={{ padding: '8px', borderRadius: '50%' }}
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
            </button>

            {/* Notifications Popover */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn-secondary"
                style={{ padding: '8px', borderRadius: '50%', position: 'relative' }}
              >
                <Bell size={18} color="var(--text-primary)" />
                {dashboardData?.low_attendance_alerts?.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--accent-rose)',
                      border: '2px solid var(--bg-primary)'
                    }}
                  />
                )}
              </button>

              {showNotifications && (
                <div
                  className="glass-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '320px',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Notifications</h4>
                    <span className="badge badge-rose">2 New</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(244, 63, 94, 0.1)',
                        borderLeft: '3px solid #f43f5e'
                      }}
                    >
                      <p style={{ fontWeight: 600, color: '#fb7185' }}>⚠️ Attendance Alert</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        Algorithms (CS302) attendance is 65% (below 75% threshold).
                      </p>
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderLeft: '3px solid #f59e0b'
                      }}
                    >
                      <p style={{ fontWeight: 600, color: '#fbbf24' }}>📅 Exam Venue Shifted</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        CS302 Exam venue moved to Computer Lab 4.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Persona Switcher Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                    {currentUser.name}
                  </p>
                  <div>{getRoleBadge(currentUser.role)}</div>
                </div>
              </button>

              {showUserDropdown && (
                <div
                  className="glass-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '310px',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}
                  >
                    Switch User / Persona Role
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserDropdown(false);
                          if (u.role === 'admin') setActiveTab('admin');
                          else if (u.role === 'faculty') setActiveTab('exams');
                          else setActiveTab('overview');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: currentUser.id === u.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                          border: currentUser.id === u.id ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={u.avatar} alt={u.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                          <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{u.name}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>{u.department}</p>
                          </div>
                        </div>
                        {getRoleBadge(u.role)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        style={{
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          padding: '0 24px'
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingTop: '6px'
          }}
        >
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: BarChart2 },
            { id: 'attendance', label: 'Attendance & Projection', icon: CheckCircle },
            { id: 'exams', label: 'Exams & Venues', icon: Calendar },
            { id: 'cgpa', label: 'CGPA & Calculator', icon: Award },
            { id: 'placements', label: 'Placements Drive', icon: Briefcase },
            { id: 'hackathons', label: 'Hackathons Summit', icon: Trophy },
            { id: 'announcements', label: 'Campus Notices', icon: Bell },
            ...(currentUser.role === 'admin' || currentUser.role === 'faculty'
              ? [{ id: 'admin', label: 'Institutional Admin', icon: Shield }]
              : [])
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} color={active ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', gap: '12px' }}>
            <RefreshCw className="animate-pulse-glow" size={32} color="var(--accent-cyan)" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading EduCloud Academic Intelligence Engine...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && dashboardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* User Welcome Banner */}
                <div
                  className="glass-panel animate-fade-in"
                  style={{
                    padding: '24px',
                    background: 'var(--gradient-glow)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent-cyan)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome back, {currentUser.name}!</h2>
                        {getRoleBadge(currentUser.role)}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {currentUser.department} | {currentUser.year_semester} | Roll No: {currentUser.roll_number}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Overall CGPA
                      </p>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {dashboardData.overall_cgpa}
                      </h3>
                    </div>
                    <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Aggregate Attendance
                      </p>
                      <h3
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          color: dashboardData.overall_attendance_pct >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                        }}
                      >
                        {dashboardData.overall_attendance_pct}%
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Low Attendance Critical Alert Banner */}
                {dashboardData.low_attendance_alerts?.length > 0 && (
                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      padding: '18px 24px',
                      background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(245, 158, 11, 0.15))',
                      borderLeft: '4px solid var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.2)', borderRadius: '50%' }}>
                        <AlertTriangle size={24} color="#f43f5e" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fb7185', margin: 0 }}>
                          🚨 Critical Attendance Warning!
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          You have {dashboardData.low_attendance_alerts.length} course(s) falling below the 75% institutional requirement.
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('attendance')} className="btn-primary" style={{ background: '#f43f5e' }}>
                      Open Attendance Simulator
                    </button>
                  </div>
                )}

                {/* Dashboard Grid Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {/* Exams Widget */}
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} color="var(--accent-amber)" />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Upcoming Exams</h3>
                      </div>
                      <button onClick={() => setActiveTab('exams')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        View All
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {dashboardData.exams.map((ex) => (
                        <div
                          key={ex.id}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'rgba(0,0,0,0.2)',
                            border: ex.is_updated ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                              {ex.course_code}
                            </span>
                            {ex.is_updated === 1 && (
                              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                                Venue Shifted
                              </span>
                            )}
                          </div>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '6px 0 4px 0' }}>{ex.course_name}</h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            📅 {ex.exam_date} | ⏰ {ex.exam_time}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: ex.is_updated ? '#fbbf24' : 'var(--text-primary)', marginTop: '4px' }}>
                            📍 Hall: <strong>{ex.venue_hall}</strong> ({ex.seat_number})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Placements Widget */}
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={20} color="var(--accent-cyan)" />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Open Placement Drives</h3>
                      </div>
                      <button onClick={() => setActiveTab('placements')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        Explore Drives
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {dashboardData.placements.map((pl) => (
                        <div key={pl.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{pl.company}</h4>
                            <span className="badge badge-emerald">{pl.package_lpa} LPA</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{pl.role}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Min CGPA: {pl.min_cgpa}</span>
                            <button onClick={() => handleApplyPlacement(pl.id)} className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                              Quick Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notices Widget */}
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={20} color="var(--accent-rose)" />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Campus Notices</h3>
                      </div>
                      <button onClick={() => setActiveTab('announcements')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                        All Notices
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {dashboardData.announcements.slice(0, 3).map((ann) => (
                        <div key={ann.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span className={`badge badge-${ann.priority === 'high' ? 'rose' : 'cyan'}`} style={{ fontSize: '0.65rem' }}>
                              {ann.category}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ann.created_at}</span>
                          </div>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{ann.title}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ATTENDANCE TRACKER & SIMULATOR */}
            {activeTab === 'attendance' && dashboardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Simulator Alert Banner */}
                {dashboardData.low_attendance_alerts?.length > 0 && (
                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(245, 158, 11, 0.15))',
                      borderLeft: '4px solid var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.2)', borderRadius: '50%' }}>
                        <AlertTriangle size={24} color="#f43f5e" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fb7185', margin: 0 }}>
                          🚨 Attendance Alert: {dashboardData.low_attendance_alerts.length} Course(s) Below 75% Threshold!
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                          Under institutional regulations, failing to maintain 75% attendance will disqualify you from End-Semester exams.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {dashboardData.low_attendance_alerts.map((al) => (
                        <span key={al.course_id} className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
                          {al.course_id}: {al.percentage}% (Must attend {al.classes_needed_for_75} more classes)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aggregate Attendance Card */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-cyan">Real-Time Sync</span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Semester Attendance Overview</h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Total Conducted Classes: <strong>120</strong> | Total Attended: <strong>96</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Aggregate Attendance
                      </p>
                      <h2
                        style={{
                          fontSize: '2.2rem',
                          fontWeight: 800,
                          color: dashboardData.overall_attendance_pct >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                          lineHeight: 1
                        }}
                      >
                        {dashboardData.overall_attendance_pct}%
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Main Attendance Matrix & Simulator Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  {/* Course Cards Matrix */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Course-Wise Attendance Matrix
                      </h4>
                      {currentUser.role === 'faculty' && (
                        <span className="badge badge-amber">Faculty Edit Mode Active</span>
                      )}
                    </div>

                    {dashboardData.attendance.map((item) => {
                      const pct = Math.round((item.attended_classes / item.total_classes) * 100);
                      const isSelected = selectedSimCourse?.course_id === item.course_id;

                      let badge = <span className="badge badge-emerald"><CheckCircle size={12} /> Safe ({pct}%)</span>;
                      if (pct < 75) badge = <span className="badge badge-rose"><AlertTriangle size={12} /> Critical ({pct}%)</span>;
                      else if (pct < 80) badge = <span className="badge badge-amber"><Clock size={12} /> Warning ({pct}%)</span>;

                      return (
                        <div
                          key={item.course_id}
                          onClick={() => setSelectedSimCourse(item)}
                          className="glass-panel"
                          style={{
                            padding: '16px',
                            cursor: 'pointer',
                            border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                {item.course_id}
                              </span>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '2px 0 0 0' }}>{item.course_name}</h4>
                            </div>
                            {badge}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            <span>Classes Attended: <strong>{item.attended_classes} / {item.total_classes}</strong></span>
                            <span>Last updated: {item.last_updated}</span>
                          </div>

                          {/* Progress Bar */}
                          <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                borderRadius: '4px',
                                background: pct >= 75 ? 'var(--gradient-brand)' : 'linear-gradient(90deg, #f43f5e, #f59e0b)'
                              }}
                            />
                          </div>

                          {currentUser.role === 'faculty' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAttCourse(item);
                                setAttForm({ attended: item.attended_classes, total: item.total_classes });
                                setShowAttendanceModal(true);
                              }}
                              className="btn-secondary"
                              style={{ marginTop: '12px', width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '6px' }}
                            >
                              <Edit3 size={14} /> Update Attendance Record
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Simulator & Projection Interactive Tool */}
                  {selectedSimCourse && (
                    <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '8px' }}>
                            <TrendingUp size={20} color="#6366f1" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Attendance Simulator & Projection</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Targeting {selectedSimCourse.course_id} - {selectedSimCourse.course_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Current Status Box */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Status</p>
                          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                            {Math.round((selectedSimCourse.attended_classes / selectedSimCourse.total_classes) * 100)}%
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {selectedSimCourse.attended_classes} of {selectedSimCourse.total_classes} classes
                          </p>
                        </div>

                        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>To Reach 75%</p>
                          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fb7185' }}>
                            {Math.max(0, Math.ceil(3 * selectedSimCourse.total_classes - 4 * selectedSimCourse.attended_classes))} Classes
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Consecutive mandatory attendance
                          </p>
                        </div>
                      </div>

                      {/* Attend Projection */}
                      <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', display: 'block', marginBottom: '8px' }}>
                          📈 Projection: If I attend the next{' '}
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={simAttend}
                            onChange={(e) => setSimAttend(parseInt(e.target.value) || 0)}
                            style={{ width: '50px', padding: '2px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontWeight: 700 }}
                          />{' '}
                          upcoming classes:
                        </label>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Projected Attendance:</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
                            {calcProjectedPct(selectedSimCourse, simAttend, simAttend)}%
                          </span>
                        </div>
                      </div>

                      {/* Miss/Skip Projection */}
                      <div style={{ background: 'rgba(244, 63, 94, 0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fb7185', display: 'block', marginBottom: '8px' }}>
                          📉 Risk Assessment: If I miss/skip the next{' '}
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={simMiss}
                            onChange={(e) => setSimMiss(parseInt(e.target.value) || 0)}
                            style={{ width: '50px', padding: '2px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontWeight: 700 }}
                          />{' '}
                          classes:
                        </label>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Projected Drop:</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb7185' }}>
                            {calcProjectedPct(selectedSimCourse, 0, simMiss)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: EXAMS & VENUES */}
            {activeTab === 'exams' && dashboardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-amber">End-Semester Aug 2026</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Examination Timetable & Venue Schedule</h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Official dates, seating arrangements, and real-time room reallocations.
                    </p>
                  </div>
                  <button
                    onClick={() => alert('📄 Official Hall Pass & Timetable exported as PDF!')}
                    className="btn-primary"
                  >
                    <Download size={16} /> Download Hall Pass PDF
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
                  {dashboardData.exams.map((ex) => (
                    <div
                      key={ex.id}
                      className="glass-panel animate-fade-in"
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        borderLeft: ex.is_updated ? '4px solid var(--accent-amber)' : '4px solid var(--accent-cyan)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                            {ex.course_code}
                          </span>
                          {ex.is_updated === 1 && (
                            <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                              ⚠️ VENUE UPDATED
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>{ex.course_name}</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                            <Calendar size={16} color="var(--accent-cyan)" />
                            <span>Date: <strong style={{ color: 'var(--text-primary)' }}>{ex.exam_date}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                            <Clock size={16} color="var(--accent-indigo)" />
                            <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{ex.exam_time}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-secondary)' }}>
                            <MapPin size={16} color={ex.is_updated ? 'var(--accent-amber)' : 'var(--accent-emerald)'} style={{ marginTop: '2px' }} />
                            <div>
                              <span>Hall / Room: </span>
                              <strong style={{ color: ex.is_updated ? '#fbbf24' : 'var(--text-primary)' }}>{ex.venue_hall}</strong>
                            </div>
                          </div>
                        </div>

                        {ex.update_note && (
                          <div style={{ marginTop: '14px', padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.75rem', color: '#fbbf24' }}>
                            📢 Notice: {ex.update_note}
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Seat Number:</span>
                        <span className="badge badge-emerald">{ex.seat_number}</span>
                      </div>

                      {(currentUser.role === 'faculty' || currentUser.role === 'admin') && (
                        <button
                          onClick={() => {
                            setSelectedExam(ex);
                            setNewVenue(ex.venue_hall);
                            setShowVenueModal(true);
                          }}
                          className="btn-secondary"
                          style={{ marginTop: '12px', width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                        >
                          <Edit3 size={14} /> Update Venue Hall
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CGPA & CALCULATOR */}
            {activeTab === 'cgpa' && dashboardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span className="badge badge-cyan">Academic Transcript</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>CGPA History & Interactive Calculator</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cumulative CGPA</p>
                      <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {dashboardData.overall_cgpa}
                      </h2>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  {/* Semester CGPA History */}
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Semester Grade History</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dashboardData.cgpa_history.map((sem) => (
                        <div key={sem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}>
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{sem.semester}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sem.credits_completed} Credits</p>
                          </div>
                          <span className="badge badge-cyan" style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                            {sem.sgpa} SGPA
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SGPA Calculator */}
                  <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Interactive SGPA Calculator</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Input anticipated course credits and grade points to estimate your SGPA.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {cgpaCourses.map((c, idx) => (
                        <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => {
                              const updated = [...cgpaCourses];
                              updated[idx].name = e.target.value;
                              setCgpaCourses(updated);
                            }}
                            className="input-field"
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                          />
                          <input
                            type="number"
                            placeholder="Cred"
                            value={c.credits}
                            onChange={(e) => {
                              const updated = [...cgpaCourses];
                              updated[idx].credits = parseFloat(e.target.value) || 0;
                              setCgpaCourses(updated);
                            }}
                            className="input-field"
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                          />
                          <input
                            type="number"
                            placeholder="Grade Pts"
                            value={c.gradePoints}
                            onChange={(e) => {
                              const updated = [...cgpaCourses];
                              updated[idx].gradePoints = parseFloat(e.target.value) || 0;
                              setCgpaCourses(updated);
                            }}
                            className="input-field"
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                          />
                        </div>
                      ))}
                    </div>

                    <button onClick={handleCalculateCgpa} className="btn-primary" style={{ marginTop: '8px', justifyContent: 'center' }}>
                      Calculate SGPA
                    </button>

                    {calculatedSgpa && (
                      <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calculated SGPA ({calculatedSgpa.totalCreds} Total Credits)</p>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {calculatedSgpa.sgpa}
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PLACEMENTS */}
            {activeTab === 'placements' && dashboardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span className="badge badge-cyan">Career & Placement Cell</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>Campus Recruitment Drives</h3>
                  </div>
                  <div className="badge badge-emerald">
                    Eligible Drives: {dashboardData.placements.filter((p) => dashboardData.overall_cgpa >= p.min_cgpa).length} Active
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  {dashboardData.placements.map((pl) => {
                    const isEligible = dashboardData.overall_cgpa >= pl.min_cgpa;
                    const hasApplied = dashboardData.my_applications?.some((app) => app.placement_id === pl.id);

                    return (
                      <div key={pl.id} className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{pl.company}</h4>
                            <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>{pl.package_lpa} LPA</span>
                          </div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{pl.role}</p>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '10px 0' }}>{pl.description}</p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <p>📍 Location: <strong style={{ color: 'var(--text-primary)' }}>{pl.location}</strong></p>
                            <p>🎓 Eligible Branches: <strong style={{ color: 'var(--text-primary)' }}>{pl.eligible_branches}</strong></p>
                            <p>📊 Cutoff CGPA: <strong style={{ color: 'var(--text-primary)' }}>{pl.min_cgpa}</strong></p>
                            <p>⏰ Deadline: <strong style={{ color: 'var(--accent-amber)' }}>{pl.deadline}</strong></p>
                          </div>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {isEligible ? (
                            <span className="badge badge-emerald">Eligible</span>
                          ) : (
                            <span className="badge badge-rose">CGPA Cutoff Unmet</span>
                          )}

                          {hasApplied ? (
                            <span className="badge badge-cyan"><CheckCircle size={12} /> Application Submitted</span>
                          ) : (
                            <button
                              disabled={!isEligible}
                              onClick={() => handleApplyPlacement(pl.id)}
                              className="btn-primary"
                              style={{ opacity: isEligible ? 1 : 0.5, cursor: isEligible ? 'pointer' : 'not-allowed' }}
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: HACKATHONS */}
            {activeTab === 'hackathons' && dashboardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span className="badge badge-amber">Innovation Summit</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>National EdTech & Cloud Hackathons</h3>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  {dashboardData.hackathons.map((hk) => (
                    <div key={hk.id} className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="badge badge-amber">{hk.organizer}</span>
                          <span className="badge badge-cyan">{hk.prize_pool}</span>
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '8px 0' }}>{hk.title}</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <p>📅 Event Date: <strong style={{ color: 'var(--text-primary)' }}>{hk.event_date}</strong></p>
                          <p>👥 Max Team Size: <strong style={{ color: 'var(--text-primary)' }}>{hk.max_team_size} Members</strong></p>
                          <p>🏷️ Tags: <strong style={{ color: 'var(--accent-cyan)' }}>{hk.tags}</strong></p>
                          <p>⏰ Registration Deadline: <strong style={{ color: 'var(--accent-amber)' }}>{hk.deadline}</strong></p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedHackathon(hk);
                          setShowHackathonModal(true);
                        }}
                        className="btn-primary"
                        style={{ marginTop: '16px', justifyContent: 'center' }}
                      >
                        Register Team
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: CAMPUS NOTICES */}
            {activeTab === 'announcements' && dashboardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span className="badge badge-rose">Official Notices</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>Campus Broadcast Feed</h3>
                  </div>
                  {(currentUser.role === 'faculty' || currentUser.role === 'admin') && (
                    <button onClick={() => setShowNoticeModal(true)} className="btn-primary">
                      <Plus size={16} /> Publish New Notice
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {dashboardData.announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="glass-panel animate-fade-in"
                      style={{
                        padding: '18px 24px',
                        borderLeft: ann.priority === 'high' ? '4px solid var(--accent-rose)' : '4px solid var(--accent-cyan)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`badge badge-${ann.priority === 'high' ? 'rose' : 'cyan'}`}>
                            {ann.category}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Published by: {ann.author} | {ann.created_at}
                          </span>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{ann.title}</h4>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: INSTITUTIONAL ADMIN ANALYTICS */}
            {activeTab === 'admin' && adminMetrics && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span className="badge badge-rose">Institutional Control Center</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>EduCloud System Intelligence & Metrics</h3>
                  </div>
                  <span className="badge badge-emerald">Region: {adminMetrics.cloud_region}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Users</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '4px 0' }}>{adminMetrics.total_users}</h2>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Students: {adminMetrics.total_students} | Faculty: {adminMetrics.total_faculty}</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Campus Attendance</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '4px 0' }}>{adminMetrics.average_institutional_attendance}%</h2>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Campus-Wide Sync</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Drives</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '4px 0' }}>{adminMetrics.open_placements}</h2>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Open Recruitment Drives</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Status</p>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '8px 0' }}>{adminMetrics.server_uptime}</h2>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Active Node Server</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL 1: VENUE SHIFT MODAL */}
      {showVenueModal && selectedExam && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '24px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Shift Exam Venue ({selectedExam.course_code})</h3>
              <button onClick={() => setShowVenueModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateVenue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>New Hall / Room Venue:</label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Hall 402 -> Computer Lab 4"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Update Reason / Note:</label>
                <input
                  type="text"
                  value={venueNote}
                  onChange={(e) => setVenueNote(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Venue moved due to Lab Maintenance"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowVenueModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Broadcast Venue Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ATTENDANCE RECORD MODAL */}
      {showAttendanceModal && selectedAttCourse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '24px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Update Student Attendance</h3>
              <button onClick={() => setShowAttendanceModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Updating records for <strong>{selectedAttCourse.course_name}</strong> ({selectedAttCourse.course_id})
              </p>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Classes Attended:</label>
                <input
                  type="number"
                  required
                  value={attForm.attended}
                  onChange={(e) => setAttForm({ ...attForm, attended: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Conducted Classes:</label>
                <input
                  type="number"
                  required
                  value={attForm.total}
                  onChange={(e) => setAttForm({ ...attForm, total: e.target.value })}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAttendanceModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PUBLISH NOTICE MODAL */}
      {showNoticeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Publish Campus Notice</h3>
              <button onClick={() => setShowNoticeModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePublishNotice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Notice Title:</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Schedule for Mid-Term Project Evaluation"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Category:</label>
                <select
                  value={noticeForm.category}
                  onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                  className="input-field"
                >
                  <option value="academic">Academic</option>
                  <option value="examination">Examination</option>
                  <option value="urgent">Urgent Announcement</option>
                  <option value="placement">Placements</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Notice Content:</label>
                <textarea
                  required
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="input-field"
                  placeholder="Detailed announcement description..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowNoticeModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Send size={14} /> Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REGISTER HACKATHON MODAL */}
      {showHackathonModal && selectedHackathon && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '24px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Register for {selectedHackathon.title}</h3>
              <button onClick={() => setShowHackathonModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegisterHackathon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Team Name:</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Cloud Innovators"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowHackathonModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Complete Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '16px 24px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        EduCloud Academic Intelligence Platform &copy; 2026 | Built for Higher Educational Cloud Infrastructure
      </footer>
    </div>
  );
}
