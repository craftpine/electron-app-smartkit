import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import pako from 'pako'

export default function GzipEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'compress' | 'decompress'>('compress')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleCompress = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      const compressed = pako.gzip(input)
      const base64 = btoa(String.fromCharCode(...compressed))
      setOutput(base64)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed')
      setOutput('')
    }
  }

  const handleDecompress = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      // Try to decode from base64
      const binary = atob(input.trim())
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const decompressed = pako.ungzip(bytes, { to: 'string' })
      setOutput(decompressed)
    } catch (err) {
      setError('Invalid gzip data. Make sure the input is base64-encoded gzip data.')
      setOutput('')
    }
  }

  const handleProcess = () => {
    if (mode === 'compress') {
      handleCompress()
    } else {
      handleDecompress()
    }
  }

  const handleReset = () => {
    setInput('')
    setOutput('')
    setError('')
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleModeSwitch = () => {
    setMode(mode === 'compress' ? 'decompress' : 'compress')
    // Swap input and output
    const temp = input
    setInput(output)
    setOutput(temp)
    setError('')
    setCopied(false)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gzip Encoder/Decoder</h3>
        <p className="text-sm text-gray-600">
          Compress text using gzip compression or decompress gzip data. Output is base64-encoded for easy transfer.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleProcess}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
        >
          {mode === 'compress' ? 'Compress' : 'Decompress'}
        </button>
        <button
          onClick={handleModeSwitch}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Switch to {mode === 'compress' ? 'Decompress' : 'Compress'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Input */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'compress' ? 'Text Input' : 'Gzip Data (Base64)'}
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'compress'
                ? 'Enter text to compress...'
                : 'Paste base64-encoded gzip data...'
            }
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'compress' ? 'Compressed Data (Base64)' : 'Decompressed Text'}
            </label>
            {output && (
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
            value={output}
            readOnly
            placeholder={error || `${mode === 'compress' ? 'Compressed' : 'Decompressed'} output will appear here...`}
            className={`flex-1 p-4 font-mono text-sm resize-none focus:outline-none ${error ? 'text-red-600' : 'text-gray-700'} bg-gray-50`}
          />
        </div>
      </div>

      {/* Stats */}
      {input && output && !error && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-6 text-xs text-green-800">
            <div>
              <span className="font-semibold">Input size:</span> {input.length} bytes
            </div>
            <div>
              <span className="font-semibold">Output size:</span> {output.length} bytes
            </div>
            {mode === 'compress' && (
              <div>
                <span className="font-semibold">Compression ratio:</span>{' '}
                {((1 - output.length / input.length) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Features:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Compress text using gzip algorithm</li>
          <li>✓ Decompress gzip data back to text</li>
          <li>✓ Base64 encoding for safe transfer</li>
          <li>✓ View compression statistics</li>
          <li>✓ Switch between compress and decompress modes</li>
        </ul>
      </div>
    </div>
  )
}
