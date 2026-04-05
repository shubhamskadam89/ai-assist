import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, BookOpen, Plus, X, Trash2, AlertCircle } from 'lucide-react';

interface Assignment {
    id: string;
    title: string;
    courseCode: string;
    courseTitle: string;
    due: string;
    progress: number;
    score?: string;
    status: 'pending' | 'completed' | 'overdue';
    createdBy: string;
    description?: string;
}

interface AssignmentsProps {
    userRole: 'student' | 'teacher';
    userName: string;
}

const Assignments: React.FC<AssignmentsProps> = ({ userRole, userName }) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [showCreate, setShowCreate] = useState(false);

    // Create form
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCourseCode, setNewCourseCode] = useState('');
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newDue, setNewDue] = useState('');

    useEffect(() => {
        chrome.storage.local.get(['lmsAssignments'], (r) => {
            if (r.lmsAssignments && r.lmsAssignments.length > 0) {
                setAssignments(r.lmsAssignments);
            }
            // No dummy data — show empty if nothing exists
        });
    }, []);

    const save = (updated: Assignment[]) => {
        setAssignments(updated);
        chrome.storage.local.set({ lmsAssignments: updated });
    };

    const createAssignment = () => {
        if (!newTitle || !newCourseCode) return;
        const a: Assignment = {
            id: `asgn_${Date.now()}`,
            title: newTitle,
            description: newDesc,
            courseCode: newCourseCode.toUpperCase(),
            courseTitle: newCourseTitle || newCourseCode,
            due: newDue || 'No deadline',
            progress: 0,
            status: 'pending',
            createdBy: userName,
        };
        save([...assignments, a]);
        setShowCreate(false);
        setNewTitle(''); setNewDesc(''); setNewCourseCode(''); setNewCourseTitle(''); setNewDue('');
    };

    const deleteAssignment = (id: string) => {
        save(assignments.filter(a => a.id !== id));
    };

    const markComplete = (id: string) => {
        save(assignments.map(a => a.id === id ? { ...a, status: 'completed', progress: 100, score: '—' } : a));
    };

    const now = new Date();

    const filtered = assignments
        .map(a => {
            // Auto-detect overdue
            if (a.status !== 'completed' && a.due && a.due !== 'No deadline') {
                try {
                    if (new Date(a.due) < now) return { ...a, status: 'overdue' as const };
                } catch { /* ignore */ }
            }
            return a;
        })
        .filter(a => filter === 'all' || (filter === 'pending' && a.status !== 'completed') || (filter === 'completed' && a.status === 'completed'));

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>
                        {userRole === 'teacher' ? 'Class Assignments' : 'My Assignments'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        {userRole === 'teacher' ? 'Manage and publish assignments for your courses.' : 'Track your coursework and upcoming deadlines.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {/* Filter tabs */}
                    <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 2 }}>
                        {(['all', 'pending', 'completed'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                style={{
                                    padding: '6px 14px', border: 'none', borderRadius: 8,
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                                    background: filter === f ? 'var(--primary)' : 'transparent',
                                    color: filter === f ? 'white' : 'var(--text-muted)'
                                }}>{f}</button>
                        ))}
                    </div>
                    {userRole === 'teacher' && (
                        <button className="btn-primary" onClick={() => setShowCreate(true)}>
                            <Plus style={{ width: 15, height: 15 }} /> Create
                        </button>
                    )}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="premium-card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <BookOpen style={{ width: 32, height: 32, color: 'var(--primary)' }} />
                    </div>
                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>No Assignments</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 320, margin: '0 auto' }}>
                        {userRole === 'teacher'
                            ? 'Create assignments for your students using the button above.'
                            : 'No assignments have been published yet. Check back later.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
                    {filtered.map((task) => (
                        <div key={task.id} style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderTop: `4px solid ${task.status === 'completed' ? '#10B981' : task.status === 'overdue' ? '#EF4444' : '#F59E0B'}`,
                            borderRadius: '0 0 16px 16px',
                            padding: 20,
                            display: 'flex', flexDirection: 'column',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'var(--transition)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ flex: 1, marginRight: 10 }}>
                                    <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{task.title}</h3>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{task.courseCode} — {task.courseTitle}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                                    {task.status === 'completed' ? (
                                        <CheckCircle2 style={{ width: 20, height: 20, color: '#10B981' }} />
                                    ) : task.status === 'overdue' ? (
                                        <AlertCircle style={{ width: 20, height: 20, color: '#EF4444' }} />
                                    ) : (
                                        <Clock style={{ width: 20, height: 20, color: '#F59E0B' }} />
                                    )}
                                    {userRole === 'teacher' && (
                                        <button className="btn-ghost" style={{ padding: '4px 6px' }} onClick={() => deleteAssignment(task.id)}>
                                            <Trash2 style={{ width: 14, height: 14, color: 'var(--danger)' }} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {task.description && (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{task.description}</p>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                                <Clock style={{ width: 13, height: 13 }} />
                                Due: {task.due}
                                {task.status === 'overdue' && (
                                    <span className="badge badge-danger" style={{ fontSize: 10, marginLeft: 4 }}>Overdue</span>
                                )}
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                {task.status === 'completed' ? (
                                    <div style={{ padding: '12px 16px', background: '#ECFDF5', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <span style={{ color: '#065F46', fontWeight: 700, fontSize: 13 }}>Completed</span>
                                        {task.score && task.score !== '—' && (
                                            <span style={{ color: '#065F46', fontWeight: 900, fontSize: 18 }}>{task.score}</span>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Progress</span>
                                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{task.progress}%</span>
                                        </div>
                                        <div className="progress-bar" style={{ marginBottom: 12 }}>
                                            <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
                                        </div>
                                        {userRole === 'student' && (
                                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '8px' }}
                                                onClick={() => markComplete(task.id)}>
                                                <CheckCircle2 style={{ width: 14, height: 14 }} /> Mark as Done
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Assignment Modal */}
            {showCreate && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2 style={{ fontSize: 20 }}>Create Assignment</h2>
                            <button className="btn-ghost" onClick={() => setShowCreate(false)} style={{ padding: '6px 8px' }}>
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="form-label">Title *</label>
                                <input className="form-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Build a Binary Search Tree" />
                            </div>
                            <div>
                                <label className="form-label">Description</label>
                                <textarea className="form-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} placeholder="Assignment instructions..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="form-label">Course Code *</label>
                                    <input className="form-input" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value.toUpperCase())} placeholder="CS401" maxLength={10} />
                                </div>
                                <div>
                                    <label className="form-label">Course Name</label>
                                    <input className="form-input" value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} placeholder="Data Structures" />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Deadline</label>
                                <input className="form-input" type="date" value={newDue} onChange={e => setNewDue(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button className="btn-primary" onClick={createAssignment} disabled={!newTitle || !newCourseCode}>
                                <Plus style={{ width: 15, height: 15 }} /> Publish Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
