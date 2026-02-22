import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { ProfileCard } from './components/ProfileCard'
import { StatCard } from './components/StatCard'
import { HeatmapSection } from './components/HeatmapSection'
import { DonutSection } from './components/DonutChartCard'
import { RatingChart } from './components/RatingChart'

import { PlaceholderView } from './components/PlaceholderView'

// Interface matching Backend DTO
// TODO: Consider moving this into `types/` later for further abstraction
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

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState('Portfolio')
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // TODO: Replace 'test_user' with actual auth session handle when auth is implemented
                const handle = 'test_user';
                const response = await fetch(`http://localhost:8080/api/v1/dashboard/stats/${handle}`);

                if (response.ok) {
                    const data: DashboardData = await response.json();
                    setDashboardData(data);
                } else {
                    console.error("Failed to fetch dashboard stats.");
                }
            } catch (error) {
                console.error("Error connecting to backend dashboard API:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white h-screen overflow-hidden items-center justify-center">
                <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!dashboardData) {
        return (
            <div className="flex bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white h-screen overflow-hidden items-center justify-center">
                <div className="text-xl font-bold bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    Failed to load stats. Ensure Java backend is running on :8080
                </div>
            </div>
        )
    }

    const dsaTotal = dashboardData.dsaStats.reduce((sum, item) => sum + item.value, 0);
    const funTotal = dashboardData.fundamentalsStats.reduce((sum, item) => sum + item.value, 0);
    const totalProblems = dsaTotal + funTotal;

    const dsaStatsMap = dashboardData.dsaStats.reduce((map, item) => {
        map[item.name] = item.value;
        return map;
    }, {} as Record<string, number>);

    const funStatsMap = dashboardData.fundamentalsStats.reduce((map, item) => {
        map[item.name] = item.value;
        return map;
    }, {} as Record<string, number>);


    return (
        <div className="flex bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white h-screen overflow-hidden font-sans selection:bg-orange-500/30">
            {/* Modular Sidebar Component */}
            <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Modular Topbar */}
                <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* Dashboard Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-0">
                    <div className="max-w-[1600px] mx-auto space-y-8">

                        {activeTab === 'Portfolio' ? (
                            <>
                                {/* Title Segment */}
                                <div>
                                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Portfolio Tracking</h1>
                                    <p className="text-zinc-500 font-medium">Synced instantly via CodeMentor extension across LeetCode, HackerRank, GeeksForGeeks.</p>
                                </div>

                                {/* Top Grid Layer */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                                    <ProfileCard studentName={dashboardData.studentName} handle={dashboardData.handle} />

                                    <div className="lg:col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 lg:pl-4">
                                        <StatCard title="Total Problems Solved" value={totalProblems.toString()} />
                                        <StatCard title="Total Active Days" value={dashboardData.totalActiveDays.toString()} />
                                        <StatCard title="Class Tests Taken" value={dashboardData.classTestsTaken.toString()} />
                                        <StatCard title="Avg Test Score" value={dashboardData.avgTestScore + "%"} />

                                        <div className="col-span-2 lg:col-span-4 grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-8 min-h-[160px]">
                                            {/* Component Re-use for the Donut charts */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm col-span-1 xl:col-span-2 flex flex-col sm:flex-row gap-6">
                                                <DonutSection
                                                    title="Data Structures & Algo"
                                                    data={dashboardData.dsaStats}
                                                    total={dsaTotal.toString()}
                                                    stats={dsaStatsMap}
                                                    colors={['text-emerald-500', 'text-yellow-500', 'text-red-500']}
                                                />
                                                <div className="hidden sm:block w-px bg-zinc-100 dark:bg-zinc-800 self-stretch my-2"></div>
                                                <DonutSection
                                                    title="Core Fundamentals"
                                                    data={dashboardData.fundamentalsStats}
                                                    total={funTotal.toString()}
                                                    stats={funStatsMap}
                                                    colors={['text-emerald-500', 'text-yellow-500']}
                                                />
                                            </div>
                                            <HeatmapSection
                                                submissions={totalProblems}
                                                maxStreak={dashboardData.maxStreak}
                                                currStreak={dashboardData.currentStreak}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Full-Width Layers */}
                                <div className="flex flex-col xl:flex-row gap-8 mt-10">
                                    <RatingChart />
                                </div>
                            </>
                        ) : (
                            <PlaceholderView title={activeTab} />
                        )}

                    </div>
                </div>
            </main>
        </div>
    )
}
