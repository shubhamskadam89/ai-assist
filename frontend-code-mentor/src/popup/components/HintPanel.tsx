import { useEffect, useState } from "react"

interface Hint {
  id: number
  message: string
  type?: string
  severity?: string
}

export default function HintPanel() {
  const [hints, setHints] = useState<Hint[]>([])
  const [loading, setLoading] = useState(false)

  // Load hints when popup opens
  useEffect(() => {
    chrome.storage.local.get(["latestHints"], (result) => {
      if (result.latestHints) {
        console.log("Loaded hints from storage:", result.latestHints)
        setHints(result.latestHints)
      }
    })

    // Listen for live updates
    const messageListener = (msg: any) => {
      if (msg.type === "HINT_UPDATE") {
        console.log("Received live hint update:", msg.data)
        setHints(msg.data.hints || [])
        setLoading(false)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  const requestHint = () => {
    setLoading(true)
    chrome.runtime.sendMessage({ type: "REQUEST_HINT" }, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to request hint:", chrome.runtime.lastError)
        setLoading(false)
      }

      // Failsafe reset if the process stalls
      setTimeout(() => setLoading(false), 30000)
    })
  }

  return (
    <div className="flex flex-col h-full h-[calc(100vh-140px)]">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <button
          onClick={requestHint}
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-[13px] font-medium transition-all ${loading
            ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 cursor-wait'
            : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-sm'
            }`}
        >
          <span>{loading ? 'Analyzing Code...' : 'Ask for a Hint'}</span>
        </button>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="w-full mt-2 py-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          View Full Dashboard
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hints.length ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 h-full">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-xl shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
              💡
            </div>
            <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
              No specific hints yet. Request one!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {hints.map((hint) => (
              <div
                key={hint.id}
                className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm rounded-xl border-l-4 border-l-zinc-900 dark:border-l-zinc-100 p-3.5 text-[13px] text-zinc-800 dark:text-zinc-200 transition-all hover:shadow-md"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-base leading-none block mt-0.5">💡</span>
                  <div className="leading-relaxed font-medium">{hint.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div >
  )
}
