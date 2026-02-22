import { Trophy, Medal, ChevronUp, ChevronDown, Minus, ArrowRight } from 'lucide-react'

export function LeaderboardView() {
    // Mock Data
    const students = [
        { rank: 1, name: "Shubham Kadam", handle: "shubhamskadam89", score: 2450, problems: 342, trend: "up", avatar: "🦊" },
        { rank: 2, name: "Alice Chen", handle: "alice_codes", score: 2310, problems: 315, trend: "same", avatar: "🐼" },
        { rank: 3, name: "David Miller", handle: "dmiller99", score: 2150, problems: 289, trend: "down", avatar: "🦁" },
        { rank: 4, name: "Sarah Jenkins", handle: "sarahj_dev", score: 1980, problems: 245, trend: "up", avatar: "🐨" },
        { rank: 5, name: "Michael Chang", handle: "mchang_coder", score: 1850, problems: 210, trend: "up", avatar: "🐯" },
        { rank: 6, name: "Elena Rodriguez", handle: "elena_r", score: 1720, problems: 188, trend: "same", avatar: "🐰" },
        { rank: 7, name: "James Wilson", handle: "jwilson_01", score: 1650, problems: 175, trend: "down", avatar: "🐻" },
    ];

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" fill="currentColor" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-zinc-400" fill="currentColor" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" fill="currentColor" />;
        return <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400 w-6 text-center">{rank}</span>;
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <ChevronUp className="w-4 h-4 text-emerald-500" />;
        if (trend === 'down') return <ChevronDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-zinc-400" />;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">Class Leaderboard</h2>
                    <p className="text-zinc-500 font-medium tracking-wide">CS401 - Data Structures & Algorithms II - Fall 2026</p>
                </div>
                <div className="flex space-x-3">
                    <select className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>Global Rank</option>
                        <option>Class Rank</option>
                        <option>University Rank</option>
                    </select>
                </div>
            </div>

            {/* Top 3 Podium Cards - Visible on larger screens primarily, scaling down */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transform md:translate-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-4 relative">
                        {students[1].avatar}
                        <div className="absolute -top-3 -right-3">{getRankIcon(2)}</div>
                    </div>
                    <h3 className="font-bold text-lg">{students[1].name}</h3>
                    <p className="text-sm text-zinc-500 mb-4">@{students[1].handle}</p>
                    <div className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300 font-extrabold text-sm mb-2">
                        {students[1].score} pts
                    </div>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 bg-gradient-to-b from-orange-50 to-white dark:from-orange-500/10 dark:to-zinc-900 border-2 border-orange-200 dark:border-orange-500/30 rounded-2xl p-6 shadow-md shadow-orange-500/5 flex flex-col items-center text-center transform md:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
                    <div className="w-20 h-20 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-4xl mb-4 relative ring-4 ring-white dark:ring-zinc-900">
                        {students[0].avatar}
                        <div className="absolute -top-4 -right-4 drop-shadow-md">{getRankIcon(1)}</div>
                    </div>
                    <h3 className="font-extrabold text-xl">{students[0].name}</h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-4">@{students[0].handle}</p>
                    <div className="px-5 py-2 bg-orange-500 text-white rounded-full font-extrabold shadow-sm mb-2">
                        {students[0].score} pts
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transform md:translate-y-8">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-4 relative">
                        {students[2].avatar}
                        <div className="absolute -top-3 -right-3">{getRankIcon(3)}</div>
                    </div>
                    <h3 className="font-bold text-lg">{students[2].name}</h3>
                    <p className="text-sm text-zinc-500 mb-4">@{students[2].handle}</p>
                    <div className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300 font-extrabold text-sm mb-2">
                        {students[2].score} pts
                    </div>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                                <th className="px-6 py-4 font-bold w-20 text-center">Rank</th>
                                <th className="px-6 py-4 font-bold">Student</th>
                                <th className="px-6 py-4 font-bold text-right">Problems Solved</th>
                                <th className="px-6 py-4 font-bold text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {students.slice(3).map((student) => (
                                <tr key={student.rank} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center text-center justify-center space-x-2">
                                            <span className="text-zinc-500 font-bold">{student.rank}</span>
                                            {getTrendIcon(student.trend)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">
                                                {student.avatar}
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-900 dark:text-white">{student.name}</div>
                                                <div className="text-xs text-zinc-500">@{student.handle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{student.problems}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            <span className="font-extrabold text-orange-600 dark:text-orange-400">{student.score}</span>
                                            <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
