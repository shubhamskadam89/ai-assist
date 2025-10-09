import { useState, useEffect, useCallback } from 'react'

interface ProblemInfo {
  id: string
  title: string
  language: string
  platform: string
  difficulty?: string
}

interface ProgressData {
  attempts: number
  hintsUsed: number[]
  timeSpent: number
  lastAttempt: number
  solved: boolean
  difficulty: string
}

interface Settings {
  theme: 'light' | 'dark' | 'system'
  enabled: boolean
  showHints: boolean
  showProgress: boolean
  autoCapture: boolean
  notifications: boolean
  dataCollection: boolean
}

export const useExtensionState = () => {
  const [isEnabled, setIsEnabled] = useState(true)
  const [currentProblem, setCurrentProblem] = useState<ProblemInfo | null>(null)
  const [progress, setProgress] = useState<Record<string, ProgressData>>({})
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    enabled: true,
    showHints: true,
    showProgress: true,
    autoCapture: true,
    notifications: true,
    dataCollection: false
  })

  // Load initial state from Chrome storage
  useEffect(() => {
    const loadState = async () => {
      try {
        const result = await chrome.storage.local.get([
          'settings',
          'userProgress',
          'currentProblem'
        ])

        if (result.settings) {
          setSettings(result.settings)
          setIsEnabled(result.settings.enabled)
        }

        if (result.userProgress) {
          setProgress(result.userProgress)
        }

        if (result.currentProblem) {
          setCurrentProblem(result.currentProblem)
        }
      } catch (error) {
        console.error('Failed to load extension state:', error)
      }
    }

    loadState()
  }, [])

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.settings) {
        setSettings(changes.settings.newValue)
        setIsEnabled(changes.settings.newValue.enabled)
      }
      if (changes.userProgress) {
        setProgress(changes.userProgress.newValue)
      }
      if (changes.currentProblem) {
        setCurrentProblem(changes.currentProblem.newValue)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  const toggleExtension = useCallback(async () => {
    const newEnabled = !isEnabled
    const newSettings = { ...settings, enabled: newEnabled }
    
    try {
      await chrome.storage.local.set({ settings: newSettings })
      setIsEnabled(newEnabled)
      
      // Send message to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_EXTENSION',
          enabled: newEnabled
        })
      }
    } catch (error) {
      console.error('Failed to toggle extension:', error)
    }
  }, [isEnabled, settings])

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    
    try {
      await chrome.storage.local.set({ settings: updatedSettings })
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }, [settings])

  const saveProgress = useCallback(async (problemId: string, data: Partial<ProgressData>) => {
    const currentProgress = progress[problemId] || {
      attempts: 0,
      hintsUsed: [],
      timeSpent: 0,
      lastAttempt: Date.now(),
      solved: false,
      difficulty: 'unknown'
    }

    const updatedProgress = {
      ...currentProgress,
      ...data,
      lastAttempt: Date.now()
    }

    const newProgress = {
      ...progress,
      [problemId]: updatedProgress
    }

    try {
      await chrome.storage.local.set({ userProgress: newProgress })
      setProgress(newProgress)
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }, [progress])

  const resetProgress = useCallback(async () => {
    try {
      await chrome.storage.local.remove('userProgress')
      setProgress({})
    } catch (error) {
      console.error('Failed to reset progress:', error)
    }
  }, [])

  const exportData = useCallback(async () => {
    try {
      const data = {
        settings,
        progress,
        currentProblem,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `codementor-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }, [settings, progress, currentProblem])

  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (data.settings) {
        await chrome.storage.local.set({ settings: data.settings })
        setSettings(data.settings)
      }

      if (data.progress) {
        await chrome.storage.local.set({ userProgress: data.progress })
        setProgress(data.progress)
      }

      if (data.currentProblem) {
        await chrome.storage.local.set({ currentProblem: data.currentProblem })
        setCurrentProblem(data.currentProblem)
      }
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }, [])

  const getHints = useCallback(async (code: string, language: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await chrome.runtime.sendMessage({
        type: 'GET_HINTS',
        data: { code, language }
      })
      return response
    } catch (error) {
      console.error('Failed to get hints:', error)
      return []
    }
  }, [])

  const sendCodeToAI = useCallback(async (code: string, language: string, problemId: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SEND_CODE_TO_AI',
        data: { code, language, problemId }
      })
      return response
    } catch (error) {
      console.error('Failed to send code to AI:', error)
      return null
    }
  }, [])

  return {
    isEnabled,
    currentProblem,
    progress,
    settings,
    toggleExtension,
    updateSettings,
    saveProgress,
    resetProgress,
    exportData,
    importData,
    getHints,
    sendCodeToAI
  }
}
