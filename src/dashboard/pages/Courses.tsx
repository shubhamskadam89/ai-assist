import React, { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Users, FileText, Video, Link2,
    ChevronRight, X, Upload, Trash2,
    CheckCircle, Search, GraduationCap,
    FolderOpen, ExternalLink
} from 'lucide-react';

interface CourseResource {
    id: string;
    type: 'pdf' | 'video' | 'link' | 'note';
    title: string;
    description?: string;
    url?: string;
    content?: string;
    uploadedAt: number;
}

interface Course {
    id: string;
    title: string;
    description: string;
    code: string;
    color: string;
    teacherName: string;
    enrolledStudents: string[]; // email list
    resources: CourseResource[];
    createdAt: number;
    isPublished: boolean;
}

interface CoursesProps {
    userRole: 'student' | 'teacher';
    userName: string;
    userEmail: string;
}

const COLORS = [
    'linear-gradient(135deg,#6366F1,#8B5CF6)',
    'linear-gradient(135deg,#10B981,#06B6D4)',
    'linear-gradient(135deg,#F59E0B,#EF4444)',
    'linear-gradient(135deg,#EC4899,#8B5CF6)',
    'linear-gradient(135deg,#3B82F6,#6366F1)',
    'linear-gradient(135deg,#14B8A6,#10B981)',
];

const ResourceIcon: React.FC<{ type: CourseResource['type'] }> = ({ type }) => {
    const map = {
        pdf:   { icon: FileText, bg: '#FEE2E2', color: '#DC2626' },
        video: { icon: Video,    bg: '#DBEAFE', color: '#1D4ED8' },
        link:  { icon: Link2,    bg: '#DCFCE7', color: '#15803D' },
        note:  { icon: BookOpen, bg: '#FEF3C7', color: '#92400E' },
    };
    const { icon: Icon, bg, color } = map[type];
    return (
        <div className="resource-icon" style={{ background: bg }}>
            <Icon style={{ width: 18, height: 18, color }} />
        </div>
    );
};

const Courses: React.FC<CoursesProps> = ({ userRole, userName, userEmail }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [activeTab, setActiveTab] = useState<'resources' | 'students' | 'overview'>('overview');
    const [showCreateCourse, setShowCreateCourse] = useState(false);
    const [showAddResource, setShowAddResource] = useState(false);
    const [search, setSearch] = useState('');

    // Create course form
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newColor, setNewColor] = useState(COLORS[0]);

    // Add resource form
    const [resType, setResType] = useState<CourseResource['type']>('link');
    const [resTitle, setResTitle] = useState('');
    const [resDesc, setResDesc] = useState('');
    const [resUrl, setResUrl] = useState('');
    const [resContent, setResContent] = useState('');

    // Enroll modal
    const [showEnroll, setShowEnroll] = useState(false);
    const [enrollCode, setEnrollCode] = useState('');
    const [enrollError, setEnrollError] = useState('');

    useEffect(() => {
        chrome.storage.local.get(['lmsCourses'], (r) => {
            if (r.lmsCourses) setCourses(r.lmsCourses);
        });
    }, []);

    const saveCourses = (updated: Course[]) => {
        setCourses(updated);
        chrome.storage.local.set({ lmsCourses: updated });
    };

    const createCourse = () => {
        if (!newTitle || !newCode) return;
        const course: Course = {
            id: `course_${Date.now()}`,
            title: newTitle,
            description: newDesc,
            code: newCode.toUpperCase(),
            color: newColor,
            teacherName: userName,
            enrolledStudents: [],
            resources: [],
            createdAt: Date.now(),
            isPublished: true,
        };
        const updated = [...courses, course];
        saveCourses(updated);
        setShowCreateCourse(false);
        setNewTitle(''); setNewDesc(''); setNewCode(''); setNewColor(COLORS[0]);
        setSelectedCourse(course);
        setActiveTab('overview');
    };

    const deleteCourse = (courseId: string) => {
        if (!confirm('Delete this course? This cannot be undone.')) return;
        const updated = courses.filter(c => c.id !== courseId);
        saveCourses(updated);
        if (selectedCourse?.id === courseId) setSelectedCourse(null);
    };

    const addResource = () => {
        if (!selectedCourse || !resTitle) return;
        const resource: CourseResource = {
            id: `res_${Date.now()}`,
            type: resType,
            title: resTitle,
            description: resDesc,
            url: resUrl,
            content: resContent,
            uploadedAt: Date.now(),
        };
        const updated = courses.map(c =>
            c.id === selectedCourse.id
                ? { ...c, resources: [...c.resources, resource] }
                : c
        );
        saveCourses(updated);
        const updatedCourse = updated.find(c => c.id === selectedCourse.id)!;
        setSelectedCourse(updatedCourse);
        setShowAddResource(false);
        setResTitle(''); setResDesc(''); setResUrl(''); setResContent(''); setResType('link');
    };

    const deleteResource = (courseId: string, resourceId: string) => {
        const updated = courses.map(c =>
            c.id === courseId
                ? { ...c, resources: c.resources.filter(r => r.id !== resourceId) }
                : c
        );
        saveCourses(updated);
        const updatedCourse = updated.find(c => c.id === courseId)!;
        setSelectedCourse(updatedCourse);
    };

    const enrollInCourse = () => {
        setEnrollError('');
        const course = courses.find(c => c.code === enrollCode.toUpperCase());
        if (!course) { setEnrollError('Course code not found. Ask your teacher.'); return; }
        if (course.enrolledStudents.includes(userEmail)) { setEnrollError('You are already enrolled.'); return; }
        const updated = courses.map(c =>
            c.id === course.id
                ? { ...c, enrolledStudents: [...c.enrolledStudents, userEmail] }
                : c
        );
        saveCourses(updated);
        setShowEnroll(false);
        setEnrollCode('');
        setSelectedCourse(updated.find(c => c.id === course.id)!);
        setActiveTab('resources');
    };

    const removeStudent = (courseId: string, studentEmail: string) => {
        const updated = courses.map(c =>
            c.id === courseId
                ? { ...c, enrolledStudents: c.enrolledStudents.filter(e => e !== studentEmail) }
                : c
        );
        saveCourses(updated);
        const updatedCourse = updated.find(c => c.id === courseId)!;
        setSelectedCourse(updatedCourse);
    };

    // Filter based on role
    const visibleCourses = courses.filter(c => {
        if (userRole === 'teacher') return c.teacherName === userName;
        return c.enrolledStudents.includes(userEmail) || c.isPublished;
    }).filter(c =>
        !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
    );

    const isEnrolled = (course: Course) => course.enrolledStudents.includes(userEmail);

    // ─── Detail View ────────────────────────────────────────────
    if (selectedCourse) {
        const course = courses.find(c => c.id === selectedCourse.id) || selectedCourse;
        const isTeacher = userRole === 'teacher' && course.teacherName === userName;

        return (
            <div className="animate-fade-in">
                {/* Back + Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                    <button onClick={() => setSelectedCourse(null)} className="btn-ghost" style={{ padding: '8px 14px' }}>
                        ← Back
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: course.color, flexShrink: 0 }} />
                            <div>
                                <h1 style={{ fontSize: 24, marginBottom: 2 }}>{course.title}</h1>
                                <span className="badge badge-primary">{course.code}</span>
                            </div>
                        </div>
                    </div>
                    {isTeacher && (
                        <button onClick={() => deleteCourse(course.id)} className="btn-danger" style={{ fontSize: 13 }}>
                            <Trash2 style={{ width: 14, height: 14 }} /> Delete Course
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
                    {(['overview', 'resources', ...(isTeacher ? ['students'] : [])] as ('overview' | 'resources' | 'students')[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 20px', border: 'none', background: 'none',
                                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                                marginBottom: -2, transition: 'all 0.2s', textTransform: 'capitalize'
                            }}>
                            {tab === 'overview' && '📋 Overview'}
                            {tab === 'resources' && `📁 Resources (${course.resources.length})`}
                            {tab === 'students' && `👥 Students (${course.enrolledStudents.length})`}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                        <div>
                            <div className="premium-card" style={{ marginBottom: 16 }}>
                                <h3 style={{ fontSize: 16, marginBottom: 12 }}>About this Course</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
                                    {course.description || 'No description provided for this course.'}
                                </p>
                                <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <span className="badge badge-muted"><Users style={{ width: 10, height: 10 }} />{course.enrolledStudents.length} enrolled</span>
                                    <span className="badge badge-muted"><FileText style={{ width: 10, height: 10 }} />{course.resources.length} resources</span>
                                    <span className="badge badge-success"><CheckCircle style={{ width: 10, height: 10 }} />Published</span>
                                </div>
                            </div>
                            <div className="premium-card">
                                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent Resources</h3>
                                {course.resources.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No resources yet.{isTeacher ? ' Add some below!' : ''}</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {course.resources.slice(0, 4).map(r => (
                                            <div key={r.id} className="resource-item">
                                                <ResourceIcon type={r.type} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</p>
                                                    {r.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.description}</p>}
                                                </div>
                                                <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{r.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="premium-card">
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Course Stats</h4>
                                {[
                                    { label: 'Students', value: course.enrolledStudents.length.toString(), icon: Users, color: '#6366F1' },
                                    { label: 'Resources', value: course.resources.length.toString(), icon: FolderOpen, color: '#10B981' },
                                    { label: 'Teacher', value: course.teacherName, icon: GraduationCap, color: '#F59E0B' },
                                ].map(s => (
                                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 9, background: s.color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <s.icon style={{ width: 16, height: 16, color: s.color }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                                            <p style={{ fontWeight: 700, fontSize: 15 }}>{s.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {isTeacher && (
                                <div className="premium-card" style={{ background: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Share Code</p>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.08em', marginBottom: 6 }}>{course.code}</div>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Students use this code to enroll in your course.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18 }}>Course Materials</h3>
                            {isTeacher && (
                                <button className="btn-primary" onClick={() => setShowAddResource(true)}>
                                    <Plus style={{ width: 16, height: 16 }} /> Add Resource
                                </button>
                            )}
                        </div>
                        {course.resources.length === 0 ? (
                            <div className="premium-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                                <div className="stat-icon" style={{ background: 'var(--primary-light)', margin: '0 auto 16px', width: 64, height: 64, borderRadius: '50%' }}>
                                    <FolderOpen style={{ width: 28, height: 28, color: 'var(--primary)' }} />
                                </div>
                                <h3 style={{ fontSize: 18, marginBottom: 8 }}>No resources yet</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                                    {isTeacher ? 'Add PDFs, videos, links, or notes for your students.' : 'Your teacher has not published any resources yet.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {course.resources.map(r => (
                                    <div key={r.id} className="resource-item" style={{ cursor: r.url ? 'pointer' : 'default' }}
                                        onClick={() => r.url && window.open(r.url, '_blank')}>
                                        <ResourceIcon type={r.type} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <p style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</p>
                                                <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{r.type}</span>
                                            </div>
                                            {r.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{r.description}</p>}
                                            {r.type === 'note' && r.content && (
                                                <p style={{ fontSize: 13, color: 'var(--text-main)', marginTop: 8, padding: '8px 12px', background: 'var(--accent-light, #FFFBEB)', borderRadius: 8, borderLeft: '3px solid var(--accent)' }}>{r.content}</p>
                                            )}
                                            <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{new Date(r.uploadedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                            {r.url && <ExternalLink style={{ width: 15, height: 15, color: 'var(--text-muted)' }} />}
                                            {isTeacher && (
                                                <button className="btn-ghost" style={{ padding: '4px 6px' }}
                                                    onClick={(e) => { e.stopPropagation(); deleteResource(course.id, r.id); }}>
                                                    <Trash2 style={{ width: 14, height: 14, color: 'var(--danger)' }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'students' && isTeacher && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18 }}>Enrolled Students ({course.enrolledStudents.length})</h3>
                        </div>
                        {course.enrolledStudents.length === 0 ? (
                            <div className="premium-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Users style={{ width: 28, height: 28, color: 'var(--primary)' }} />
                                </div>
                                <h3 style={{ fontSize: 18, marginBottom: 8 }}>No students yet</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                                    Share <strong style={{ color: 'var(--primary)' }}>{course.code}</strong> with your students to let them enroll.
                                </p>
                            </div>
                        ) : (
                            <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {course.enrolledStudents.map((email, idx) => {
                                            const displayName = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                            const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
                                            return (
                                                <tr key={email}>
                                                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div className="student-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials}</div>
                                                            <span style={{ fontWeight: 600 }}>{displayName}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{email}</td>
                                                    <td><span className="badge badge-success"><CheckCircle style={{ width: 10, height: 10 }} />Active</span></td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--danger)' }}
                                                            onClick={() => removeStudent(course.id, email)}>
                                                            <Trash2 style={{ width: 13, height: 13 }} /> Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Resource Modal */}
                {showAddResource && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <div className="modal-header">
                                <h2 style={{ fontSize: 20 }}>Add Resource</h2>
                                <button className="btn-ghost" onClick={() => setShowAddResource(false)} style={{ padding: '6px 8px' }}>
                                    <X style={{ width: 20, height: 20 }} />
                                </button>
                            </div>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label className="form-label">Resource Type</label>
                                    <select className="form-input" value={resType} onChange={e => setResType(e.target.value as any)}>
                                        <option value="link">🔗 Link / URL</option>
                                        <option value="pdf">📄 PDF Document</option>
                                        <option value="video">🎥 Video</option>
                                        <option value="note">📝 Note / Text</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Title *</label>
                                    <input className="form-input" value={resTitle} onChange={e => setResTitle(e.target.value)} placeholder="e.g. Week 3 Slides" />
                                </div>
                                <div>
                                    <label className="form-label">Description</label>
                                    <input className="form-input" value={resDesc} onChange={e => setResDesc(e.target.value)} placeholder="Brief description for students" />
                                </div>
                                {resType !== 'note' && (
                                    <div>
                                        <label className="form-label">URL / Link</label>
                                        <input className="form-input" value={resUrl} onChange={e => setResUrl(e.target.value)} placeholder="https://..." type="url" />
                                    </div>
                                )}
                                {resType === 'note' && (
                                    <div>
                                        <label className="form-label">Note Content</label>
                                        <textarea className="form-input" value={resContent} onChange={e => setResContent(e.target.value)} placeholder="Write your note here..." rows={4} />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setShowAddResource(false)}>Cancel</button>
                                <button className="btn-primary" onClick={addResource} disabled={!resTitle}>
                                    <Upload style={{ width: 15, height: 15 }} /> Publish Resource
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Course List View ────────────────────────────────────────────
    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>
                        {userRole === 'teacher' ? 'My Courses' : 'Course Library'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        {userRole === 'teacher'
                            ? 'Create and manage your courses, publish content for students.'
                            : 'Browse and access your enrolled courses.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {userRole === 'student' && (
                        <button className="btn-secondary" onClick={() => setShowEnroll(true)}>
                            <Plus style={{ width: 15, height: 15 }} /> Join Course
                        </button>
                    )}
                    {userRole === 'teacher' && (
                        <button className="btn-primary" onClick={() => setShowCreateCourse(true)}>
                            <Plus style={{ width: 16, height: 16 }} /> Create Course
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 24, maxWidth: 380 }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 38 }}
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search courses..." />
            </div>

            {visibleCourses.length === 0 ? (
                <div className="premium-card" style={{ textAlign: 'center', padding: '72px 24px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <BookOpen style={{ width: 36, height: 36, color: 'var(--primary)' }} />
                    </div>
                    <h3 style={{ fontSize: 22, marginBottom: 10 }}>
                        {userRole === 'teacher' ? 'No courses yet' : 'No courses available'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 340, margin: '0 auto 24px' }}>
                        {userRole === 'teacher'
                            ? 'Create your first course to start publishing content and tracking student progress.'
                            : 'Join a course using the course code from your teacher.'}
                    </p>
                    {userRole === 'teacher' && (
                        <button className="btn-primary" onClick={() => setShowCreateCourse(true)}>
                            <Plus style={{ width: 16, height: 16 }} /> Create Your First Course
                        </button>
                    )}
                    {userRole === 'student' && (
                        <button className="btn-primary" onClick={() => setShowEnroll(true)}>
                            <Plus style={{ width: 16, height: 16 }} /> Join a Course
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {visibleCourses.map(course => (
                        <div key={course.id} className="course-card" onClick={() => { setSelectedCourse(course); setActiveTab('overview'); }}>
                            <div style={{ height: 8, background: course.color }} />
                            <div style={{ padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: course.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen style={{ width: 20, height: 20, color: 'white' }} />
                                    </div>
                                    <span className="badge badge-primary">{course.code}</span>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, lineHeight: 1.3 }}>{course.title}</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5, minHeight: 38 }}>
                                    {course.description || 'No description provided.'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Users style={{ width: 12, height: 12 }} /> {course.enrolledStudents.length}
                                        </span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <FileText style={{ width: 12, height: 12 }} /> {course.resources.length}
                                        </span>
                                    </div>
                                    {userRole === 'student' && (
                                        isEnrolled(course)
                                            ? <span className="badge badge-success"><CheckCircle style={{ width: 9, height: 9 }} />Enrolled</span>
                                            : <span className="badge badge-muted">Available</span>
                                    )}
                                    <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Course Modal */}
            {showCreateCourse && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2 style={{ fontSize: 20 }}>Create New Course</h2>
                            <button className="btn-ghost" onClick={() => setShowCreateCourse(false)} style={{ padding: '6px 8px' }}>
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="form-label">Course Title *</label>
                                <input className="form-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Data Structures & Algorithms" />
                            </div>
                            <div>
                                <label className="form-label">Course Code * <span style={{ fontWeight: 400, textTransform: 'none' }}>(students use this to enroll)</span></label>
                                <input className="form-input" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="e.g. CS401" maxLength={10} />
                            </div>
                            <div>
                                <label className="form-label">Description</label>
                                <textarea className="form-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Brief course overview for students..." rows={3} />
                            </div>
                            <div>
                                <label className="form-label">Course Color</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => setNewColor(c)}
                                            style={{ width: 36, height: 36, borderRadius: 9, background: c, border: newColor === c ? '3px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', outline: newColor === c ? '2px solid var(--primary-light)' : 'none' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowCreateCourse(false)}>Cancel</button>
                            <button className="btn-primary" onClick={createCourse} disabled={!newTitle || !newCode}>
                                <BookOpen style={{ width: 15, height: 15 }} /> Create Course
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enroll Modal */}
            {showEnroll && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: 20 }}>Join a Course</h2>
                            <button className="btn-ghost" onClick={() => { setShowEnroll(false); setEnrollError(''); }} style={{ padding: '6px 8px' }}>
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Enter the course code shared by your teacher.</p>
                            <div>
                                <label className="form-label">Course Code</label>
                                <input className="form-input" value={enrollCode} onChange={e => setEnrollCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. CS401" style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: 16, letterSpacing: '0.1em' }} />
                            </div>
                            {enrollError && (
                                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
                                    {enrollError}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => { setShowEnroll(false); setEnrollError(''); }}>Cancel</button>
                            <button className="btn-primary" onClick={enrollInCourse} disabled={!enrollCode}>
                                <GraduationCap style={{ width: 15, height: 15 }} /> Enroll
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
