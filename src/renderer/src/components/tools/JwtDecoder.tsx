import { Copy, RefreshCw, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface DecodedJWT {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

export default function JwtDecoder() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null)
  const [error, setError] = useState('')

  const decodeBase64Url = (str: string): string => {
    let output = str.replace(/-/g, '+').replace(/_/g, '/')
    switch (output.length % 4) {
      case 0:
        break
      case 2:
        output += '=='
        break
      case 3:
        output += '='
        break
      default:
        throw new Error('Invalid base64url string')
    }
    try {
      return decodeURIComponent(
        atob(output)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    } catch {
      throw new Error('Failed to decode base64url')
    }
  }

  const handleDecode = () => {
    setError('')
    setDecoded(null)

    if (!input.trim()) {
      setError('Please enter a JWT token')
      return
    }

    try {
      const parts = input.trim().split('.')

      if (parts.length !== 3) {
        setError('Invalid JWT format. JWT must have 3 parts separated by dots.')
        return
      }

      const [headerB64, payloadB64, signature] = parts

      const headerStr = decodeBase64Url(headerB64)
      const payloadStr = decodeBase64Url(payloadB64)

      const header = JSON.parse(headerStr)
      const payload = JSON.parse(payloadStr)

      setDecoded({
        header,
        payload,
        signature,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT')
    }
  }

  const handleReset = () => {
    setInput('')
    setDecoded(null)
    setError('')
    setCopied(false)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">JWT Decoder</h2>
        <button
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            JWT Token
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT token here..."
            className="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={handleDecode}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Decode
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Decoded Output */}
        {decoded && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Header</h3>
                <button
                  onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2))}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Copy header"
                >
                  <Copy size={16} />
                </button>
              </div>
              <pre className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 overflow-x-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Payload</h3>
                <button
                  onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2))}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Copy payload"
                >
                  <Copy size={16} />
                </button>
              </div>
              <pre className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 overflow-x-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            {/* Signature */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Signature</h3>
                <button
                  onClick={() => handleCopy(decoded.signature)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Copy signature"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 break-all">
                {decoded.signature}
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        {!decoded && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Decode JWT header, payload, and signature</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>View claims and metadata in JSON format</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Copy individual parts with one click</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Supports standard JWT format (header.payload.signature)</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
