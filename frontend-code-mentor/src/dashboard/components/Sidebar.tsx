import { Home, User, Building, FolderGit2, Compass, FileText, Calendar, Trophy, HelpCircle, MessageSquare, LogOut } from 'lucide-react'

export function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
    return (
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
