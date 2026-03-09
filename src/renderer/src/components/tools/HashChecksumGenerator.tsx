import { Copy, Hash, RefreshCw } from 'lucide-react'
import { useState } from 'react'

type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

const ALGORITHMS: Algorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

const ALGO_BITS: Record<Algorithm, string> = {
  'SHA-1': '160-bit',
  'SHA-256': '256-bit',
  'SHA-384': '384-bit',
  'SHA-512': '512-bit',
}

async function computeHash(text: string, algorithm: Algorithm): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function HashChecksumGenerator() {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256')
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)
  const [uppercase, setUppercase] = useState(false)
  const [error, setError] = useState('')

  async function handleCompute() {
    if (!input) {
      setError('Please enter some text to hash.')
      setHash('')
      return
    }
    try {
      setError('')
      const result = await computeHash(input, algorithm)
      setHash(uppercase ? result.toUpperCase() : result)
    } catch {
      setError('Failed to compute hash.')
      setHash('')
    }
  }

  function handleReset() {
    setInput('')
    setHash('')
    setError('')
  }

  function handleCopy() {
    if (!hash) return
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleToggleCase() {
    const next = !uppercase
    setUppercase(next)
    if (hash) setHash(next ? hash.toUpperCase() : hash.toLowerCase())
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hash / Checksum Generator</h2>
          <p className="text-gray-500 text-sm mt-1">Compute cryptographic hashes from text</p>
        </div>
        <button
          onClick={handleReset}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Reset"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Algorithm selector */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Algorithm</label>
          <div className="flex gap-2 flex-wrap">
            {ALGORITHMS.map((algo) => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  algorithm === algo
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            rows={5}
            className="w-full font-mono text-sm bg-gray-50 border border-gray-200 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Options */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={handleToggleCase}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Uppercase output</span>
          </label>
        </div>

        {/* Compute button */}
        <button
          onClick={handleCompute}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          <Hash className="w-4 h-4" />
          Compute Hash
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Output */}
        {hash && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{algorithm} Hash</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-sm bg-gray-50 border border-gray-100 rounded-md p-3 break-all text-gray-800">
              {hash}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {hash.length / 2} bytes · {hash.length * 4} bits
            </p>
          </div>
        )}

        {/* Features block */}
        {!hash && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Supported Algorithms</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              {ALGORITHMS.map((algo) => (
                <li key={algo}>
                  · {algo} — {ALGO_BITS[algo]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
