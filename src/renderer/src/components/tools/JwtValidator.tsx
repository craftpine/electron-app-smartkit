import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

interface ValidationResult {
  isValid: boolean
  algorithm: string
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  expectedSignature: string
}

export default function JwtValidator() {
  const [input, setInput] = useState('')
  const [secret, setSecret] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState(false)

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

  const handleValidate = async () => {
    setError('')
    setResult(null)

    if (!input.trim()) {
      setError('Please enter a JWT token')
      return
    }

    if (!secret.trim()) {
      setError('Please enter a secret key')
      return
    }

    try {
      const parts = input.trim().split('.')

      if (parts.length !== 3) {
        setError('Invalid JWT format. JWT must have 3 parts separated by dots.')
        return
      }

      const [headerB64, payloadB64, signatureB64] = parts

      // Decode header and payload
      const headerStr = decodeBase64Url(headerB64)
      const payloadStr = decodeBase64Url(payloadB64)

      const header = JSON.parse(headerStr)
      const payload = JSON.parse(payloadStr)
      const algorithm = header.alg || 'unknown'

      // Verify signature
      const message = `${headerB64}.${payloadB64}`

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
      const expectedSignature = btoa(binarySignature).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

      // Compare signatures
      const isValid = signatureB64 === expectedSignature

      setResult({
        isValid,
        algorithm,
        header,
        payload,
        signature: signatureB64,
        expectedSignature,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate JWT')
    }
  }

  const handleReset = () => {
    setInput('')
    setSecret('')
    setResult(null)
    setError('')
    setShowSecret(false)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">JWT Validator</h2>
        <button
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Token Input */}
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
        </div>

        {/* Secret Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Secret Key
          </label>
          <div className="flex space-x-2">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter the secret key used to create the token..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {showSecret ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Validate Button */}
        <button
          onClick={handleValidate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Validate
        </button>

        {/* Error Display */}
        {error && (
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Validation Result */}
        {result && (
          <div className="space-y-4">
            {/* Validity Status */}
            <div
              className={`p-4 rounded-lg border-2 ${
                result.isValid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {result.isValid ? (
                  <CheckCircle size={24} className="text-green-600" />
                ) : (
                  <XCircle size={24} className="text-red-600" />
                )}
                <div>
                  <h3
                    className={`font-semibold ${
                      result.isValid ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.isValid ? 'Valid Signature' : 'Invalid Signature'}
                  </h3>
                  <p
                    className={`text-sm ${
                      result.isValid ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.isValid
                      ? 'The JWT signature is authentic.'
                      : 'The signature does not match. The token may have been tampered with.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Algorithm Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Algorithm</h3>
              <p className="text-gray-700">{result.algorithm}</p>
            </div>

            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Header</h3>
              <pre className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 overflow-x-auto">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Payload</h3>
              <pre className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 overflow-x-auto">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>

            {/* Signature Comparison */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Signature Verification</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Provided Signature</p>
                  <p className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-700 break-all">
                    {result.signature}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Expected Signature</p>
                  <p className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-700 break-all">
                    {result.expectedSignature}
                  </p>
                </div>
                <p
                  className={`text-xs ${
                    result.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {result.isValid ? '✓ Signatures match' : '✗ Signatures do not match'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        {!result && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Verify JWT signature authenticity</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Detect tampered or invalid tokens</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Display detailed validation results</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Support for HS256, HS384, and HS512</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
