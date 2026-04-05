import React from 'react';
import { Search, Bell, Sun, Moon, User as UserIcon, Trophy } from 'lucide-react';

interface NavbarProps {
    userName?: string;
    userRole?: 'student' | 'teacher';
}

const Navbar: React.FC<NavbarProps> = ({ userName = 'Guest', userRole = 'student' }) => {
    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };

    const isDark = document.documentElement.classList.contains('dark');

    return (
        <nav className="navbar">
            {/* Search */}
            <div style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search assignments, students, tests..."
                    className="form-input"
                    style={{ paddingLeft: 40, paddingRight: 16, fontSize: 13 }}
                />
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Rank badge */}
                <div style={{
                    background: 'var(--primary-light)', border: '1px solid var(--border)', borderRadius: 999,
                    padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6
                }}>
                    <Trophy style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>Class Rank #1</span>
                </div>

                {/* Theme toggle */}
                <button className="btn-ghost" onClick={toggleTheme} style={{ padding: '8px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                    {isDark
                        ? <Sun style={{ width: 16, height: 16 }} />
                        : <Moon style={{ width: 16, height: 16 }} />}
                </button>

                {/* Notifications */}
                <button className="btn-ghost" style={{ padding: '8px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', position: 'relative' }}>
                    <Bell style={{ width: 16, height: 16 }} />
                    <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: 'var(--danger)', borderRadius: '50%', border: '1.5px solid var(--surface)' }} />
                </button>

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{userName}</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{userRole}</p>
                    </div>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, background: 'var(--primary-light)',
                        border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer'
                    }}>
                        <UserIcon style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
