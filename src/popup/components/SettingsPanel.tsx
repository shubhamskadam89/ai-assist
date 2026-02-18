import React, { useState, useEffect } from 'react'
import {
  Moon,
  Sun,
  Bell,
  Shield,
  Database,
  Trash2,
  Info,
  ExternalLink,
  Code,
  Lightbulb,
  BarChart3
} from 'lucide-react'
import { useExtensionState } from '../hooks/useExtensionState'

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  enabled: boolean
  showHints: boolean
  showProgress: boolean
  autoCapture: boolean
  notifications: boolean
  dataCollection: boolean
}

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetProgress } = useExtensionState()

  const [localSettings, setLocalSettings] = useState<SettingsState>({
    theme: 'system',
    enabled: true,
    showHints: true,
    showProgress: true,
    autoCapture: true,
    notifications: true,
    dataCollection: false
  })

  useEffect(() => {
    setLocalSettings(prev => ({ ...prev, ...settings }))
  }, [settings])

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    updateSettings(newSettings)
  }

  const SettingItem: React.FC<{
    icon: React.ReactNode
    title: string
    description: string
    children: React.ReactNode
  }> = ({ icon, title, description, children }) => (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  )

  const Toggle: React.FC<{
    enabled: boolean
    onChange: (enabled: boolean) => void
  }> = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Customize your CodeMentor experience
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* General */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            General
          </h3>

          <div className="space-y-3">

            <SettingItem
              icon={<Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Extension Status"
              description="Enable or disable CodeMentor"
            >
              <Toggle
                enabled={localSettings.enabled}
                onChange={(enabled) => handleSettingChange('enabled', enabled)}
              />
            </SettingItem>

            <SettingItem
              icon={localSettings.theme === 'dark'
                ? <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                : <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Theme"
              description="Choose your preferred theme"
            >
              <select
                value={localSettings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </SettingItem>

            <SettingItem
              icon={<Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Notifications"
              description="Receive hints and updates"
            >
              <Toggle
                enabled={localSettings.notifications}
                onChange={(val) => handleSettingChange('notifications', val)}
              />
            </SettingItem>

          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Features
          </h3>

          <div className="space-y-3">

            <SettingItem
              icon={<Lightbulb className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Show Hints"
              description="Display real-time hints"
            >
              <Toggle
                enabled={localSettings.showHints}
                onChange={(val) => handleSettingChange('showHints', val)}
              />
            </SettingItem>

            <SettingItem
              icon={<BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Progress Tracking"
              description="Track your coding progress"
            >
              <Toggle
                enabled={localSettings.showProgress}
                onChange={(val) => handleSettingChange('showProgress', val)}
              />
            </SettingItem>

            <SettingItem
              icon={<Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Auto Capture"
              description="Automatically capture code changes"
            >
              <Toggle
                enabled={localSettings.autoCapture}
                onChange={(val) => handleSettingChange('autoCapture', val)}
              />
            </SettingItem>

          </div>
        </div>

        {/* Privacy */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Privacy
          </h3>

          <SettingItem
            icon={<Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            title="Data Collection"
            description="Allow anonymous analytics"
          >
            <Toggle
              enabled={localSettings.dataCollection}
              onChange={(val) => handleSettingChange('dataCollection', val)}
            />
          </SettingItem>
        </div>

        {/* Reset */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Data
          </h3>

          <SettingItem
            icon={<Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            title="Reset Progress"
            description="Clear all progress data"
          >
            <button
              onClick={resetProgress}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
          </SettingItem>
        </div>

        {/* About */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            About
          </h3>

          <SettingItem
            icon={<Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            title="Version"
            description="CodeMentor v1.0.0"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              v1.0.0
            </span>
          </SettingItem>

          <SettingItem
            icon={<ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            title="Support"
            description="Get help and report issues"
          >
            <span className="text-sm text-blue-600">Help Center</span>
          </SettingItem>

        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Made with ❤️ for developers
        </p>
      </div>

    </div>
  )
}

export { SettingsPanel }
