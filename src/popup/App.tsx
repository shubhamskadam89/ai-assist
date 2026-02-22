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
import HintPanel from "./components/HintPanel"
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
    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100">
            <div className="p-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-md text-white dark:text-zinc-900">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-base font-medium tracking-tight">CodeMentor</h1>
          </div>
          <button
            onClick={toggleExtension}
            className={`p-2 rounded-lg transition-all duration-300 shadow-sm ${isEnabled
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            title={isEnabled ? 'Extension Active' : 'Extension Inactive'}
          >
            {isEnabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>

        {currentProblem && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 text-sm text-zinc-800 dark:text-zinc-200">
              <Target className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="truncate font-medium">{currentProblem.title}</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentProblem.language}</span>
              </span>
              <span className="flex items-center space-x-1 bg-zinc-200/50 dark:bg-zinc-700/50 px-1.5 py-0.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{progress[currentProblem.id]?.attempts || 0} attempts</span>
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 relative flex items-center justify-center space-x-2 py-3.5 px-4 text-sm font-medium transition-colors ${isActive
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-t-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
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
      <div className="p-3 bg-transparent border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          <span>v1.0.0</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={resetProgress}
              className="flex items-center space-x-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              title="Reset Progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <a
              href="#"
              className="flex items-center space-x-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              title="Open Dashboard"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
