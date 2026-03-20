import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import TeacherDashboard from './TeacherDashboard';
import { AuthScreens } from './components/AuthScreens';

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'student' | 'teacher' }) {
    const handle = localStorage.getItem('codementor_handle');
    const role = localStorage.getItem('user_role');
    if (!handle || !role) {
        return (
            <AuthScreens
                onLoginSuccess={(h: string, r: string) => {
                    localStorage.setItem('codementor_handle', h);
                    localStorage.setItem('user_role', r);
                    window.location.reload();
                }}
            />
        );
    }
    if (role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        return <Navigate to={role === 'teacher' ? '/teacher' : '/student'} replace />;
    }
    return <>{children}</>;
}

export default function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/student" replace />} />
                <Route
                    path="/student/*"
                    element={
                        <PrivateRoute requiredRole="student">
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/teacher/*"
                    element={
                        <PrivateRoute requiredRole="teacher">
                            <TeacherDashboard />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </HashRouter>
    );
}
