import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Code, 
  Zap,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { useExtensionState } from '../hooks/useExtensionState'
import { mockHints } from '../../data/mockHints'

type HintType = 'syntax' | 'logic' | 'performance' | 'best-practice'

interface Hint {
  id: number
  type: HintType
  message: string
  severity: 'low' | 'medium' | 'high'
  line?: number
  timestamp: number
}

const HintPanel: React.FC = () => {
  const { currentProblem, settings } = useExtensionState()
  const [hints, setHints] = useState<Hint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAllHints, setShowAllHints] = useState(true)
  const [filter, setFilter] = useState<HintType | 'all'>('all')

  useEffect(() => {
    if (currentProblem && settings.showHints) {
      loadHints()
    }
  }, [currentProblem, settings.showHints])

  const loadHints = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For now, use mock data
      const mockData = mockHints.map(hint => ({
        ...hint,
        timestamp: Date.now() - Math.random() * 10000
      }))
      
      setHints(mockData)
    } catch (error) {
      console.error('Failed to load hints:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getHintIcon = (type: HintType) => {
    switch (type) {
      case 'syntax':
        return <Code className="w-4 h-4" />
      case 'logic':
        return <AlertCircle className="w-4 h-4" />
      case 'performance':
        return <Zap className="w-4 h-4" />
      case 'best-practice':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getHintColor = (type: HintType, severity: string) => {
    const baseColors = {
      syntax: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      logic: 'bg-red-100 text-red-800 border-red-200',
      performance: 'bg-purple-100 text-purple-800 border-purple-200',
      'best-practice': 'bg-green-100 text-green-800 border-green-200'
    }

    const severityModifiers = {
      low: 'opacity-70',
      medium: '',
      high: 'ring-2 ring-opacity-50'
    }

    return `${baseColors[type]} ${severityModifiers[severity as keyof typeof severityModifiers]}`
  }

  const filteredHints = hints.filter(hint => 
    filter === 'all' || hint.type === filter
  )

  const visibleHints = showAllHints ? filteredHints : filteredHints.slice(0, 3)

  if (!settings.showHints) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Hints Disabled
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enable hints in settings to see real-time code suggestions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Code Hints
          </h2>
          <button
            onClick={loadHints}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            title="Refresh Hints"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-3">
          {(['all', 'syntax', 'logic', 'performance', 'best-practice'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === filterType
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterType === 'all' ? 'All' : filterType.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredHints.length} hint{filteredHints.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowAllHints(!showAllHints)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showAllHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAllHints ? 'Show Less' : 'Show All'}</span>
          </button>
        </div>
      </div>

      {/* Hints List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : visibleHints.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Hints Available
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start coding to see real-time hints and suggestions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {visibleHints.map((hint, index) => (
                <motion.div
                  key={hint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getHintColor(hint.type, hint.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getHintIcon(hint.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {hint.type.replace('-', ' ')}
                        </span>
                        {hint.line && (
                          <span className="text-xs opacity-75">
                            Line {hint.line}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed">
                        {hint.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-xs opacity-75">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(hint.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {!showAllHints && filteredHints.length > 3 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowAllHints(true)}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Show {filteredHints.length - 3} more hints
          </button>
        </div>
      )}
    </div>
  )
}

export { HintPanel }
