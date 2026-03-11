import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function UrlEncoder() {
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
    setOutput(encodeURIComponent(input))
  }

  const handleDecode = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      setOutput(decodeURIComponent(input))
    } catch {
      setError('Invalid URL-encoded string. Please check your input.')
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">URL Encoder/Decoder</h3>
        <p className="text-sm text-gray-600">
          Encode text for safe use in URLs or decode percent-encoded URL strings back to plain text.
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
              {mode === 'encode' ? 'Plain Text Input' : 'URL-Encoded Input'}
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? 'Enter text to encode...\n\nExample:\nhttps://example.com/search?q=hello world&lang=en'
                : 'Paste URL-encoded string...\n\nExample:\nhttps%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den'
            }
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'encode' ? 'URL-Encoded Output' : 'Decoded Text'}
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
            placeholder={`${mode === 'encode' ? 'Encoded' : 'Decoded'} output will appear here...`}
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Common URL Encodings:</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-blue-800">
          <div className="flex justify-between">
            <span>(space)</span>
            <span className="font-mono">%20</span>
          </div>
          <div className="flex justify-between">
            <span>! (exclamation)</span>
            <span className="font-mono">%21</span>
          </div>
          <div className="flex justify-between">
            <span>& (ampersand)</span>
            <span className="font-mono">%26</span>
          </div>
          <div className="flex justify-between">
            <span>= (equals)</span>
            <span className="font-mono">%3D</span>
          </div>
          <div className="flex justify-between">
            <span>? (question mark)</span>
            <span className="font-mono">%3F</span>
          </div>
          <div className="flex justify-between">
            <span># (hash)</span>
            <span className="font-mono">%23</span>
          </div>
          <div className="flex justify-between">
            <span>/ (slash)</span>
            <span className="font-mono">%2F</span>
          </div>
          <div className="flex justify-between">
            <span>: (colon)</span>
            <span className="font-mono">%3A</span>
          </div>
        </div>
      </div>
    </div>
  )
}
