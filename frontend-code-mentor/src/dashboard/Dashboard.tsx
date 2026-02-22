import { useEffect, useState } from 'react'
import {
    Home, User, Building, FolderGit2, Compass, FileText,
    Calendar, Trophy, HelpCircle, MessageSquare, Edit,
    LogOut, CheckCircle2, Search, Sun, MoveUpRight,
    Menu, X, TerminalSquare, Activity
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

const dsaDonutData = [
    { name: 'Easy', value: 205, color: '#10b981' }, // emerald-500
    { name: 'Medium', value: 242, color: '#eab308' }, // yellow-500
    { name: 'Hard', value: 25, color: '#ef4444' } // red-500
]

const fundamentalsDonutData = [
    { name: 'GFG', value: 17, color: '#10b981' },
    { name: 'HackerRank', value: 44, color: '#eab308' }
]

const cpDonutData = [
    { name: 'CodeChef', value: 115, color: '#10b981' }
]

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
    const heatmapData = generateHeatmap();

    // Load basic saved local data from extension state to show *something* real
    const [localProblemsSolved, setLocalProblemsSolved] = useState(0)

    useEffect(() => {
        chrome.storage?.local?.get(['userProgress', 'settings'], (result) => {
            const data = result.userProgress || {}
            setLocalProblemsSolved(Object.keys(data).length)
            if (result.settings?.theme === 'dark') {
                document.documentElement.classList.add('dark')
            }
        })
    }, [])

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

                    <NavGroup title="QUESTION TRACKER">
                        <NavItem icon={<Building className="w-4 h-4" />} label="Company Wise Kit" />
                        <NavItem icon={<FolderGit2 className="w-4 h-4" />} label="My Workspace" />
                        <NavItem icon={<Compass className="w-4 h-4" />} label="Explore Sheets" />
                        <NavItem icon={<FileText className="w-4 h-4" />} label="My Sheets" />
                        <NavItem icon={<Edit className="w-4 h-4" />} label="Notes" />
                    </NavGroup>

                    <NavGroup title="EVENT TRACKER">
                        <NavItem icon={<Calendar className="w-4 h-4" />} label="Contests" />
                    </NavGroup>

                    <NavGroup title="COMMUNITY">
                        <NavItem icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />
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
                            <span>Company Wise Kit</span>
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
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center relative overflow-hidden shadow-sm">
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <span className="flex items-center space-x-1 text-xs text-zinc-500"><CheckCircle2 className="w-3 h-3 text-orange-500" /> Private</span>
                                </div>
                                <div className="w-28 h-28 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-md mb-4 mt-6 flex items-center justify-center overflow-hidden">
                                    <User className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                                </div>
                                <h2 className="text-xl font-bold">Shubham Kadam</h2>
                                <p className="text-sm text-blue-500 font-medium flex items-center">
                                    @shubhamskadam89 <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-emerald-500" />
                                </p>

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
                                        <PlatformLink name="CodeChef" active />
                                        <PlatformLink name="HackerRank" active />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT DASHBOARD DATA (COL-SPAN-9) */}
                        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                            {/* STAT CARDS */}
                            <StatCard title="Total Questions" value="648" />
                            <StatCard title="Total Active Days" value="234" />

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
                                    <h3 className="text-sm font-medium text-zinc-500">Total Contests</h3>
                                    <p className="text-4xl font-extrabold mt-1">10</p>
                                </div>
                                <div className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">CodeChef</span>
                                    <span className="text-sm font-bold ml-2">10</span>
                                </div>
                            </div>


                            {/* DONUT CHARTS COLUMN (Spans Right) */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm col-span-1 xl:row-span-3 flex flex-col items-center">
                                <h3 className="text-lg font-bold w-full text-center border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">Problems Solved</h3>

                                <DonutSection title="Fundamentals" data={fundamentalsDonutData} total="61" stats={{ GFG: 17, HackerRank: 44 }} />
                                <DonutSection title="DSA" data={dsaDonutData} total="472" stats={{ Easy: 205, Medium: 242, Hard: 25 }} colors={['text-emerald-500', 'text-yellow-500', 'text-red-500']} />
                                <DonutSection title="Competitive Programming" data={cpDonutData} total="115" stats={{ CodeChef: 115 }} />

                            </div>


                            {/* RATING CHART */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm col-span-1 md:col-span-2 xl:col-span-2">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-zinc-500">Rating</h3>
                                        <div className="text-3xl font-extrabold flex items-center space-x-2">
                                            <span>1341</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-zinc-500">30 Apr 2025</p>
                                        <p className="font-bold">Starters 184 (Rated)</p>
                                        <p className="text-xs text-zinc-500">Rank: 2864</p>
                                    </div>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={ratingData}>
                                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 100', 'auto']} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', background: '#18181b', color: '#fff' }}
                                            />
                                            <Line type="monotone" dataKey="uv" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
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
                        <div className="mt-4 p-4 max-w-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200 rounded-xl text-left border border-orange-200 dark:border-orange-900/50">
                            <p className="font-semibold mb-2 flex items-center"><TerminalSquare className="w-4 h-4 mr-2" /> Note on Architecture & Data Fetching</p>
                            <p className="text-xs leading-relaxed opacity-90">
                                This stunning UI currently uses <strong>mock data</strong> to demonstrate the layout. The Chrome Extension's local storage (`chrome.storage.local`) currently only tracks simple live attributes (like you have currently captured <strong>{localProblemsSolved}</strong> problem signals).
                                <br /><br />
                                To populate this entire dashboard dynamically exactly like <em>Codolio</em> across devices, your backend must implement a service that routinely scrapes your linked LeetCode and GeeksForGeeks IDs and stores those full global rating histories into the PostgreSQL DB. Then, this React component would fetch it directly from your Spring Boot REST APIs (e.g., <code className="bg-orange-200/50 dark:bg-orange-900/50 px-1 py-0.5 rounded">await fetch('/api/v1/profile/stats')</code>).
                            </p>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
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
