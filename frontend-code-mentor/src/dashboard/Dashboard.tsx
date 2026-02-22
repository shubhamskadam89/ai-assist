import { useEffect, useState } from 'react'
import { Activity, Code2, Award, TerminalSquare, Settings, BarChart2 } from 'lucide-react'

interface UserProgress {
    attempts: number
    hintsUsed: string[]
    timeSpent: number
    lastAttempt: number
}

interface ProgressData {
    [problemId: string]: UserProgress
}

export default function Dashboard() {
    const [progress, setProgress] = useState<ProgressData>({})
    const [totalProblems, setTotalProblems] = useState(0)
    const [totalAttempts, setTotalAttempts] = useState(0)
    const [totalHints, setTotalHints] = useState(0)

    useEffect(() => {
        chrome.storage.local.get(['userProgress', 'settings'], (result) => {
            const data = result.userProgress || {}
            setProgress(data)

            const problems = Object.keys(data).length
            setTotalProblems(problems)

            let attempts = 0
            let hints = 0

            Object.values(data).forEach((p: any) => {
                attempts += p.attempts || 0
                hints += (p.hintsUsed?.length) || 0
            })

            setTotalAttempts(attempts)
            setTotalHints(hints)

            // Toggle dark mode based on settings
            if (result.settings?.theme === 'dark') {
                document.documentElement.classList.add('dark')
            }
        })
    }, [])

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8 pb-20">
            <div className="max-w-5xl mx-auto space-y-10">

                <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center shadow-md">
                            <TerminalSquare className="w-6 h-6 text-zinc-100 dark:text-zinc-900" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">CodeMentor Dashboard</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Your personal coding analytics page.</p>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </button>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Code2 className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-zinc-600 dark:text-zinc-400">Problems Solved</h3>
                        </div>
                        <p className="text-4xl font-bold">{totalProblems}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-zinc-600 dark:text-zinc-400">Total Attempts</h3>
                        </div>
                        <p className="text-4xl font-bold">{totalAttempts}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                <Award className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-zinc-600 dark:text-zinc-400">Total Hints Used</h3>
                        </div>
                        <p className="text-4xl font-bold">{totalHints}</p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center space-x-2 mb-6">
                        <BarChart2 className="w-5 h-5 text-zinc-500" />
                        <h2 className="text-xl font-bold tracking-tight">Recent Activity Details</h2>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                        {Object.keys(progress).length === 0 ? (
                            <div className="p-12 text-center text-zinc-500 font-medium">
                                No problems attempted yet. Start coding to populate your dashboard!
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                                        <th className="p-4">Problem Name</th>
                                        <th className="p-4">Attempts</th>
                                        <th className="p-4">Hints Used</th>
                                        <th className="p-4">Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[15px] font-medium">
                                    {Object.keys(progress).map((pid, idx) => (
                                        <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="p-4">
                                                <a
                                                    href={pid.startsWith('http') ? pid : `https://leetcode.com/problems/${pid.replace('leetcode_', '')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    {pid.replace('leetcode_', '').split('-').map(word => Math.max(0, word.length) > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : '').join(' ')}
                                                </a>
                                            </td>
                                            <td className="p-4">{progress[pid].attempts}</td>
                                            <td className="p-4">
                                                <span className="inline-flex px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
                                                    {progress[pid].hintsUsed?.length || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-zinc-500 text-sm">
                                                {progress[pid].lastAttempt ? new Date(progress[pid].lastAttempt).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

            </div >
        </div >
    )
}
