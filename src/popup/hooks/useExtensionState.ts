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
  studentLevel: 'beginner' | 'intermediate' | 'expert'
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
    dataCollection: false,
    studentLevel: 'intermediate'
  })

  // 🔹 Load initial state
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

  // 🔹 Listen for storage updates
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

      // ⭐ Force re-render when hints update
    if (changes.latestHints) {
  console.log("Hints updated:", changes.latestHints.newValue)

  // force rerender
  setCurrentProblem(prev => prev ? { ...prev } : prev)
}

    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => chrome.storage.onChanged.removeListener(handleStorageChange)

  }, [])

  // 🔹 Toggle extension
  const toggleExtension = useCallback(async () => {
    const newEnabled = !isEnabled
    const newSettings = { ...settings, enabled: newEnabled }

    try {
      await chrome.storage.local.set({ settings: newSettings })
      setIsEnabled(newEnabled)
    } catch (error) {
      console.error('Failed to toggle extension:', error)
    }
  }, [isEnabled, settings])

  // 🔹 Update settings
  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }

    try {
      await chrome.storage.local.set({ settings: updatedSettings })
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }, [settings])

  // 🔹 Save progress
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

  // 🔹 RESET progress
  const resetProgress = useCallback(async () => {
    await chrome.storage.local.remove('userProgress')
    setProgress({})
  }, [])

  // ⭐⭐⭐⭐⭐ IMPORTANT FIX ⭐⭐⭐⭐⭐
  // 🔹 READ hints from storage (NOT API)
const getHints = async () => {
  try {
    const result = await chrome.storage.local.get("latestHints")

    if (!result.latestHints || !result.latestHints.hints) return []

    return result.latestHints.hints.map((hint: string, index: number) => ({
      id: index,
      type: "logic",
      message: hint,
      severity: "medium",
      timestamp: Date.now()
    }))
  } catch (err) {
    console.error("Hint read error:", err)
    return []
  }
}


  // 🔹 Send code to AI
  const sendCodeToAI = useCallback(async (code: string, language: string, problemId: string) => {
    try {
      return await chrome.runtime.sendMessage({
        type: 'SEND_CODE_TO_AI',
        data: { code, language, problemId }
      })
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
    getHints,
    sendCodeToAI
  }
}
