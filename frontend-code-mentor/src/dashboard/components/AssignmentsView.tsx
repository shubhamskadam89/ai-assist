import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export function AssignmentsView() {
    const assignments = [
        {
            id: 1,
            title: "Advanced Graph Algorithms",
            course: "CS401 - Data Structures II",
            dueDate: "Tomorrow, 11:59 PM",
            status: "pending",
            progress: 30,
            color: "orange"
        },
        {
            id: 2,
            title: "Dynamic Programming Challenge",
            course: "CS401 - Data Structures II",
            dueDate: "Friday, 11:59 PM",
            status: "pending",
            progress: 0,
            color: "blue"
        },
        {
            id: 3,
            title: "Sorting & Searching Fundamentals",
            course: "CS301 - Algorithms",
            dueDate: "Last Week",
            status: "completed",
            progress: 100,
            score: "95/100",
            color: "emerald"
        },
        {
            id: 4,
            title: "Intro to System Design",
            course: "CS500 - Software Eng",
            dueDate: "Oct 15",
            status: "completed",
            progress: 100,
            score: "100/100",
            color: "emerald"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">Class Assignments</h2>
                    <p className="text-zinc-500 font-medium tracking-wide">Track your coursework and upcoming deadlines.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                        Filter
                    </button>
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors">
                        Sync LMS
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {assignments.map(assignment => (
                    <div key={assignment.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">

                        {/* Top Accent Bar */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-${assignment.color}-500 transform origin-left scale-x-100 opacity-80 group-hover:opacity-100 transition-opacity`}></div>

                        <div className="flex items-start justify-between mb-4 mt-2">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-1">{assignment.title}</h3>
                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{assignment.course}</p>
                            </div>
                            {assignment.status === 'completed' ? (
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            ) : (
                                <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-full">
                                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {assignment.dueDate}</span>
                        </div>

                        <div className="mt-auto">
                            {assignment.status === 'pending' ? (
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-zinc-700 dark:text-zinc-300">Progress</span>
                                        <span className="text-orange-500">{assignment.progress}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${assignment.progress}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center py-2 px-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Final Score</span>
                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{assignment.score}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Canvas Integration Active</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400/80">Your assignments are automatically synced from your university's Canvas portal. Grading delays may occur.</p>
                </div>
            </div>
        </div>
    )
}
