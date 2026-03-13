import { Copy, GitCompare, RotateCcw } from 'lucide-react'
import { useState } from 'react'

type DiffLine = {
  type: 'add' | 'remove' | 'equal'
  value: string
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const m = oldLines.length
  const n = newLines.length

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to produce diff
  const result: DiffLine[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: 'equal', value: oldLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', value: newLines[j - 1] })
      j--
    } else {
      result.unshift({ type: 'remove', value: oldLines[i - 1] })
      i--
    }
  }

  return result
}

function toPatch(diff: DiffLine[]): string {
  return diff
    .map((line) => {
      if (line.type === 'add') return `+ ${line.value}`
      if (line.type === 'remove') return `- ${line.value}`
      return `  ${line.value}`
    })
    .join('\n')
}

export default function TextDiff() {
  const [original, setOriginal] = useState('')
  const [modified, setModified] = useState('')
  const [diff, setDiff] = useState<DiffLine[] | null>(null)
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<'unified' | 'split'>('unified')

  const handleCompare = () => {
    setDiff(computeDiff(original, modified))
    setCopied(false)
  }

  const handleReset = () => {
    setOriginal('')
    setModified('')
    setDiff(null)
    setCopied(false)
  }

  const handleCopy = () => {
    if (!diff) return
    navigator.clipboard.writeText(toPatch(diff))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = diff
    ? {
        added: diff.filter((l) => l.type === 'add').length,
        removed: diff.filter((l) => l.type === 'remove').length,
        equal: diff.filter((l) => l.type === 'equal').length,
      }
    : null

  // Build split view: align add/remove pairs
  const splitRows: { left: DiffLine | null; right: DiffLine | null }[] = []
  if (diff && view === 'split') {
    let di = 0
    while (di < diff.length) {
      const line = diff[di]
      if (line.type === 'equal') {
        splitRows.push({ left: line, right: line })
        di++
      } else {
        // Collect consecutive remove/add block
        const removes: DiffLine[] = []
        const adds: DiffLine[] = []
        while (di < diff.length && diff[di].type === 'remove') {
          removes.push(diff[di++])
        }
        while (di < diff.length && diff[di].type === 'add') {
          adds.push(diff[di++])
        }
        const maxLen = Math.max(removes.length, adds.length)
        for (let k = 0; k < maxLen; k++) {
          splitRows.push({ left: removes[k] ?? null, right: adds[k] ?? null })
        }
      }
    }
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Text Diff</h3>
        <p className="text-sm text-gray-600">
          Compare two pieces of text and visualize the differences line by line.
        </p>
      </div>

      {/* Input area */}
      <div className="grid grid-cols-2 gap-4 mb-4" style={{ height: '220px' }}>
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Original</span>
          </div>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text here..."
            className="flex-1 p-3 font-mono text-sm resize-none focus:outline-none"
          />
        </div>
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Modified</span>
          </div>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text here..."
            className="flex-1 p-3 font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleCompare}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
        >
          <GitCompare className="w-4 h-4" />
          Compare
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        {diff && (
          <>
            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300 ml-2">
              <button
                onClick={() => setView('unified')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'unified'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unified
              </button>
              <button
                onClick={() => setView('split')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Split
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="ml-auto px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy patch'}
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex gap-4 mb-3">
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-mono">
            +{stats.added} added
          </span>
          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-mono">
            -{stats.removed} removed
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono">
            {stats.equal} unchanged
          </span>
        </div>
      )}

      {/* Diff output */}
      {diff && (
        <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-300 shadow-sm font-mono text-sm min-h-0">
          {view === 'unified' ? (
            <table className="w-full border-collapse">
              <tbody>
                {(() => {
                  let leftLine = 0
                  let rightLine = 0
                  return diff.map((line, idx) => {
                    if (line.type === 'equal') {
                      leftLine++
                      rightLine++
                    } else if (line.type === 'remove') {
                      leftLine++
                    } else {
                      rightLine++
                    }
                    const currentLeft = line.type !== 'add' ? leftLine : undefined
                    const currentRight = line.type !== 'remove' ? rightLine : undefined

                    return (
                      <tr
                        key={idx}
                        className={
                          line.type === 'add'
                            ? 'bg-green-50'
                            : line.type === 'remove'
                              ? 'bg-red-50'
                              : 'bg-white'
                        }
                      >
                        <td className="w-10 px-2 py-0.5 text-right text-gray-400 text-xs select-none border-r border-gray-200 bg-gray-50">
                          {currentLeft ?? ''}
                        </td>
                        <td className="w-10 px-2 py-0.5 text-right text-gray-400 text-xs select-none border-r border-gray-200 bg-gray-50">
                          {currentRight ?? ''}
                        </td>
                        <td
                          className={`w-6 px-2 py-0.5 text-center select-none font-bold border-r border-gray-200 ${
                            line.type === 'add'
                              ? 'text-green-600 bg-green-100'
                              : line.type === 'remove'
                                ? 'text-red-600 bg-red-100'
                                : 'text-gray-300'
                          }`}
                        >
                          {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                        </td>
                        <td
                          className={`px-3 py-0.5 whitespace-pre ${
                            line.type === 'add'
                              ? 'text-green-800'
                              : line.type === 'remove'
                                ? 'text-red-800'
                                : 'text-gray-700'
                          }`}
                        >
                          {line.value}
                        </td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-10 px-2 py-1 text-xs text-gray-400 font-normal border-r border-gray-200">#</th>
                  <th className="px-3 py-1 text-xs text-gray-600 font-medium text-left border-r border-gray-300 w-1/2">
                    Original
                  </th>
                  <th className="w-10 px-2 py-1 text-xs text-gray-400 font-normal border-r border-gray-200">#</th>
                  <th className="px-3 py-1 text-xs text-gray-600 font-medium text-left w-1/2">Modified</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let leftLine = 0
                  let rightLine = 0
                  return splitRows.map((row, idx) => {
                    if (row.left?.type === 'remove') leftLine++
                    else if (row.left?.type === 'equal') leftLine++
                    if (row.right?.type === 'add') rightLine++
                    else if (row.right?.type === 'equal') rightLine++

                    return (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="w-10 px-2 py-0.5 text-right text-gray-400 text-xs select-none border-r border-gray-200 bg-gray-50">
                          {row.left ? leftLine : ''}
                        </td>
                        <td
                          className={`px-3 py-0.5 whitespace-pre border-r border-gray-300 w-1/2 ${
                            row.left?.type === 'remove'
                              ? 'bg-red-50 text-red-800'
                              : row.left?.type === 'equal'
                                ? 'text-gray-700'
                                : 'bg-gray-50'
                          }`}
                        >
                          {row.left?.value ?? ''}
                        </td>
                        <td className="w-10 px-2 py-0.5 text-right text-gray-400 text-xs select-none border-r border-gray-200 bg-gray-50">
                          {row.right ? rightLine : ''}
                        </td>
                        <td
                          className={`px-3 py-0.5 whitespace-pre w-1/2 ${
                            row.right?.type === 'add'
                              ? 'bg-green-50 text-green-800'
                              : row.right?.type === 'equal'
                                ? 'text-gray-700'
                                : 'bg-gray-50'
                          }`}
                        >
                          {row.right?.value ?? ''}
                        </td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!diff && (
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-dashed border-gray-300 text-gray-400 text-sm">
          Paste text in both panels and click Compare
        </div>
      )}
    </div>
  )
}
