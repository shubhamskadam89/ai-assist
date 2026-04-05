import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Code2, User, BookOpen, Eye, EyeOff, AlertCircle, Loader, GraduationCap } from 'lucide-react';

interface AuthProps {
    onLogin: (role: 'student' | 'teacher', name: string, email: string, token?: string) => void;
}

const BACKEND_URL = 'http://localhost:8080';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
);

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [classCode, setClassCode] = useState('');
    const [institution, setInstitution] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin
                ? { email, password }
                : { name, email, password, role: role.toUpperCase(), classCode, institution };

            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();

            if (!res.ok || !json.data) {
                throw new Error(json.message || 'Authentication failed. Check your credentials.');
            }

            const { token, name: uName, email: uEmail, role: uRole } = json.data;
            const normalizedRole = uRole?.toLowerCase() === 'teacher' ? 'teacher' : 'student';
            onLogin(normalizedRole, uName, uEmail, token);

        } catch (err: any) {
            if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
                setError('⚠️ Backend offline — using demo mode. Real auth requires the Spring Boot backend.');
                setTimeout(() => {
                    onLogin(role, isLogin ? 'Demo User' : name || 'Demo User', email || 'demo@college.edu');
                }, 1500);
            } else {
                setError(err.message || 'Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');
        // In a Chrome extension context, we use chrome.identity for OAuth
        try {
            if (typeof chrome !== 'undefined' && chrome.identity) {
                chrome.identity.getAuthToken({ interactive: true }, async (token) => {
                    if (chrome.runtime.lastError || !token) {
                        // Fallback: demo Google login
                        const demoName = role === 'teacher' ? 'Teacher (Google)' : 'Student (Google)';
                        onLogin(role, demoName, `google.${role}@gmail.com`);
                        setGoogleLoading(false);
                        return;
                    }
                    // Use Google token to get user info
                    try {
                        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${token}` }
                        }).then(r => r.json());

                        // Register/login via backend with Google token
                        const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                googleToken: token,
                                name: userInfo.name,
                                email: userInfo.email,
                                role: role.toUpperCase()
                            })
                        }).catch(() => null);

                        if (res && res.ok) {
                            const json = await res.json();
                            if (json.data) {
                                const { token: jwtToken, name: uName, email: uEmail, role: uRole } = json.data;
                                onLogin(uRole?.toLowerCase() === 'teacher' ? 'teacher' : 'student', uName, uEmail, jwtToken);
                                return;
                            }
                        }
                        // Fallback with Google info
                        onLogin(role, userInfo.name || 'Google User', userInfo.email);
                    } catch {
                        onLogin(role, 'Google User', 'google@gmail.com');
                    } finally {
                        setGoogleLoading(false);
                    }
                });
            } else {
                // Web / non-extension fallback
                setTimeout(() => {
                    onLogin(role, `Demo ${role === 'teacher' ? 'Teacher' : 'Student'} (Google)`, `google.${role}@demo.edu`);
                    setGoogleLoading(false);
                }, 1200);
            }
        } catch {
            setGoogleLoading(false);
            setError('Google sign-in failed. Please try again.');
        }
    };

    const features = [
        { icon: Code2, label: 'AI-Powered Hints', desc: 'Socratic hints tailored to your level while coding' },
        { icon: BookOpen, label: 'Course Management', desc: 'Teachers create courses, publish content and tests' },
        { icon: GraduationCap, label: 'Progress Analytics', desc: 'Real-time leaderboard, test scores and tracking' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
            {/* ── Left Panel ── */}
            <div style={{
                width: '48%', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
                padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden'
            }} className="hidden-mobile">
                <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(129,140,248,0.15)', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', top: '40%', left: '60%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(167,139,250,0.1)', filter: 'blur(40px)' }} />

                {/* Logo */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
                        <div style={{ width: 44, height: 44, background: '#6366F1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.5)' }}>
                            <Code2 style={{ width: 22, height: 22, color: 'white' }} />
                        </div>
                        <span style={{ color: 'white', fontSize: 20, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>CodeMentor LMS</span>
                    </div>

                    <h2 style={{ color: 'white', fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>
                        Your Campus<br /><span style={{ color: '#818CF8' }}>Learning Hub.</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 1.7, maxWidth: 380 }}>
                        A fully integrated LMS for colleges — AI hints, live courses, tests, and leaderboards. All private, all real-time.
                    </p>
                </div>

                {/* Feature list */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {features.map(({ icon: Icon, label, desc }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.10)' }}>
                            <div style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon style={{ width: 18, height: 18, color: '#A5B4FC' }} />
                            </div>
                            <div>
                                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{label}</p>
                                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--background, #F1F5F9)', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: 440 }}>
                    {/* Role Toggle */}
                    <div style={{ display: 'flex', background: 'var(--surface, white)', border: '1px solid var(--border, #E2E8F0)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
                        {(['student', 'teacher'] as const).map(r => (
                            <button key={r} onClick={() => setRole(r)}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                                    background: role === r ? 'var(--primary, #6366F1)' : 'transparent',
                                    color: role === r ? 'white' : 'var(--text-muted, #64748B)',
                                    boxShadow: role === r ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                                }}>
                                {r === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'}
                            </button>
                        ))}
                    </div>

                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 30, fontWeight: 900, marginBottom: 6, color: 'var(--text-main, #0F172A)' }}>
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </h2>
                    <p style={{ color: 'var(--text-muted, #64748B)', marginBottom: 28, fontSize: 14 }}>
                        {isLogin ? `Sign in as ${role} to access your dashboard.` : `Register as a ${role} to get started.`}
                    </p>

                    {/* Google Sign In */}
                    <button className="btn-google" onClick={handleGoogleLogin} disabled={googleLoading} style={{ marginBottom: 20 }}>
                        {googleLoading ? (
                            <Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                        ) : <GoogleIcon />}
                        {googleLoading ? 'Connecting to Google...' : `Continue with Google as ${role}`}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border, #E2E8F0)' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border, #E2E8F0)' }} />
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFF3CD', border: '1px solid #FBBF24', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                            <AlertCircle style={{ width: 16, height: 16, color: '#D97706', marginTop: 1, flexShrink: 0 }} />
                            <p style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {!isLogin && (
                            <div>
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted, #64748B)' }} />
                                    <input className="form-input" style={{ paddingLeft: 40 }}
                                        value={name} onChange={e => setName(e.target.value)}
                                        placeholder="John Doe" required={!isLogin} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted, #64748B)' }} />
                                <input className="form-input" style={{ paddingLeft: 40 }} type="email"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@college.edu" required />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted, #64748B)' }} />
                                <input className="form-input" style={{ paddingLeft: 40, paddingRight: 44 }}
                                    type={showPass ? 'text' : 'password'}
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #64748B)', padding: 0 }}>
                                    {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <label className="form-label">
                                        {role === 'teacher' ? 'Department / Subject' : 'Class Code'}
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}> (e.g. CS401)</span>
                                    </label>
                                    <input className="form-input" value={classCode} onChange={e => setClassCode(e.target.value)} placeholder={role === 'teacher' ? 'Computer Science' : 'CS401'} />
                                </div>
                                <div>
                                    <label className="form-label">Institution <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                                    <input className="form-input" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="MIT Academy of Engineering" />
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: 15, marginTop: 4, borderRadius: 12 }}
                            disabled={loading}>
                            {loading ? (
                                <><Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> {isLogin ? 'Signing in...' : 'Creating account...'}</>
                            ) : (
                                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight style={{ width: 16, height: 16 }} /></>
                            )}
                        </button>
                    </form>

                    <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-muted, #64748B)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary, #6366F1)', fontWeight: 700, fontSize: 14 }}>
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
            `}</style>
        </div>
    );
};

export default Auth;
