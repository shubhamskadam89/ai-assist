import React from 'react';

export default function TeacherDashboard() {
    const mockStudents = [
        { prn: '001', name: 'Alice', rank: 1, rating: 4.9 },
        { prn: '002', name: 'Bob', rank: 2, rating: 4.7 },
        { prn: '003', name: 'Charlie', rank: 3, rating: 4.5 },
        { prn: '004', name: 'David', rank: 4, rating: 4.3 },
        { prn: '005', name: 'Eve', rank: 5, rating: 4.1 },
    ];

    return (
        <div className="p-8 bg-zinc-50 dark:bg-black min-h-screen text-zinc-900 dark:text-white">
            <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
            <p className="mb-4">Monitor students assigned to you.</p>
            <table className="min-w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-zinc-700">
                    <tr>
                        <th className="px-4 py-2 text-left">PRN</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Rank</th>
                        <th className="px-4 py-2 text-left">Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {mockStudents.map((student) => (
                        <tr key={student.prn} className="border-t">
                            <td className="px-4 py-2">{student.prn}</td>
                            <td className="px-4 py-2">{student.name}</td>
                            <td className="px-4 py-2">{student.rank}</td>
                            <td className="px-4 py-2">{student.rating}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
