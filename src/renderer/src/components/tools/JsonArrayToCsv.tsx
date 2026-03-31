import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function JsonArrayToCsv() {
  const [jsonInput, setJsonInput] = useState('')
  const [csvOutput, setCsvOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const toCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return ''
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  const escapeCsvValue = (value: string): string => {
    if (/[,"\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`
    }

    return value
  }

  const convertJsonToCsv = (jsonString: string) => {
    if (!jsonString.trim()) {
      setCsvOutput('')
      return
    }

    try {
      const parsed = JSON.parse(jsonString)

      if (!Array.isArray(parsed)) {
        setCsvOutput('Error converting JSON: Input must be a JSON array of objects')
        return
      }

      if (parsed.length === 0) {
        setCsvOutput('')
        return
      }

      const hasInvalidRows = parsed.some((item) => item === null || typeof item !== 'object' || Array.isArray(item))
      if (hasInvalidRows) {
        setCsvOutput('Error converting JSON: Every array item must be an object')
        return
      }

      const headers: string[] = []
      for (const row of parsed as Array<Record<string, unknown>>) {
        for (const key of Object.keys(row)) {
          if (!headers.includes(key)) {
            headers.push(key)
          }
        }
      }

      const csvRows: string[] = []
      csvRows.push(headers.map(escapeCsvValue).join(','))

      for (const row of parsed as Array<Record<string, unknown>>) {
        const csvRow = headers
          .map((header) => escapeCsvValue(toCellValue(row[header])))
          .join(',')
        csvRows.push(csvRow)
      }

      setCsvOutput(csvRows.join('\n'))
    } catch (error) {
      setCsvOutput(`Error converting JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  const handleConvert = () => {
    convertJsonToCsv(jsonInput)
  }

  const handleReset = () => {
    setJsonInput('')
    setCsvOutput('')
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(csvOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">JSON Array to CSV</h3>
        <p className="text-sm text-gray-600">
          Convert a JSON array of objects into CSV format with automatic header detection.
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Convert
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <label className="text-sm font-medium text-gray-700">JSON Input</label>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON array here...&#10;&#10;Example:&#10;[&#10;  {&quot;name&quot;:&quot;John&quot;,&quot;age&quot;:30},&#10;  {&quot;name&quot;:&quot;Jane&quot;,&quot;age&quot;:25}&#10;]"
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">CSV Output</label>
            {csvOutput && (
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <textarea
            value={csvOutput}
            readOnly
            placeholder="CSV output will appear here..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Features:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Automatic header detection</li>
          <li>✓ Escapes commas, quotes, and line breaks</li>
          <li>✓ Supports nullable and nested values</li>
          <li>✓ Preserves row ordering from input</li>
        </ul>
      </div>
    </div>
  )
}
