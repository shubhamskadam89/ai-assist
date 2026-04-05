import React, { useState, useEffect } from 'react';
import {
    FileText, BarChart2, Bell, Plus, Clock, CheckCircle,
    XCircle, ChevronRight, Eye, Lightbulb, Code2, X
} from 'lucide-react';

interface TestEntry {
    id: string;
    title: string;
    questions: any[];
    createdAt: number;
    deadline: string;
    status: 'active' | 'closed';
}

interface Submission {
    testId: string;
    score: number;
    totalPoints: number;
    submittedAt: number;
}

const AdminConsole: React.FC = () => {
    const [tests, setTests] = useState<TestEntry[]>([]);
    const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
    const [progress, setProgress] = useState<Record<string, any>>({});
    const [hintHistory, setHintHistory] = useState<any[]>([]);
    const [activeView, setActiveView] = useState<'overview' | 'test-detail'>('overview');
    const [selectedTest, setSelectedTest] = useState<TestEntry | null>(null);

    useEffect(() => {
        chrome.storage.local.get(['classTests', 'testSubmissions', 'userProgress', 'hintHistory'], (r) => {
            if (r.classTests) setTests(r.classTests);
            if (r.testSubmissions) setSubmissions(r.testSubmissions);
            if (r.userProgress) setProgress(r.userProgress);
            if (r.hintHistory) setHintHistory(r.hintHistory);
        });
    }, []);

    // Aggregate stats from real data
    const totalProblems = Object.keys(progress).length;
    const totalSolved = Object.values(progress).filter((p: any) => p.solved).length;
    const totalHints = hintHistory.length;
    const avgTestScore = Object.values(submissions).length > 0
        ? Math.round(Object.values(submissions).reduce((s, sub) => s + (sub.score || 0), 0) / Object.values(submissions).length)
        : 0;

    const statCards = [
        { label: 'Problems Attempted', value: totalProblems.toString(), icon: Code2, color: '#6366F1', bg: '#EEF2FF', sub: `${totalSolved} solved` },
        { label: 'Tests Published', value: tests.length.toString(), icon: FileText, color: '#10B981', bg: '#ECFDF5', sub: `${Object.keys(submissions).length} submitted` },
        { label: 'Hints Requested', value: totalHints.toString(), icon: Lightbulb, color: '#F59E0B', bg: '#FFFBEB', sub: 'Across all sessions' },
        { label: 'Avg Test Score', value: avgTestScore > 0 ? `${avgTestScore}` : '—', icon: BarChart2, color: '#EF4444', bg: '#FEF2F2', sub: 'Points per test' },
    ];

    // ─── Test Detail ───
    if (activeView === 'test-detail' && selectedTest) {
        const sub = submissions[selectedTest.id];
        const totalPts = selectedTest.questions.reduce((s: number, q: any) => s + q.points, 0);
        return (
            <div className="animate-fade-in">
                <button onClick={() => { setActiveView('overview'); setSelectedTest(null); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24 }}>
                    <X style={{ width: 16, height: 16 }} /> Back to Console
                </button>

                <div className="premium-card" style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, marginBottom: 4 }}>{selectedTest.title}</h2>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <span className="badge badge-primary">{selectedTest.questions.length} Questions</span>
                        <span className="badge badge-muted">{totalPts} pts total</span>
                        {selectedTest.deadline && <span className="badge badge-warning"><Clock style={{ width: 10, height: 10 }} />{selectedTest.deadline}</span>}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div className="premium-card" style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Submissions</p>
                        <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--primary)' }}>{sub ? 1 : 0}</div>
                    </div>
                    <div className="premium-card" style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Avg Score</p>
                        <div style={{ fontSize: 40, fontWeight: 900, color: '#10B981' }}>{sub ? sub.score : '—'}</div>
                    </div>
                </div>

                {sub ? (
                    <div className="premium-card">
                        <h3 style={{ marginBottom: 16 }}>Student Submissions</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th style={{ textAlign: 'center' }}>Score</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'right' }}>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 600 }}>You (Demo)</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{sub.score}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/{totalPts}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {sub.score >= totalPts * 0.7
                                            ? <span className="badge badge-success"><CheckCircle style={{ width: 10, height: 10 }} />Passed</span>
                                            : <span className="badge badge-danger"><XCircle style={{ width: 10, height: 10 }} />Needs Work</span>}
                                    </td>
                                    <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
                                        {new Date(sub.submittedAt).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="premium-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                        <Bell style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ color: 'var(--text-muted)' }}>No submissions yet. Share this test with your students.</p>
                    </div>
                )}
            </div>
        );
    }

    // ─── Overview ───
    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>Admin Console</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Teacher dashboard — real-time class analytics and test management.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {statCards.map((card) => (
                    <div className="stat-card" key={card.label}>
                        <div className="stat-icon" style={{ background: card.bg }}>
                            <card.icon style={{ width: 22, height: 22, color: card.color }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{card.label}</p>
                            <p style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-main)', lineHeight: 1 }}>{card.value}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
                {/* Tests column */}
                <div>
                    <div className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 17 }}>Published Tests</h3>
                            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}
                                onClick={() => { /* redirect to Class Tests tab */ }}>
                                <Plus style={{ width: 14, height: 14 }} /> New Test
                            </button>
                        </div>

                        {tests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <FileText style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
                                <p>No tests yet. Go to <strong>Class Tests</strong> to create one.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {tests.map((test) => {
                                    const sub = submissions[test.id];
                                    const totalPts = test.questions.reduce((s: number, q: any) => s + q.points, 0);
                                    return (
                                        <div key={test.id}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', background: 'var(--background)' }}
                                            onClick={() => { setSelectedTest(test); setActiveView('test-detail'); }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileText style={{ width: 20, height: 20, color: '#6366F1' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{test.title}</p>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <span className="badge badge-muted">{test.questions.length} Qs</span>
                                                        <span className="badge badge-muted">{totalPts} pts</span>
                                                        {sub ? <span className="badge badge-success"><CheckCircle style={{ width: 10, height: 10 }} />Submitted</span>
                                                            : <span className="badge badge-warning"><Clock style={{ width: 10, height: 10 }} />Pending</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Eye style={{ width: 15, height: 15, color: 'var(--text-muted)' }} />
                                                <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Problems progress */}
                    <div className="premium-card">
                        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Problems Activity</h3>
                        {Object.keys(progress).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No problem activity yet. Open a LeetCode problem to begin!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {Object.entries(progress).slice(0, 5).map(([id, p]: [string, any]) => (
                                    <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {p.solved
                                                ? <CheckCircle style={{ width: 14, height: 14, color: '#16A34A' }} />
                                                : <XCircle style={{ width: 14, height: 14, color: '#DC2626' }} />}
                                            <span style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {id.replace('leetcode_', '').replace(/-/g, ' ')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <span className="badge badge-muted">{p.attempts || 0} att</span>
                                            <span className="badge badge-warning">{(p.hintsUsed || []).length} hints</span>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(progress).length > 5 && (
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>+{Object.keys(progress).length - 5} more problems</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent hints */}
                    <div className="premium-card">
                        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent AI Hints</h3>
                        {hintHistory.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No hints yet. Click "Get Hint" while solving a problem.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {hintHistory.slice(0, 3).map((h, i) => (
                                    <div key={i} style={{ background: '#FFFBEB', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #F59E0B' }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 4, textTransform: 'uppercase' }}>
                                            {h.problemTitle || 'Problem'}
                                        </p>
                                        <p style={{ fontSize: 12, color: '#78350F', lineHeight: 1.5 }}>
                                            {h.message?.substring(0, 100)}{h.message?.length > 100 ? '…' : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminConsole;
