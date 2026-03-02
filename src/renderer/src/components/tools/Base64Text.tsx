import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function Base64Text() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleEncode = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      const encoded = btoa(input)
      setOutput(encoded)
    } catch (err) {
      setError('Failed to encode. The text may contain characters that cannot be encoded.')
      setOutput('')
    }
  }

  const handleDecode = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      const decoded = atob(input.trim())
      setOutput(decoded)
    } catch (err) {
      setError('Invalid base64 string. Please check your input.')
      setOutput('')
    }
  }

  const handleProcess = () => {
    if (mode === 'encode') {
      handleEncode()
    } else {
      handleDecode()
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
    setMode(mode === 'encode' ? 'decode' : 'encode')
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Base64 Text Encoder/Decoder</h3>
        <p className="text-sm text-gray-600">
          Encode text to base64 or decode base64 strings back to plain text. Perfect for data transmission and storage.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleProcess}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
        >
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        <button
          onClick={handleModeSwitch}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Switch to {mode === 'encode' ? 'Decode' : 'Encode'}
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
              {mode === 'encode' ? 'Text Input' : 'Base64 Input'}
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? 'Enter text to encode...\n\nExample:\nHello, World!'
                : 'Paste base64 string...\n\nExample:\nSGVsbG8sIFdvcmxkIQ=='
            }
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
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
            placeholder={error || `${mode === 'encode' ? 'Encoded' : 'Decoded'} output will appear here...`}
            className={`flex-1 p-4 font-mono text-sm resize-none focus:outline-none ${error ? 'text-red-600' : 'text-gray-700'} bg-gray-50`}
          />
        </div>
      </div>

      {/* Stats */}
      {input && output && !error && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-6 text-xs text-green-800">
            <div>
              <span className="font-semibold">Input length:</span> {input.length} characters
            </div>
            <div>
              <span className="font-semibold">Output length:</span> {output.length} characters
            </div>
            {mode === 'encode' && (
              <div>
                <span className="font-semibold">Size increase:</span>{' '}
                {((output.length / input.length - 1) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Features:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Encode plain text to base64</li>
          <li>✓ Decode base64 to plain text</li>
          <li>✓ Switch between encode and decode modes</li>
          <li>✓ Copy output to clipboard</li>
          <li>✓ View encoding statistics</li>
        </ul>
      </div>
    </div>
  )
}
