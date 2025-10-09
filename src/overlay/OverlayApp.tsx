import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, 
  Lightbulb, 
  X, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Code
} from 'lucide-react'
import { mockHints } from '../data/mockHints'

interface Hint {
  id: number
  type: 'syntax' | 'logic' | 'performance' | 'best-practice'
  message: string
  severity: 'low' | 'medium' | 'high'
  line?: number
  timestamp: number
}

const OverlayApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hints, setHints] = useState<Hint[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load initial hints
    loadHints()
    
    // Listen for messages from content script
    const handleMessage = (message: any) => {
      if (message.type === 'CODE_CAPTURED') {
        loadHints()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const loadHints = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setHints(mockHints.slice(0, 3)) // Show first 3 hints
    } catch (error) {
      console.error('Failed to load hints:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getHintIcon = (type: Hint['type']) => {
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

  // const getHintColor = (type: Hint['type'], severity: string) => {
  //   const baseColors = {
  //     syntax: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  //     logic: 'bg-red-100 text-red-800 border-red-200',
  //     performance: 'bg-purple-100 text-purple-800 border-purple-200',
  //     'best-practice': 'bg-green-100 text-green-800 border-green-200'
  //   }

  //   const severityModifiers = {
  //     low: 'opacity-70',
  //     medium: '',
  //     high: 'ring-2 ring-opacity-50'
  //   }

  //   return `${baseColors[type]} ${severityModifiers[severity as keyof typeof severityModifiers]}`
  // }

  if (!isVisible) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="overlay-panel"
    >
      {/* Header */}
      <div className="overlay-header">
        <div className="flex items-center space-x-2">
          <Code2 className="w-5 h-5" />
          <h3 className="text-sm font-semibold">CodeMentor</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overlay-content"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : hints.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No hints available
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {hints.map((hint) => (
                  <motion.div
                    key={hint.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hint-item"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getHintIcon(hint.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`hint-type ${hint.type}`}>
                            {hint.type.replace('-', ' ')}
                          </span>
                          {hint.line && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Line {hint.line}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {hint.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default OverlayApp
