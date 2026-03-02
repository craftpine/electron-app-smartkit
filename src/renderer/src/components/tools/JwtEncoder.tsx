import { Copy, RefreshCw, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function JwtEncoder() {
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
  const [secret, setSecret] = useState('')
  const [algorithm, setAlgorithm] = useState('HS256')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const encodeBase64Url = (str: string): string => {
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  const getHashAlgorithm = (algo: string): string => {
    switch (algo) {
      case 'HS256':
        return 'SHA-256'
      case 'HS384':
        return 'SHA-384'
      case 'HS512':
        return 'SHA-512'
      default:
        return 'SHA-256'
    }
  }

  const handleEncode = async () => {
    setError('')
    setOutput('')

    if (!payload.trim()) {
      setError('Please enter a payload')
      return
    }

    if (!secret.trim()) {
      setError('Please enter a secret key')
      return
    }

    try {
      // Parse and validate payload
      const payloadObj = JSON.parse(payload)

      // Create header
      const header = {
        alg: algorithm,
        typ: 'JWT',
      }

      // Encode header and payload
      const encodedHeader = encodeBase64Url(JSON.stringify(header))
      const encodedPayload = encodeBase64Url(JSON.stringify(payloadObj))

      // Create signature
      const message = `${encodedHeader}.${encodedPayload}`

      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const messageData = encoder.encode(message)

      const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: getHashAlgorithm(algorithm) },
        false,
        ['sign']
      )

      const signature = await window.crypto.subtle.sign('HMAC', key, messageData)

      // Convert signature to base64url
      let binarySignature = ''
      const view = new Uint8Array(signature)
      for (let i = 0; i < view.byteLength; i++) {
        binarySignature += String.fromCharCode(view[i])
      }
      const encodedSignature = btoa(binarySignature).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

      // Combine all parts
      const jwt = `${message}.${encodedSignature}`
      setOutput(jwt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to encode JWT')
    }
  }

  const handleReset = () => {
    setPayload('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
    setSecret('')
    setAlgorithm('HS256')
    setOutput('')
    setError('')
    setCopied(false)
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">JWT Encoder</h2>
        <button
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Algorithm Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="HS256">HS256 (HMAC SHA-256)</option>
            <option value="HS384">HS384 (HMAC SHA-384)</option>
            <option value="HS512">HS512 (HMAC SHA-512)</option>
          </select>
        </div>

        {/* Payload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payload (JSON)
          </label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Enter your JWT payload as JSON..."
            className="w-full h-28 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Secret Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Secret Key
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter your secret key..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-600 mt-1">Keep this secret safe. Never share it publicly.</p>
        </div>

        {/* Encode Button */}
        <button
          onClick={handleEncode}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Generate JWT
        </button>

        {/* Error Display */}
        {error && (
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">JWT Token</h3>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors flex items-center space-x-1"
              >
                <Copy size={16} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 break-all">
              {output}
            </p>
          </div>
        )}

        {/* Features */}
        {!output && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Support for HS256, HS384, and HS512 algorithms</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Client-side JWT generation with HMAC-SHA hashing</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Custom payload and secret input</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Copy generated token with one click</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
