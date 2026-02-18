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
      <div className="p-3 text-sm text-gray-400">
        No specific hints yet. Keep going!
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2">
      {hints.map((hint) => (
        <div
          key={hint.id}
          className="bg-blue-900/40 border border-blue-500 rounded-lg p-2 text-sm"
        >
          💡 {hint.message}
        </div>
      ))}
    </div>
  )
}
