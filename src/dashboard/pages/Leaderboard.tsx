import React, { useState, useEffect } from 'react';
import { Trophy, ChevronUp, ChevronDown, Minus, Medal } from 'lucide-react';

interface LeaderboardProps {
    userName?: string;
}

interface Student {
    rank: number;
    name: string;
    email: string;
    solved: number;
    hintsUsed: number;
    testScore: number;
    totalScore: number;
    trend: 'up' | 'down' | 'same';
    avatar: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userName = 'Guest Student' }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [filter, setFilter] = useState<'all' | 'tests' | 'problems'>('all');

    useEffect(() => {
        // Build leaderboard from real chrome.storage data
        chrome.storage.local.get(['userProgress', 'testSubmissions', 'userName', 'userEmail'], (result) => {
            const progress = result.userProgress || {};
            const testSubs = result.testSubmissions || {};

            // Real user stats
            let solved = 0;
            let hintsUsed = 0;
            Object.values(progress).forEach((p: any) => {
                if (p.solved) solved++;
                if (p.hintsUsed) hintsUsed += p.hintsUsed.length;
            });

            let testScore = 0;
            Object.values(testSubs).forEach((s: any) => {
                testScore += s.score || 0;
            });

            const realUser: Student = {
                rank: 1,
                name: result.userName || userName,
                email: result.userEmail || '',
                solved,
                hintsUsed,
                testScore,
                totalScore: solved * 100 + testScore * 10,
                trend: 'up',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.userName || userName}`
            };

            // Seed demo classmates to fill leaderboard
            const demoStudents: Student[] = [
                { rank: 2, name: 'Alice Chen', email: 'alice@college.edu', solved: Math.max(0, solved - 2), hintsUsed: 5, testScore: 45, totalScore: Math.max(0, solved - 2) * 100 + 450, trend: 'same', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
                { rank: 3, name: 'David Miller', email: 'david@college.edu', solved: Math.max(0, solved - 4), hintsUsed: 8, testScore: 40, totalScore: Math.max(0, solved - 4) * 100 + 400, trend: 'down', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
                { rank: 4, name: 'Sarah Jenkins', email: 'sarah@college.edu', solved: Math.max(0, solved - 5), hintsUsed: 12, testScore: 35, totalScore: Math.max(0, solved - 5) * 100 + 350, trend: 'up', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                { rank: 5, name: 'Michael Chang', email: 'michael@college.edu', solved: Math.max(0, solved - 7), hintsUsed: 15, testScore: 28, totalScore: Math.max(0, solved - 7) * 100 + 280, trend: 'down', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
            ];

            // Merge real user + demo, sort by totalScore
            const all = [realUser, ...demoStudents].sort((a, b) => b.totalScore - a.totalScore).map((s, i) => ({ ...s, rank: i + 1 }));
            setStudents(all);
        });
    }, []);

    const topThree = students.slice(0, 3);
    // Re-order podium: 2nd | 1st | 3rd
    const podiumOrder = topThree.length === 3
        ? [topThree[1], topThree[0], topThree[2]]
        : topThree;
    const rest = students.slice(3);

    const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
        if (trend === 'up') return <ChevronUp style={{ width: 14, height: 14, color: '#16A34A' }} />;
        if (trend === 'down') return <ChevronDown style={{ width: 14, height: 14, color: '#DC2626' }} />;
        return <Minus style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />;
    };

    const medalColor = (rank: number) => {
        if (rank === 1) return '#F59E0B';
        if (rank === 2) return '#94A3B8';
        if (rank === 3) return '#D97706';
        return 'var(--text-muted)';
    };

    const podiumHeight = (rank: number) => rank === 1 ? 320 : rank === 2 ? 280 : 260;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>Class Leaderboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        Rankings based on problems solved + test scores. Updated in real time.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {(['all', 'problems', 'tests'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{
                                padding: '7px 16px', borderRadius: 8, border: '1.5px solid var(--border)', cursor: 'pointer',
                                fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
                                background: filter === f ? 'var(--primary)' : 'var(--surface)',
                                color: filter === f ? 'white' : 'var(--text-muted)',
                                boxShadow: filter === f ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                            }}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Podium */}
            {podiumOrder.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'flex-end', marginBottom: 32 }}>
                    {podiumOrder.map((user) => (
                        <div key={user.name} className="premium-card"
                            style={{
                                textAlign: 'center', minHeight: podiumHeight(user.rank),
                                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                border: user.rank === 1 ? '2px solid var(--primary)' : '1px solid var(--border)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                            {user.rank === 1 && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366F1, #818CF8)' }} />
                            )}
                            <Medal style={{ width: 28, height: 28, color: medalColor(user.rank), margin: '0 auto 12px' }} />
                            <img src={user.avatar} alt="" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px', border: `3px solid ${medalColor(user.rank)}` }} />
                            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{user.name}</h3>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--primary-light)', padding: '6px 16px', borderRadius: 999, margin: '8px auto 0' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: 18 }}>{user.totalScore}</span>
                                <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>pts</span>
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                                <span>✅ {user.solved} solved</span>
                                <span>🏆 {user.testScore} test pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            {rest.length > 0 && (
                <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Student</th>
                                <th style={{ textAlign: 'center' }}>Solved</th>
                                <th style={{ textAlign: 'center' }}>Hints Used</th>
                                <th style={{ textAlign: 'center' }}>Test Score</th>
                                <th style={{ textAlign: 'right' }}>Total Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rest.map((user) => (
                                <tr key={user.rank} style={{ background: user.name === userName ? 'var(--primary-light)' : undefined }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                                            <span style={{ color: medalColor(user.rank), fontSize: 15 }}>#{user.rank}</span>
                                            <TrendIcon trend={user.trend} />
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <img src={user.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</p>
                                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}><span className="badge badge-primary">{user.solved}</span></td>
                                    <td style={{ textAlign: 'center' }}><span className="badge badge-muted">{user.hintsUsed}</span></td>
                                    <td style={{ textAlign: 'center' }}><span className="badge badge-success">{user.testScore}</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: 16 }}>{user.totalScore}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>pts</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {students.length === 0 && (
                <div className="premium-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <Trophy style={{ width: 48, height: 48, color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.4 }} />
                    <h3 style={{ fontSize: 18, marginBottom: 8 }}>No Data Yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Solve some LeetCode problems to appear on the leaderboard!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
