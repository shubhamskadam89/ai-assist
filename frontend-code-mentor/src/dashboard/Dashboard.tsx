import { useEffect, useState } from 'react'
import {
    Home, User, Building, FolderGit2, Compass, FileText,
    Calendar, Trophy, HelpCircle, MessageSquare,
    LogOut, CheckCircle2, Search, Sun, MoveUpRight,
    Menu, X, Activity
} from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'

// Mock Data for Charts
const ratingData = [
    { name: 'Jan', uv: 950 },
    { name: 'Feb', uv: 1020 },
    { name: 'Mar', uv: 1150 },
    { name: 'Apr', uv: 1130 },
    { name: 'May', uv: 1210 },
    { name: 'Jun', uv: 1280 },
    { name: 'Jul', uv: 1250 },
    { name: 'Aug', uv: 1300 },
    { name: 'Sep', uv: 1341 },
]

// Interface matching Backend DTO
interface DashboardData {
    studentName: string;
    handle: string;
    totalActiveDays: number;
    maxStreak: number;
    currentStreak: number;
    classTestsTaken: number;
    avgTestScore: number;
    dsaStats: { name: string, value: number, color: string }[];
    fundamentalsStats: { name: string, value: number, color: string }[];
}


// Function to simulate a Github styled contribution heatmap grid
const generateHeatmap = () => {
    return Array.from({ length: 7 * 10 }).map((_, i) => ({
        id: i,
        level: Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0
    }))
}

const getHeatmapColor = (level: number) => {
    switch (level) {
        case 1: return 'bg-emerald-200 dark:bg-emerald-900/40' // lightest
        case 2: return 'bg-emerald-400 dark:bg-emerald-700/60'
        case 3: return 'bg-emerald-600 dark:bg-emerald-500/80'
        case 4: return 'bg-emerald-800 dark:bg-emerald-400' // darkest
        default: return 'bg-zinc-100 dark:bg-zinc-800/50' // empty
    }
}


export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const heatmapData = generateHeatmap();

    useEffect(() => {
        // First check local storage for theme
        chrome.storage?.local?.get(['settings'], (result) => {
            if (result.settings?.theme === 'dark') {
                document.documentElement.classList.add('dark')
            }
        })

        // Fetch user data from backend
        // We will hardcode test_user for now until a login flow is created
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/v1/dashboard/stats/test_user');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setDashboardData(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Is the backend running?");
                // Setup mock fallback data so the UI doesn't look completely broken if server is off
                setDashboardData({
                    studentName: "Shubham Kadam",
                    handle: "test_user",
                    totalActiveDays: 234,
                    maxStreak: 45,
                    currentStreak: 12,
                    classTestsTaken: 4,
                    avgTestScore: 94.0,
                    dsaStats: [
                        { name: 'Easy', value: 205, color: '#10b981' },
                        { name: 'Medium', value: 242, color: '#f97316' },
                        { name: 'Hard', value: 44, color: '#eab308' }
                    ],
                    fundamentalsStats: [
                        { name: 'Completed', value: 61, color: '#10b981' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-sans">
                <div className="flex flex-col items-center space-y-4">
                    <Activity className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="font-semibold text-sm">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">

            {/* SIDEBAR */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'} flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-y-auto z-20 fixed md:relative h-screen`}>
                <div className="p-5 flex items-center space-x-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        🦊
                    </div>
                    <span className="font-extrabold text-xl font-sans tracking-tight">CodeMentor</span>
                </div>

                <div className="p-4 space-y-8">
                    <NavItem icon={<Home className="w-4 h-4" />} label="Home" />

                    <NavGroup title="PROFILE TRACKER">
                        <NavItem icon={<User className="w-4 h-4" />} label="Portfolio" active />
                    </NavGroup>

                    <NavGroup title="CLASS TRACKER">
                        <NavItem icon={<Building className="w-4 h-4" />} label="Class Assignments" />
                        <NavItem icon={<FolderGit2 className="w-4 h-4" />} label="My Submissions" />
                        <NavItem icon={<Compass className="w-4 h-4" />} label="Class Resources" />
                        <NavItem icon={<FileText className="w-4 h-4" />} label="My Notes" />
                    </NavGroup>

                    <NavGroup title="EXAMS & TESTS">
                        <NavItem icon={<Calendar className="w-4 h-4" />} label="Class Tests" />
                    </NavGroup>

                    <NavGroup title="YOUR CLASS">
                        <NavItem icon={<Trophy className="w-4 h-4" />} label="Class Leaderboard" />
                    </NavGroup>

                    <NavGroup title="SUPPORT">
                        <NavItem icon={<HelpCircle className="w-4 h-4" />} label="Help Center" />
                        <NavItem icon={<MessageSquare className="w-4 h-4" />} label="Feedback" />
                    </NavGroup>
                </div>

                <div className="absolute bottom-0 w-full p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <User className="w-4 h-4" /> <span>Edit Profile</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-3 py-2 mt-1 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* TOPBAR */}
                <header className="h-16 flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 z-10 w-full">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md md:hidden">
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div className="w-64 max-w-sm hidden md:flex items-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 border border-transparent dark:border-zinc-700/50 focus-within:border-orange-500 focus-within:bg-white dark:focus-within:bg-zinc-900 rounded-full transition-colors">
                            <Search className="w-4 h-4 text-zinc-400" />
                            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full ml-2 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-semibold">
                            <span>Class Rank: #1</span>
                            <span className="text-yellow-400">🌟</span>
                        </button>
                        <button className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                            <Sun className="w-4 h-4" />
                        </button>
                        <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 cursor-pointer">
                            S
                        </div>
                    </div>
                </header>

                {/* CONTENT SCROLL */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT PROFILE CARD (COL-SPAN-3) */}
                        {/* PROFILE CARD */}
                        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-orange-400 to-rose-400 opacity-20 dark:opacity-10"></div>

                            <div className="relative">
                                <img
                                    src="https://avatars.githubusercontent.com/u/74038190?v=4" // Use real user's avatar from github or replace with placeholder
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg object-cover"
                                />
                                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                            </div>

                            <h2 className="mt-4 text-2xl font-bold">{dashboardData?.studentName || "Student"}</h2>
                            <p className="text-zinc-500 font-medium tracking-tight mt-0.5">@{dashboardData?.handle || "student_id"}</p>

                            <button className="w-full mt-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm shadow-orange-500/20 transition-all active:scale-95">
                                Get your Profile Card
                            </button>

                            <div className="flex items-center space-x-3 mt-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/80 w-full justify-center">
                                <SocialIcon icon="✉" />
                                <SocialIcon icon="in" />
                                <SocialIcon icon="𝕏" />
                                <SocialIcon icon="🌐" />
                                <SocialIcon icon="📄" />
                            </div>

                            <div className="w-full mt-6 space-y-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                <div className="flex items-center"><Compass className="w-4 h-4 mr-3 text-zinc-400" /> India</div>
                                <div className="flex items-center"><Building className="w-4 h-4 mr-3 text-zinc-400" /> MIT Academy of Engineering</div>
                            </div>

                            {/* Connected Platforms Dropdown (Mock) */}
                            <div className="w-full mt-8">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Problem Solving Stats</h3>
                                <div className="space-y-3">
                                    <PlatformLink name="LeetCode" active />
                                    <PlatformLink name="GeeksForGeeks" active />
                                    <PlatformLink name="HackerRank" active />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT DASHBOARD DATA (COL-SPAN-9) */}
                    <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {/* STAT CARDS */}
                        <StatCard title="Total Active Days" value={dashboardData?.totalActiveDays?.toString() || "0"} />
                        <StatCard title="Current Streak" value={`${dashboardData?.currentStreak?.toString() || "0"} 🔥`} />

                        {/* HEATMAP */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm col-span-1 xl:col-span-1">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex space-x-4 text-xs font-medium text-zinc-500">
                                    <span><strong className="text-zinc-800 dark:text-zinc-200">197</strong> Submissions</span>
                                    <span>Max Streak <strong className="text-zinc-800 dark:text-zinc-200">72</strong></span>
                                    <span>Curr Streak <strong className="text-zinc-800 dark:text-zinc-200">9</strong></span>
                                </div>
                            </div>
                            {/* CSS Grid for faux heatmap */}
                            <div className="grid grid-cols-[repeat(10,1fr)] gap-1 w-full max-w-[200px] mt-2">
                                {heatmapData.map(cell => (
                                    <div key={cell.id} className={`w-3 h-3 rounded-sm ${getHeatmapColor(cell.level)}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* CONTESTS */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm col-span-1 md:col-span-2 xl:col-span-1 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-500">Class Tests</h3>
                                <p className="text-4xl font-extrabold mt-1">{dashboardData?.classTestsTaken || 0}</p>
                            </div>
                            <div className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Avg Score</span>
                                <span className="text-sm font-bold ml-2">{dashboardData?.avgTestScore || 0}%</span>
                            </div>
                        </div>


                        {/* DONUT CHARTS COLUMN (Spans Right) */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm col-span-1 xl:row-span-3 flex flex-col items-center">
                            <h3 className="text-lg font-bold w-full text-center border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">Problems Solved</h3>

                            {error && (
                                <div className="w-full text-xs text-red-500 text-center mb-4 font-semibold">{error}</div>
                            )}

                            <DonutSection title="Fundamentals" data={dashboardData?.fundamentalsStats || []} total={dashboardData?.fundamentalsStats?.reduce((sum, item) => sum + item.value, 0) || 0} stats={{ Completed: dashboardData?.fundamentalsStats?.[0]?.value || 0 }} />
                            <DonutSection title="DSA Assignments" data={dashboardData?.dsaStats || []} total={dashboardData?.dsaStats?.reduce((sum, item) => sum + item.value, 0) || 0} stats={{ Easy: dashboardData?.dsaStats?.find(s => s.name === 'Easy')?.value || 0, Medium: dashboardData?.dsaStats?.find(s => s.name === 'Medium')?.value || 0, Hard: dashboardData?.dsaStats?.find(s => s.name === 'Hard')?.value || 0 }} colors={['text-emerald-500', 'text-yellow-500', 'text-red-500']} />

                        </div>

                        {/* RATING CHART */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm col-span-1 md:col-span-2 xl:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg">Rating History</h3>
                                <select className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs px-2 py-1 rounded-md outline-none">
                                    <option>Last 6 Months</option>
                                </select>
                            </div>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={ratingData}>
                                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 100', 'auto']} />
                                        <Tooltip
                                            cursor={{ stroke: 'rgba(249, 115, 22, 0.2)', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="uv" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} className="drop-shadow-sm" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>


                    </div>
                </div>

                <footer className="w-full mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500 flex flex-col items-center">
                    <div className="flex space-x-6 mb-4">
                        <a href="#" className="hover:text-zinc-800 dark:hover:text-white">FAQ</a>
                        <a href="#" className="hover:text-zinc-800 dark:hover:text-white">Contact Us</a>
                        <a href="#" className="hover:text-zinc-800 dark:hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-zinc-800 dark:hover:text-white">Terms</a>
                    </div>
                    <p>&copy; 2026 CodeMentor Dashboard UI. All rights reserved.</p>

                </footer>
            </main >
        </div >
    )
}

function NavGroup({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="mt-8 mb-2">
            <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-3 px-3">{title}</h4>
            <div className="space-y-1">{children}</div>
        </div>
    )
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
            {icon}
            <span>{label}</span>
        </button>
    )
}

function SocialIcon({ icon }: { icon: string }) {
    return (
        <a href="#" className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-orange-500 hover:text-white transition-colors text-sm font-bold">
            {icon}
        </a>
    )
}

function PlatformLink({ name, active }: { name: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                    {name[0]}
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-orange-500 transition-colors">{name}</span>
            </div>
            <div className="flex items-center space-x-2">
                {active && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                <MoveUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    )
}

function StatCard({ title, value }: { title: string, value: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm col-span-1 flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-sm font-medium text-zinc-500 mb-1">{title}</h3>
            <p className="text-[42px] font-extrabold leading-none tracking-tight">{value}</p>
            <div className="absolute top-4 right-4 text-zinc-300 dark:text-zinc-700">
                <Activity className="w-12 h-12 opacity-20" />
            </div>
        </div>
    )
}


function DonutSection({ title, data, total, stats, colors = ['text-emerald-500', 'text-yellow-500'] }: any) {
    return (
        <div className="w-full mb-8">
            <h4 className="text-sm font-bold text-center mb-4">{title}</h4>
            <div className="flex items-center justify-center space-x-6">
                <div className="w-28 h-28 relative">
                    {/* Ring background */}
                    <div className="absolute inset-0 rounded-full border-[8px] border-zinc-100 dark:border-zinc-800"></div>

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={46}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xl">
                        {total}
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    {Object.entries(stats).map(([key, val], idx) => (
                        <div key={key} className="flex items-center justify-between text-xs font-semibold">
                            <span className={colors[idx % colors.length]}>{key}</span>
                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-700 dark:text-zinc-300">{val as number}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
