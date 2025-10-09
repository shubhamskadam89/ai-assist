import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle,
  Calendar,
  Zap,
  BookOpen,
  Lightbulb
} from 'lucide-react'
import { useExtensionState } from '../hooks/useExtensionState'

interface ProgressStats {
  totalProblems: number
  solvedProblems: number
  totalAttempts: number
  totalTimeSpent: number
  hintsUsed: number
  streak: number
  averageAttempts: number
  successRate: number
}

interface ProblemProgress {
  id: string
  title: string
  attempts: number
  hintsUsed: number[]
  timeSpent: number
  lastAttempt: number
  solved: boolean
  difficulty: string
}

const ProgressTracker: React.FC = () => {
  const { progress } = useExtensionState()
  const [stats, setStats] = useState<ProgressStats>({
    totalProblems: 0,
    solvedProblems: 0,
    totalAttempts: 0,
    totalTimeSpent: 0,
    hintsUsed: 0,
    streak: 0,
    averageAttempts: 0,
    successRate: 0
  })
  const [recentProblems, setRecentProblems] = useState<ProblemProgress[]>([])
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    calculateStats()
    loadRecentProblems()
  }, [progress, timeRange])

  const calculateStats = () => {
    const problems = Object.values(progress)
    const totalProblems = problems.length
    const solvedProblems = problems.filter(p => p.solved).length
    const totalAttempts = problems.reduce((sum, p) => sum + p.attempts, 0)
    const totalTimeSpent = problems.reduce((sum, p) => sum + p.timeSpent, 0)
    const hintsUsed = problems.reduce((sum, p) => sum + p.hintsUsed.length, 0)
    const averageAttempts = totalProblems > 0 ? totalAttempts / totalProblems : 0
    const successRate = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0

    setStats({
      totalProblems,
      solvedProblems,
      totalAttempts,
      totalTimeSpent,
      hintsUsed,
      streak: calculateStreak(),
      averageAttempts,
      successRate
    })
  }

  const calculateStreak = () => {
    // Simple streak calculation - in real app, this would be more sophisticated
    const problems = Object.values(progress)
    return problems.filter(p => p.solved).length
  }

  const loadRecentProblems = () => {
    const problems = Object.entries(progress)
      .map(([id, data]) => ({
        id,
        title: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        ...data
      }))
      .sort((a, b) => b.lastAttempt - a.lastAttempt)
      .slice(0, 5)

    setRecentProblems(problems)
  }

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Progress Overview
          </h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Problems</span>
            </div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {stats.solvedProblems}/{stats.totalProblems}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {stats.totalProblems > 0 ? Math.round(stats.successRate) : 0}% success rate
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Streak</span>
            </div>
            <div className="text-lg font-bold text-green-900 dark:text-green-100">
              {stats.streak}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">
              days in a row
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Attempts</span>
            </div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
              {stats.totalAttempts}
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300">
              avg {stats.averageAttempts.toFixed(1)} per problem
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Time</span>
            </div>
            <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
              {formatTime(stats.totalTimeSpent)}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-300">
              total coding time
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.solvedProblems} of {stats.totalProblems}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.totalProblems > 0 ? (stats.solvedProblems / stats.totalProblems) * 100 : 0}%` }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Recent Problems */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Recent Activity
        </h3>
        
        {recentProblems.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Progress Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start solving problems to track your progress
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProblems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {problem.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {problem.solved ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>{problem.attempts} attempts</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Lightbulb className="w-3 h-3" />
                      <span>{problem.hintsUsed.length} hints</span>
                    </span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(problem.lastAttempt)}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { ProgressTracker }
