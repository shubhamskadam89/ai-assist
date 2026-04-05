import React, { useState, useEffect } from 'react';

import {
    Github,
    Linkedin,
    Twitter,
    Globe,
    MapPin,
    School,
    CheckCircle2,
    TrendingUp,
    Brain,
    Code2,
    Trophy,
    Target,
    Flame
} from 'lucide-react';

interface PortfolioProps {
    userName?: string;
    userEmail?: string;
    userRole?: 'student' | 'teacher';
}

const Portfolio: React.FC<PortfolioProps> = ({ userName = 'Guest', userEmail = '', userRole = 'student' }) => {
    const [solvedCount, setSolvedCount] = useState<number>(0);
    const [totalAttempts, setTotalAttempts] = useState<number>(0);
    const [testsTaken, setTestsTaken] = useState<number>(0);
    const [avgTestScore, setAvgTestScore] = useState<number>(0);

    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['userProgress', 'testSubmissionsV2'], (res) => {
                const progress = res.userProgress || {};
                let solved = 0;
                let attempts = 0;
                Object.values(progress).forEach((p: any) => {
                    if (p.solved) solved++;
                    if (p.attempts) attempts += p.attempts;
                });
                setSolvedCount(solved);
                setTotalAttempts(attempts);

                const subs = (res.testSubmissionsV2 || []).filter((s: any) => s.studentEmail === userEmail);
                setTestsTaken(subs.length);
                if (subs.length > 0) {
                    const avg = subs.reduce((acc: number, s: any) => {
                        const pct = s.totalPoints > 0 ? (s.score / s.totalPoints) * 100 : 0;
                        return acc + pct;
                    }, 0) / subs.length;
                    setAvgTestScore(Math.round(avg));
                }
            });
        }
    }, [userEmail]);

    const stats = [
        { label: 'Problems Solved', value: solvedCount.toString(), icon: Code2, color: '#6366F1', bg: '#EEF2FF' },
        { label: 'Total Attempts', value: totalAttempts.toString(), icon: TrendingUp, color: '#10B981', bg: '#ECFDF5' },
        { label: 'Tests Taken', value: testsTaken.toString(), icon: CheckCircle2, color: '#8B5CF6', bg: '#F5F3FF' },
        { label: 'Avg Test Score', value: testsTaken > 0 ? `${avgTestScore}%` : '—', icon: Brain, color: '#F59E0B', bg: '#FFFBEB' },
    ];

    const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, marginBottom: 6 }}>
                    {userRole === 'teacher' ? 'Teacher Portfolio' : 'My Portfolio'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    {userRole === 'teacher'
                        ? 'Your teaching profile and activity dashboard.'
                        : 'Your coding journey — synced from LeetCode, HackerRank, and class tests.'}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
                {/* Profile Card */}
                <div>
                    <div className="premium-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }} />
                        <div style={{ position: 'relative', paddingTop: 36 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: userRole === 'teacher' ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 12px', border: '4px solid white',
                                fontSize: 24, fontWeight: 900, color: 'white',
                                boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
                            }}>
                                {initials}
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{userName}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>@{userName.toLowerCase().replace(/\s/g, '.')}</p>
                            <span className={`badge ${userRole === 'teacher' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: 11, marginBottom: 20 }}>
                                {userRole === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                            </span>

                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 20, fontSize: 13 }}>
                                Download Profile Card
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                                {[Github, Linkedin, Twitter, Globe].map((Icon, i) => (
                                    <button key={i} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--background)'; }}>
                                        <Icon style={{ width: 15, height: 15, color: 'var(--text-muted)' }} />
                                    </button>
                                ))}
                            </div>

                            <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                                    <MapPin style={{ width: 14, height: 14 }} /> India
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                                    <School style={{ width: 14, height: 14 }} /> MIT Academy of Engineering
                                </div>
                            </div>

                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'left' }}>
                                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Platform Links</p>
                                {['LeetCode', 'GeeksForGeeks', 'HackerRank'].map(site => (
                                    <div key={site} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{site}</span>
                                        <CheckCircle2 style={{ width: 16, height: 16, color: '#10B981' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-card">
                                <div className="stat-icon" style={{ background: stat.bg, width: 44, height: 44, borderRadius: 11 }}>
                                    <stat.icon style={{ width: 20, height: 20, color: stat.color }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{stat.label}</p>
                                    <p style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* DSA */}
                        <div className="premium-card">
                            <h3 style={{ fontSize: 16, marginBottom: 20 }}>Data Structures & Algo</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                                    <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                        <circle cx="60" cy="60" r="52" stroke="var(--border)" strokeWidth="12" fill="transparent" />
                                        <circle cx="60" cy="60" r="52" stroke="var(--primary)" strokeWidth="12" fill="transparent"
                                            strokeDasharray="326.7"
                                            strokeDashoffset={326.7 * (1 - Math.min((solvedCount * 0.75) / Math.max(solvedCount, 1), 1))}
                                            strokeLinecap="round" />
                                    </svg>
                                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900 }}>
                                        {Math.floor(solvedCount * 0.65)}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    {[
                                        { label: 'Arrays', val: Math.floor(solvedCount * 0.35), color: '#6366F1' },
                                        { label: 'Trees', val: Math.floor(solvedCount * 0.20), color: '#10B981' },
                                        { label: 'Graphs', val: Math.floor(solvedCount * 0.10), color: '#3B82F6' },
                                    ].map(s => (
                                        <div key={s.label} style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</span>
                                                <span style={{ fontSize: 12, fontWeight: 800 }}>{s.val}</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div style={{ height: '100%', borderRadius: 999, background: s.color, width: `${solvedCount > 0 ? (s.val / solvedCount) * 100 : 0}%`, transition: 'width 0.8s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Streak / Activity */}
                        <div className="premium-card">
                            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Coding Activity</h3>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: 'var(--primary-light)', borderRadius: 12 }}>
                                    <Flame style={{ width: 20, height: 20, color: 'var(--primary)', margin: '0 auto 4px' }} />
                                    <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', fontFamily: 'Outfit' }}>5</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Day Streak</p>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: '#ECFDF5', borderRadius: 12 }}>
                                    <Target style={{ width: 20, height: 20, color: '#10B981', margin: '0 auto 4px' }} />
                                    <p style={{ fontSize: 22, fontWeight: 900, color: '#10B981', fontFamily: 'Outfit' }}>{solvedCount}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Solved</p>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: '#FEF3C7', borderRadius: 12 }}>
                                    <Trophy style={{ width: 20, height: 20, color: '#F59E0B', margin: '0 auto 4px' }} />
                                    <p style={{ fontSize: 22, fontWeight: 900, color: '#F59E0B', fontFamily: 'Outfit' }}>14</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Best Streak</p>
                                </div>
                            </div>
                            <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                                    {solvedCount > 0 ? `🎉 Keep going! You've solved ${solvedCount} problems.` : 'Start solving problems on LeetCode to track your progress here.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Heatmap */}
                    <div className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 16 }}>Activity Heatmap</h3>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                                <span>{solvedCount} Submissions</span>
                                <span>Streak: 5 days</span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(26, minmax(0,1fr))' }}>
                            {Array.from({ length: 104 }).map((_, i) => {
                                const intensity = solvedCount === 0 ? 0 : i % 7 === 0 ? 4 : i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0;
                                const colors = ['var(--border)', '#BBF7D0', '#6EE7B7', '#34D399', '#10B981'];
                                return (
                                    <div key={i} title={`${intensity > 0 ? intensity + ' submission' + (intensity > 1 ? 's' : '') : 'No activity'}`}
                                        style={{ aspectRatio: '1', borderRadius: 2, background: colors[intensity], transition: 'background 0.2s', cursor: 'default' }} />
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Less</span>
                            {['var(--border)', '#BBF7D0', '#6EE7B7', '#34D399', '#10B981'].map((c, i) => (
                                <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
                            ))}
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>More</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
