import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Plus, Clock, CheckCircle, ChevronRight,
    Trash2, Award, X, Send, AlertCircle, BookOpen, Star,
    BarChart2, Users
} from 'lucide-react';

interface Question {
    id: number;
    text: string;
    type: 'mcq' | 'text';
    options?: string[];
    correctOption?: number;
    points: number;
}

interface Test {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    deadline: string;
    createdBy: string;
    createdAt: number;
    status: 'active' | 'closed';
    courseCode?: string;
}

interface Submission {
    testId: string;
    studentEmail: string;
    studentName: string;
    answers: Record<number, string | number>;
    submittedAt: number;
    score?: number;
    totalPoints?: number;
}

interface ClassTestsProps {
    userRole: 'student' | 'teacher';
    userName: string;
    userEmail: string;
}

const ClassTests: React.FC<ClassTestsProps> = ({ userRole, userName, userEmail }) => {
    const [tests, setTests] = useState<Test[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [activeTest, setActiveTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<Record<number, string | number>>({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Teacher analytics
    const [selectedTestForAnalytics, setSelectedTestForAnalytics] = useState<Test | null>(null);

    // New test form state
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [newCourseCode, setNewCourseCode] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        { id: 1, text: '', type: 'mcq', options: ['', '', '', ''], correctOption: 0, points: 10 }
    ]);

    useEffect(() => {
        chrome.storage.local.get(['classTests', 'testSubmissionsV2'], (r) => {
            if (r.classTests) setTests(r.classTests);
            if (r.testSubmissionsV2) setSubmissions(r.testSubmissionsV2);
        });
    }, []);

    const saveTests = (updated: Test[]) => {
        setTests(updated);
        chrome.storage.local.set({ classTests: updated });
    };
    const saveSubmissions = (updated: Submission[]) => {
        setSubmissions(updated);
        chrome.storage.local.set({ testSubmissionsV2: updated });
    };

    const createTest = () => {
        if (!newTitle || questions.some(q => !q.text)) return;
        const test: Test = {
            id: `test_${Date.now()}`,
            title: newTitle,
            description: newDesc,
            questions,
            deadline: newDeadline,
            createdBy: userName,
            createdAt: Date.now(),
            status: 'active',
            courseCode: newCourseCode,
        };
        saveTests([...tests, test]);
        setShowCreateModal(false);
        setNewTitle(''); setNewDesc(''); setNewDeadline(''); setNewCourseCode('');
        setQuestions([{ id: 1, text: '', type: 'mcq', options: ['', '', '', ''], correctOption: 0, points: 10 }]);
    };

    const deleteTest = (testId: string) => {
        if (!confirm('Delete this test and all its submissions?')) return;
        saveTests(tests.filter(t => t.id !== testId));
        saveSubmissions(submissions.filter(s => s.testId !== testId));
    };

    const toggleTestStatus = (testId: string) => {
        saveTests(tests.map(t => t.id === testId ? { ...t, status: t.status === 'active' ? 'closed' : 'active' } : t));
    };

    const submitTest = () => {
        if (!activeTest) return;
        let score = 0;
        const totalPoints = activeTest.questions.reduce((s, q) => s + q.points, 0);
        activeTest.questions.forEach(q => {
            if (q.type === 'mcq' && answers[q.id] === q.correctOption) score += q.points;
        });
        const sub: Submission = {
            testId: activeTest.id,
            studentEmail: userEmail,
            studentName: userName,
            answers,
            submittedAt: Date.now(),
            score,
            totalPoints
        };
        const updatedSubs = [...submissions.filter(s => !(s.testId === activeTest.id && s.studentEmail === userEmail)), sub];
        saveSubmissions(updatedSubs);
        setSubmitted(true);
    };

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            id: Date.now(), text: '', type: 'mcq',
            options: ['', '', '', ''], correctOption: 0, points: 10
        }]);
    };

    const updateQuestion = (idx: number, field: string, val: any) => {
        setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val } : q));
    };

    const updateOption = (qi: number, oi: number, val: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qi) return q;
            const opts = [...(q.options || [])];
            opts[oi] = val;
            return { ...q, options: opts };
        }));
    };

    const getMySubmission = (testId: string) => submissions.find(s => s.testId === testId && s.studentEmail === userEmail);
    const getTestSubmissions = (testId: string) => submissions.filter(s => s.testId === testId);

    // ─── Active Test (Student Taking Test) ────────────────────────────────
    if (activeTest && userRole === 'student') {
        const mySub = getMySubmission(activeTest.id);
        const alreadySubmitted = !!mySub || submitted;
        const sub = mySub || submissions.find(s => s.testId === activeTest.id && s.studentEmail === userEmail);
        const totalPts = activeTest.questions.reduce((s, q) => s + q.points, 0);
        const pct = sub ? Math.round((sub.score! / totalPts) * 100) : 0;

        return (
            <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
                <button onClick={() => { setActiveTest(null); setSubmitted(false); setAnswers({}); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24 }}>
                    ← Back to Tests
                </button>

                <div className="premium-card" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: 22, marginBottom: 6 }}>{activeTest.title}</h2>
                            {activeTest.description && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{activeTest.description}</p>}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 20 }}>
                            <span className="badge badge-primary">{activeTest.questions.length} Questions</span>
                            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                <Award style={{ width: 14, height: 14 }} />{totalPts} pts total
                            </div>
                        </div>
                    </div>
                    {activeTest.deadline && (
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                            <Clock style={{ width: 14, height: 14 }} /> Deadline: {activeTest.deadline}
                        </div>
                    )}
                </div>

                {alreadySubmitted ? (
                    <div className="premium-card" style={{ textAlign: 'center', padding: '56px 24px' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: pct >= 70 ? '#DCFCE7' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            {pct >= 70
                                ? <CheckCircle style={{ width: 40, height: 40, color: '#16A34A' }} />
                                : <AlertCircle style={{ width: 40, height: 40, color: '#DC2626' }} />}
                        </div>
                        <h3 style={{ fontSize: 26, marginBottom: 8 }}>Test Submitted!</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Your response has been recorded successfully.</p>
                        <div style={{ display: 'inline-block', background: 'var(--primary-light)', borderRadius: 20, padding: '24px 56px' }}>
                            <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                                {sub?.score ?? 0} <span style={{ fontSize: 24, opacity: 0.6 }}>/ {totalPts}</span>
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginTop: 6 }}>{pct}% Score</div>
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <span className={`badge ${pct >= 70 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 13, padding: '6px 16px' }}>
                                <Star style={{ width: 12, height: 12 }} />
                                {pct >= 90 ? '🎉 Excellent!' : pct >= 70 ? '👍 Good Job!' : '📚 Keep Practicing!'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {activeTest.questions.map((q, idx) => (
                            <div className="premium-card" key={q.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)' }}>
                                        Question {idx + 1}
                                    </span>
                                    <span className="badge badge-muted">{q.points} pts</span>
                                </div>
                                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 20, lineHeight: 1.5 }}>{q.text}</p>
                                {q.type === 'mcq' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {q.options?.map((opt, oi) => (
                                            <label key={oi} style={{
                                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                                borderRadius: 12, border: `2px solid ${answers[q.id] === oi ? 'var(--primary)' : 'var(--border)'}`,
                                                background: answers[q.id] === oi ? 'var(--primary-light)' : 'var(--background)',
                                                cursor: 'pointer', transition: 'all 0.15s', fontWeight: 500
                                            }}>
                                                <input type="radio" name={`q${q.id}`} style={{ display: 'none' }}
                                                    checked={answers[q.id] === oi}
                                                    onChange={() => setAnswers(p => ({ ...p, [q.id]: oi }))} />
                                                <div style={{
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    border: `2px solid ${answers[q.id] === oi ? 'var(--primary)' : 'var(--border)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
                                                }}>
                                                    {answers[q.id] === oi && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                                                </div>
                                                <span>{opt || `Option ${oi + 1}`}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea className="form-input" rows={4} placeholder="Type your answer here..."
                                        style={{ resize: 'none' }}
                                        onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))} />
                                )}
                            </div>
                        ))}
                        <button onClick={submitTest} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15, borderRadius: 12 }}>
                            <Send style={{ width: 18, height: 18 }} /> Submit Test
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ─── Teacher: Test Analytics View ────────────────────────────────────
    if (selectedTestForAnalytics && userRole === 'teacher') {
        const testSubs = getTestSubmissions(selectedTestForAnalytics.id);
        const totalPts = selectedTestForAnalytics.questions.reduce((s, q) => s + q.points, 0);
        const avgScore = testSubs.length > 0
            ? Math.round(testSubs.reduce((s, sub) => s + (sub.score || 0), 0) / testSubs.length)
            : 0;

        return (
            <div className="animate-fade-in">
                <button onClick={() => setSelectedTestForAnalytics(null)} className="btn-ghost" style={{ marginBottom: 24 }}>
                    ← Back to Tests
                </button>
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 24, marginBottom: 4 }}>{selectedTestForAnalytics.title}</h1>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span className="badge badge-primary">{selectedTestForAnalytics.questions.length} Questions</span>
                        <span className="badge badge-muted">{totalPts} pts</span>
                        {selectedTestForAnalytics.status === 'active'
                            ? <span className="badge badge-success"><CheckCircle style={{ width: 10, height: 10 }} />Active</span>
                            : <span className="badge badge-danger">Closed</span>}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                    {[
                        { label: 'Submissions', value: testSubs.length.toString(), icon: Users, color: '#6366F1', bg: '#EEF2FF' },
                        { label: 'Avg Score', value: testSubs.length > 0 ? `${avgScore}/${totalPts}` : '—', icon: BarChart2, color: '#10B981', bg: '#ECFDF5' },
                        { label: 'Pass Rate', value: testSubs.length > 0 ? `${Math.round((testSubs.filter(s => s.score! >= totalPts * 0.7).length / testSubs.length) * 100)}%` : '—', icon: Award, color: '#F59E0B', bg: '#FFFBEB' },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="stat-icon" style={{ background: s.bg }}><s.icon style={{ width: 20, height: 20, color: s.color }} /></div>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</p>
                                <p style={{ fontSize: 26, fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="premium-card">
                    <h3 style={{ fontSize: 17, marginBottom: 16 }}>Student Submissions</h3>
                    {testSubs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            <Users style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
                            <p>No submissions yet. Share this test with your students.</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th style={{ textAlign: 'center' }}>Score</th>
                                    <th style={{ textAlign: 'center' }}>Percentage</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'right' }}>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testSubs.map((sub, i) => {
                                    const pct = Math.round((sub.score! / totalPts) * 100);
                                    const initials = sub.studentName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';
                                    return (
                                        <tr key={i}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="student-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{initials}</div>
                                                    <div>
                                                        <p style={{ fontWeight: 700, fontSize: 14 }}>{sub.studentName}</p>
                                                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub.studentEmail}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 900, fontSize: 16, color: 'var(--primary)' }}>
                                                {sub.score}<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>/{totalPts}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                                    <div style={{ width: 60, height: 6, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? '#10B981' : '#EF4444', borderRadius: 999 }} />
                                                    </div>
                                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{pct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {pct >= 70
                                                    ? <span className="badge badge-success"><CheckCircle style={{ width: 10, height: 10 }} />Passed</span>
                                                    : <span className="badge badge-danger">Needs Work</span>}
                                            </td>
                                            <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                                                {new Date(sub.submittedAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        );
    }

    // ─── Test List View ────────────────────────────────────────────
    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>Class Tests</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        {userRole === 'teacher' ? 'Create and manage assessments for your students.' : 'View and take your assigned tests.'}
                    </p>
                </div>
                {userRole === 'teacher' && (
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus style={{ width: 16, height: 16 }} /> Create Test
                    </button>
                )}
            </div>

            {/* Empty State */}
            {tests.length === 0 ? (
                <div className="premium-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <BookOpen style={{ width: 32, height: 32, color: 'var(--primary)' }} />
                    </div>
                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>No Tests Yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        {userRole === 'teacher' ? 'Create your first test using the button above.' : 'No tests have been assigned to your class yet.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {tests.map(test => {
                        const mySub = getMySubmission(test.id);
                        const testSubs = getTestSubmissions(test.id);
                        const totalPts = test.questions.reduce((s, q) => s + q.points, 0);
                        return (
                            <div key={test.id} className="premium-card"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, cursor: 'pointer' }}
                                    onClick={() => {
                                        if (userRole === 'teacher') { setSelectedTestForAnalytics(test); }
                                        else { setActiveTest(test); setSubmitted(!!mySub); setAnswers(mySub?.answers || {}); }
                                    }}>
                                    <div style={{ width: 52, height: 52, borderRadius: 12, background: mySub ? '#DCFCE7' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {mySub ? <CheckCircle style={{ width: 24, height: 24, color: '#16A34A' }} />
                                            : <ClipboardList style={{ width: 24, height: 24, color: 'var(--primary)' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{test.title}</h3>
                                        {test.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{test.description}</p>}
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <span className="badge badge-muted">{test.questions.length} Qs</span>
                                            <span className="badge badge-muted">{totalPts} pts</span>
                                            {test.deadline && <span className="badge badge-warning"><Clock style={{ width: 10, height: 10 }} />{test.deadline}</span>}
                                            {test.courseCode && <span className="badge badge-primary">{test.courseCode}</span>}
                                            {mySub && <span className="badge badge-success"><CheckCircle style={{ width: 10, height: 10 }} />Score: {mySub.score}/{totalPts}</span>}
                                            {userRole === 'teacher' && <span className="badge badge-info"><Users style={{ width: 10, height: 10 }} />{testSubs.length} submitted</span>}
                                            {test.status === 'closed' && <span className="badge badge-danger">Closed</span>}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                                    {userRole === 'teacher' && (
                                        <>
                                            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => toggleTestStatus(test.id)}>
                                                {test.status === 'active' ? 'Close' : 'Open'}
                                            </button>
                                            <button className="btn-ghost" style={{ padding: '6px 8px' }} onClick={() => deleteTest(test.id)}>
                                                <Trash2 style={{ width: 14, height: 14, color: 'var(--danger)' }} />
                                            </button>
                                        </>
                                    )}
                                    <ChevronRight style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Create Test Modal ─── FIXED SCROLLABLE ─── */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-box modal-box-lg">
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: 20, marginBottom: 2 }}>Create New Test</h2>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Set up questions and publish for your class</p>
                            </div>
                            <button className="btn-ghost" onClick={() => setShowCreateModal(false)} style={{ padding: '6px 8px' }}>
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Test Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Test Title *</label>
                                    <input className="form-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Midterm Coding Assessment" />
                                </div>
                                <div>
                                    <label className="form-label">Description</label>
                                    <input className="form-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Brief instructions for students" />
                                </div>
                                <div>
                                    <label className="form-label">Course Code (optional)</label>
                                    <input className="form-input" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value.toUpperCase())} placeholder="CS401" />
                                </div>
                                <div>
                                    <label className="form-label">Deadline (optional)</label>
                                    <input className="form-input" type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
                                </div>
                            </div>

                            <div className="divider" />
                            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Questions ({questions.length})</h3>

                            {questions.map((q, qi) => (
                                <div key={q.id} style={{ background: 'var(--background)', borderRadius: 14, padding: 18, border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Q{qi + 1}</span>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {(['mcq', 'text'] as const).map(t => (
                                                    <button key={t} onClick={() => updateQuestion(qi, 'type', t)}
                                                        style={{
                                                            padding: '3px 10px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                                            background: q.type === t ? 'var(--primary)' : 'var(--border)',
                                                            color: q.type === t ? 'white' : 'var(--text-muted)'
                                                        }}>
                                                        {t === 'mcq' ? 'MCQ' : 'Text'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>Points:</span>
                                            <input type="number" value={q.points} min={1}
                                                onChange={e => updateQuestion(qi, 'points', +e.target.value)}
                                                style={{ width: 56, border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontSize: 13, background: 'var(--surface)', color: 'var(--text-main)', outline: 'none' }} />
                                            {questions.length > 1 && (
                                                <button className="btn-ghost" style={{ padding: '4px 6px' }} onClick={() => setQuestions(prev => prev.filter((_, i) => i !== qi))}>
                                                    <Trash2 style={{ width: 14, height: 14, color: 'var(--danger)' }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <input className="form-input" style={{ marginBottom: 12, background: 'var(--surface)' }}
                                        value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)}
                                        placeholder="Enter question text..." />

                                    {q.type === 'mcq' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {q.options?.map((opt, oi) => (
                                                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}>
                                                        <input type="radio" name={`correct_${q.id}`} checked={q.correctOption === oi}
                                                            onChange={() => updateQuestion(qi, 'correctOption', oi)} />
                                                        <span style={{ fontSize: 11, color: q.correctOption === oi ? '#16A34A' : 'var(--text-muted)', fontWeight: 700 }}>
                                                            {q.correctOption === oi ? '✓ Correct' : 'Mark correct'}
                                                        </span>
                                                    </label>
                                                    <input className="form-input" style={{ flex: 1, padding: '8px 12px', fontSize: 13, background: 'var(--surface)' }}
                                                        value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                                                        placeholder={`Option ${oi + 1}`} />
                                                </div>
                                            ))}
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                                ⓘ Select the radio button next to the correct answer
                                            </p>
                                        </div>
                                    )}
                                    {q.type === 'text' && (
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, border: '1px dashed var(--border)' }}>
                                            ✏️ Students will type their answer in a text box. Manual grading required.
                                        </p>
                                    )}
                                </div>
                            ))}

                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={addQuestion}>
                                <Plus style={{ width: 15, height: 15 }} /> Add Question
                            </button>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={createTest}
                                disabled={!newTitle || questions.some(q => !q.text)}>
                                <ClipboardList style={{ width: 15, height: 15 }} /> Publish Test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassTests;
