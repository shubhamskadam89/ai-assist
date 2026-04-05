import { useEffect, useState } from "react"
import { Lightbulb, Clock } from "lucide-react"

interface HintEntry {
  id: number
  message: string
  type?: string
  severity?: string
  timestamp?: number
  problemTitle?: string
}

const levelColors: Record<string, string> = {
  SYNTAX: 'border-l-red-500',
  LOGIC: 'border-l-yellow-500',
  PERFORMANCE: 'border-l-blue-500',
  HINT: 'border-l-emerald-500',
  CORRECT: 'border-l-green-600',
}

const levelBg: Record<string, string> = {
  SYNTAX: 'bg-red-50 dark:bg-red-900/20',
  LOGIC: 'bg-yellow-50 dark:bg-yellow-900/20',
  PERFORMANCE: 'bg-blue-50 dark:bg-blue-900/20',
  HINT: 'bg-emerald-50 dark:bg-emerald-900/20',
  CORRECT: 'bg-green-50 dark:bg-green-900/20',
}

function parseHintType(message: string): string {
  const prefixes = ['SYNTAX', 'LOGIC', 'PERFORMANCE', 'CORRECT', 'HINT']
  for (const p of prefixes) {
    if (message.toUpperCase().startsWith(p + ':')) return p
  }
  return 'HINT'
}

export default function HintPanel() {
  const [hints, setHints] = useState<HintEntry[]>([])
  const [history, setHistory] = useState<HintEntry[]>([])
  const [view, setView] = useState<'latest' | 'history'>('latest')

  const loadHints = () => {
    chrome.storage.local.get(['latestHints', 'hintHistory'], (result) => {
      // Load latest hints
      if (result.latestHints) {
        const raw = result.latestHints
        // Support both array of {message} and array of strings
        if (Array.isArray(raw)) {
          setHints(raw.map((h: any, i: number) => ({
            id: i,
            message: typeof h === 'string' ? h : h.message,
            timestamp: h.timestamp || Date.now()
          })))
        } else if (raw.hints && Array.isArray(raw.hints)) {
          setHints(raw.hints.map((h: any, i: number) => ({
            id: i,
            message: typeof h === 'string' ? h : h.message,
            timestamp: h.timestamp || Date.now()
          })))
        }
      }

      // Load full history
      if (result.hintHistory && Array.isArray(result.hintHistory)) {
        setHistory(result.hintHistory)
      }
    })
  }

  useEffect(() => {
    loadHints()

    // Listen for storage changes in real-time
    const handleChange = (changes: any) => {
      if (changes.latestHints || changes.hintHistory) {
        loadHints()
      }
    }
    chrome.storage.onChanged.addListener(handleChange)

    // Also listen for runtime messages
    const handleMsg = (msg: any) => {
      if (msg.type === 'HINT_UPDATE') {
        loadHints()
      }
    }
    chrome.runtime.onMessage.addListener(handleMsg)

    return () => {
      chrome.storage.onChanged.removeListener(handleChange)
      chrome.runtime.onMessage.removeListener(handleMsg)
    }
  }, [])

  const displayHints = view === 'latest' ? hints : history

  return (
    <div className="h-full flex flex-col">
      {/* Tab toggle */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700 px-4 pt-2">
        <button
          onClick={() => setView('latest')}
          className={`text-xs font-semibold pb-2 mr-4 border-b-2 transition-colors ${view === 'latest' ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-zinc-400'}`}
        >
          Latest Hint
        </button>
        <button
          onClick={() => setView('history')}
          className={`text-xs font-semibold pb-2 border-b-2 transition-colors flex items-center gap-1 ${view === 'history' ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-zinc-400'}`}
        >
          <Clock className="w-3 h-3" /> History ({history.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {displayHints.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-3 pt-8">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-xl shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
              <Lightbulb className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
              {view === 'latest' ? 'Click "Get Hint" on a LeetCode problem to get started!' : 'No hint history yet.'}
            </p>
          </div>
        ) : (
          displayHints.map((hint) => {
            const prefix = parseHintType(hint.message)
            const colorClass = levelColors[prefix] || levelColors.HINT
            const bgClass = levelBg[prefix] || levelBg.HINT
            const cleanMsg = hint.message.replace(new RegExp(`^${prefix}:\\s*`, 'i'), '')

            return (
              <div
                key={hint.id}
                className={`${bgClass} border border-l-4 ${colorClass} dark:border-zinc-700/80 shadow-sm rounded-xl p-3.5 text-[13px] text-zinc-800 dark:text-zinc-200 transition-all hover:shadow-md`}
              >
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-500" />
                  <div className="flex-1">
                    {(view === 'history' && hint.problemTitle) && (
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">{hint.problemTitle}</p>
                    )}
                    <div className="leading-relaxed font-medium">{cleanMsg}</div>
                    <span className="text-[10px] text-zinc-400 mt-1 block">{prefix}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
