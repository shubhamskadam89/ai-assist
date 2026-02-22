import { X, Menu, Search, Sun } from 'lucide-react'

export function TopBar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean, setSidebarOpen: (b: boolean) => void }) {
    return (
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
    )
}
