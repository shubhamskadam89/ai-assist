import React, { useState, useEffect } from 'react';
import {
    BookOpen, FileText, Video, ExternalLink,
    Search, Star, Clock, FolderOpen,
    Globe, ChevronRight, Tag
} from 'lucide-react';

interface Resource {
    id: string;
    type: 'pdf' | 'video' | 'link' | 'note';
    title: string;
    description: string;
    url?: string;
    content?: string;
    courseCode?: string;
    courseTitle?: string;
    uploadedAt: number;
    pinned?: boolean;
}

interface ClassResourcesProps {
    userEmail: string;
}

// Curated starter resources shown if no course resources exist
const STARTER_RESOURCES: Resource[] = [
    { id: 'r1', type: 'link', title: 'LeetCode — Practice Problems', description: 'Top coding interview platform with 2000+ problems.', url: 'https://leetcode.com', courseCode: 'GLOBAL', courseTitle: 'Coding Practice', uploadedAt: Date.now(), pinned: true },
    { id: 'r2', type: 'link', title: 'GeeksForGeeks — DSA Guide', description: 'Comprehensive Data Structures & Algorithms tutorials.', url: 'https://geeksforgeeks.org', courseCode: 'GLOBAL', courseTitle: 'Coding Practice', uploadedAt: Date.now(), pinned: true },
    { id: 'r3', type: 'video', title: 'CS50 Harvard — Intro to CS', description: 'World-renowned free CS course by Harvard.', url: 'https://cs50.harvard.edu', courseCode: 'CS101', courseTitle: 'Computer Science Fundamentals', uploadedAt: Date.now() },
    { id: 'r4', type: 'link', title: 'MDN Web Docs', description: 'Official documentation for HTML, CSS, JavaScript.', url: 'https://developer.mozilla.org', courseCode: 'WEB101', courseTitle: 'Web Development', uploadedAt: Date.now() },
    { id: 'r5', type: 'link', title: 'Spring Boot Docs', description: 'Official Spring Boot reference documentation.', url: 'https://spring.io/projects/spring-boot', courseCode: 'BACKEND', courseTitle: 'Backend Development', uploadedAt: Date.now() },
    { id: 'r6', type: 'video', title: 'MIT OpenCourseWare — Algorithms', description: '6.006 Introduction to Algorithms by MIT.', url: 'https://ocw.mit.edu/courses/6-006/', courseCode: 'CS401', courseTitle: 'Algorithms', uploadedAt: Date.now() },
];

const ResourceTypeIcon: React.FC<{ type: Resource['type'] }> = ({ type }) => {
    const map = {
        pdf:   { icon: FileText, bg: '#FEE2E2', color: '#DC2626' },
        video: { icon: Video,    bg: '#DBEAFE', color: '#1D4ED8' },
        link:  { icon: Globe,    bg: '#DCFCE7', color: '#15803D' },
        note:  { icon: BookOpen, bg: '#FEF3C7', color: '#92400E' },
    };
    const { icon: Icon, bg, color } = map[type];
    return (
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon style={{ width: 20, height: 20, color }} />
        </div>
    );
};

const ClassResources: React.FC<ClassResourcesProps> = ({ userEmail }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'all' | Resource['type']>('all');
    const [filterCourse, setFilterCourse] = useState('all');

    useEffect(() => {
        chrome.storage.local.get(['lmsCourses'], (r) => {
            if (!r.lmsCourses || r.lmsCourses.length === 0) {
                setResources(STARTER_RESOURCES);
                return;
            }
            // Collect resources from enrolled courses
            const enrolled = (r.lmsCourses as any[]).filter(c =>
                c.enrolledStudents?.includes(userEmail) || true // show all published
            );
            const allResources: Resource[] = enrolled.flatMap((c: any) =>
                (c.resources || []).map((res: any) => ({
                    ...res,
                    courseCode: c.code,
                    courseTitle: c.title,
                }))
            );
            setResources(allResources.length > 0 ? allResources : STARTER_RESOURCES);
        });
    }, [userEmail]);

    const courses = Array.from(new Set(resources.map(r => r.courseCode).filter(Boolean)));
    const types: { value: 'all' | Resource['type']; label: string }[] = [
        { value: 'all', label: 'All Types' },
        { value: 'link', label: '🔗 Links' },
        { value: 'pdf', label: '📄 PDFs' },
        { value: 'video', label: '🎥 Videos' },
        { value: 'note', label: '📝 Notes' },
    ];

    const filtered = resources
        .filter(r => filterType === 'all' || r.type === filterType)
        .filter(r => filterCourse === 'all' || r.courseCode === filterCourse)
        .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

    const pinned = filtered.filter(r => r.pinned);
    const regular = filtered.filter(r => !r.pinned);

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>Class Resources</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        Study materials, links, videos and notes from all your courses.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: 38 }}
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources..." />
                </div>
                {/* Type filter */}
                <select className="form-input" style={{ flex: '0 0 160px', background: 'var(--surface)' }}
                    value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                    {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {/* Course filter */}
                {courses.length > 1 && (
                    <select className="form-input" style={{ flex: '0 0 180px', background: 'var(--surface)' }}
                        value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                )}
            </div>

            {/* Pinned Resources */}
            {pinned.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <Star style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                        <h3 style={{ fontSize: 15, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>Pinned Resources</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {pinned.map(r => (
                            <div key={r.id} onClick={() => r.url && window.open(r.url, '_blank')}
                                style={{ background: 'var(--surface)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '16px 18px', cursor: r.url ? 'pointer' : 'default', transition: 'all 0.2s', display: 'flex', gap: 14, alignItems: 'flex-start' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = '#F59E0B')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)')}>
                                <ResourceTypeIcon type={r.type} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.title}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.description}</p>
                                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span className="badge badge-warning" style={{ fontSize: 10 }}><Star style={{ width: 8, height: 8 }} />Pinned</span>
                                        {r.url && <ExternalLink style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Resources */}
            <div>
                {regular.length > 0 && pinned.length > 0 && (
                    <h3 style={{ fontSize: 15, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, marginBottom: 14 }}>All Resources</h3>
                )}

                {filtered.length === 0 ? (
                    <div className="premium-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <FolderOpen style={{ width: 40, height: 40, color: 'var(--text-light)', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>No resources found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {regular.map(r => (
                            <div key={r.id}
                                onClick={() => r.url && window.open(r.url, '_blank')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '16px 20px', borderRadius: 14,
                                    border: '1px solid var(--border)', background: 'var(--surface)',
                                    cursor: r.url ? 'pointer' : 'default', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                                <ResourceTypeIcon type={r.type} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                                        <p style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</p>
                                        {r.courseCode && r.courseCode !== 'GLOBAL' && (
                                            <span className="badge badge-primary" style={{ fontSize: 10 }}>
                                                <Tag style={{ width: 8, height: 8 }} />{r.courseCode}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.description}</p>
                                    {r.type === 'note' && r.content && (
                                        <p style={{ fontSize: 13, marginTop: 8, padding: '8px 12px', background: 'var(--accent-light, #FFFBEB)', borderRadius: 8, borderLeft: '3px solid var(--accent)', color: 'var(--text-main)', lineHeight: 1.6 }}>
                                            {r.content}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock style={{ width: 10, height: 10 }} /> {new Date(r.uploadedAt).toLocaleDateString()}
                                        </span>
                                        <span className="badge badge-muted" style={{ fontSize: 10, textTransform: 'capitalize' }}>{r.type}</span>
                                    </div>
                                </div>
                                <div style={{ flexShrink: 0 }}>
                                    {r.url
                                        ? <ExternalLink style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                                        : <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassResources;
