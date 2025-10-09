import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, 
  Lightbulb, 
  BarChart3, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  ExternalLink,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'
import { HintPanel } from './components/HintPanel'
import { ProgressTracker } from './components/ProgressTracker'
import { SettingsPanel } from './components/SettingsPanel'
import { useExtensionState } from './hooks/useExtensionState'

type TabType = 'hints' | 'progress' | 'settings'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hints')
  const { 
    isEnabled, 
    currentProblem, 
    progress, 
    toggleExtension, 
    resetProgress 
  } = useExtensionState()

  const tabs = [
    { id: 'hints' as TabType, label: 'Hints', icon: Lightbulb },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings }
  ]

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-6 h-6" />
            <h1 className="text-lg font-semibold">CodeMentor</h1>
          </div>
          <button
            onClick={toggleExtension}
            className={`p-2 rounded-lg transition-colors ${
              isEnabled 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
            title={isEnabled ? 'Extension Active' : 'Extension Inactive'}
          >
            {isEnabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
        
        {currentProblem && (
          <div className="mt-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-sm">
              <Target className="w-4 h-4" />
              <span className="truncate">{currentProblem.title}</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-xs opacity-90">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{currentProblem.language}</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>{progress[currentProblem.id]?.attempts || 0} attempts</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'hints' && <HintPanel />}
            {activeTab === 'progress' && <ProgressTracker />}
            {activeTab === 'settings' && <SettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>v1.0.0</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetProgress}
              className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              title="Reset Progress"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <a
              href="#"
              className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              title="Open Dashboard"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
