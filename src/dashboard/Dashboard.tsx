import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Portfolio from './pages/Portfolio';
import Assignments from './pages/Assignments';
import Leaderboard from './pages/Leaderboard';
import AdminConsole from './pages/AdminConsole';
import ClassTests from './pages/ClassTests';
import Courses from './pages/Courses';
import ClassResources from './pages/ClassResources';
import Auth from './pages/Auth';
import './styles/dashboard.css';

const Dashboard: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        chrome.storage.local.get(['isLoggedIn', 'userRole', 'userName', 'userEmail'], (result) => {
            if (result.isLoggedIn) {
                setIsLoggedIn(true);
                setUserRole(result.userRole || 'student');
                setUserName(result.userName || 'User');
                setUserEmail(result.userEmail || '');
            }
        });

        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings?.theme === 'dark') {
                document.documentElement.classList.add('dark');
            }
        });
    }, []);

    const handleLogin = (role: 'student' | 'teacher', name: string, email: string) => {
        setIsLoggedIn(true);
        setUserRole(role);
        setUserName(name);
        setUserEmail(email);
        chrome.storage.local.set({
            isLoggedIn: true,
            userRole: role,
            userName: name,
            userEmail: email
        });
        setActiveTab('home');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName('');
        setUserEmail('');
        chrome.storage.local.remove(['isLoggedIn', 'userRole', 'userName', 'userEmail']);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
            case 'portfolio':
                return <Portfolio userName={userName} userEmail={userEmail} userRole={userRole} />;
            case 'courses':
                return <Courses userRole={userRole} userName={userName} userEmail={userEmail} />;
            case 'assignments':
                return <Assignments userRole={userRole} userName={userName} />;
            case 'resources':
                return <ClassResources userEmail={userEmail} />;
            case 'tests':
                return <ClassTests userRole={userRole} userName={userName} userEmail={userEmail} />;
            case 'leaderboard':
                return <Leaderboard userName={userName} />;
            case 'admin':
                return userRole === 'teacher' ? <AdminConsole /> : <Portfolio userName={userName} userEmail={userEmail} userRole={userRole} />;
            default:
                return <Portfolio userName={userName} userEmail={userEmail} userRole={userRole} />;
        }
    };

    if (!isLoggedIn) {
        return <Auth onLogin={handleLogin} />;
    }

    return (
        <div className="flex bg-background min-h-screen text-text-main transition-colors duration-500">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole={userRole}
                userName={userName}
                onLogout={handleLogout}
            />
            <main className="main-content flex-1">
                <Navbar userName={userName} userRole={userRole} />
                <div className="py-6">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
