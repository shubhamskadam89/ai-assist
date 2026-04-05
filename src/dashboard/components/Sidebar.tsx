import React from 'react';
import {
    Home,
    User,
    Layout,
    BookOpen,
    Shield,
    Trophy,
    LogOut,
    ChevronRight,
    ClipboardList,
    Library,
    GraduationCap
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    userRole: 'student' | 'teacher';
    userName: string;
    onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, userName, onLogout }) => {
    const initials = userName
        ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    const studentMenu = [
        { id: 'portfolio', label: 'My Portfolio', icon: User, section: 'PROFILE' },
        { id: 'courses', label: 'My Courses', icon: Library, section: 'LEARNING' },
        { id: 'assignments', label: 'Assignments', icon: Layout, section: 'LEARNING' },
        { id: 'resources', label: 'Class Resources', icon: BookOpen, section: 'LEARNING' },
        { id: 'tests', label: 'Class Tests', icon: ClipboardList, section: 'EXAMS' },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, section: 'CLASS' },
    ];

    const teacherMenu = [
        { id: 'portfolio', label: 'My Portfolio', icon: User, section: 'PROFILE' },
        { id: 'courses', label: 'Manage Courses', icon: Library, section: 'TEACHING' },
        { id: 'assignments', label: 'Assignments', icon: Layout, section: 'TEACHING' },
        { id: 'tests', label: 'Class Tests', icon: ClipboardList, section: 'TEACHING' },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, section: 'CLASS' },
        { id: 'admin', label: 'Admin Console', icon: Shield, section: 'MANAGEMENT' },
    ];

    const menuItems = userRole === 'teacher' ? teacherMenu : studentMenu;
    const sections = Array.from(new Set(menuItems.map(item => item.section)));

    return (
        <div className="sidebar">
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 10px', marginBottom: 28 }}>
                <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap style={{ width: 18, height: 18, color: 'white' }} />
                </div>
                <div>
                    <h1 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>CodeMentor</h1>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>LMS Platform</p>
                </div>
            </div>

            {/* Nav */}
            <div style={{ flex: 1, overflow: 'hidden auto' }} className="no-scrollbar">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                >
                    <Home style={{ width: 16, height: 16, flexShrink: 0 }} />
                    Home
                    {activeTab === 'home' && <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto' }} />}
                </button>

                {sections.map(section => (
                    <div key={section}>
                        <p className="nav-section-label">{section}</p>
                        {menuItems
                            .filter(item => item.section === section)
                            .map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                                >
                                    <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                                    {item.label}
                                    {activeTab === item.id && <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto' }} />}
                                </button>
                            ))}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, marginBottom: 4 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: userRole === 'teacher' ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : 'linear-gradient(135deg,#6366F1,#818CF8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0
                    }}>
                        {initials}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName || 'User'}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {userRole}
                        </p>
                    </div>
                </div>

                <button onClick={onLogout} className="nav-link" style={{ color: '#EF4444' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
