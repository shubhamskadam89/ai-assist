import { useEffect, useState } from "react"

interface Hint {
  id: number
  message: string
  type?: string
  severity?: string
}

export default function HintPanel() {
  const [hints, setHints] = useState<Hint[]>([])

  // Load hints when popup opens
  useEffect(() => {
    chrome.storage.local.get(["latestHints"], (result) => {
      if (result.latestHints) {
        console.log("Loaded hints from storage:", result.latestHints)
        setHints(result.latestHints)
      }
    })

    // Listen for live updates
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "HINT_UPDATE") {
        console.log("Received live hint update:", msg.data)
        setHints(msg.data.hints || [])
      }
    })
  }, [])

  if (!hints.length) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-xl shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
          💡
        </div>
        <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
          No specific hints yet. Keep thinking!
        </p>
      </div>
    )
  }

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
}
