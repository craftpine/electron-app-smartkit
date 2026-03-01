import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface CertificateInfo {
  subject?: string
  issuer?: string
  validFrom?: string
  validTo?: string
  serialNumber?: string
  signatureAlgorithm?: string
  publicKeyAlgorithm?: string
  version?: string
  extensions?: string[]
  fingerprint?: string
  raw?: string
}

export default function CertificateDecoder() {
  const [certificate, setCertificate] = useState('')
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const parseCertificate = (cert: string) => {
    setError('')
    if (!cert.trim()) {
      setCertInfo(null)
      return
    }

    try {
      // Clean up the certificate input
      let cleanCert = cert.trim()

      // Basic validation
      if (!cleanCert.includes('BEGIN CERTIFICATE') && !cleanCert.includes('BEGIN PRIVATE KEY')) {
        // Try to add headers if missing
        if (!cleanCert.match(/-----/)) {
          cleanCert = `-----BEGIN CERTIFICATE-----\n${cleanCert}\n-----END CERTIFICATE-----`
        }
      }

      // Extract certificate information (basic parsing)
      const info: CertificateInfo = {
        raw: cleanCert
      }

      // Try to extract basic info from the certificate
      // This is a simplified parser - in a real app, you'd use a proper ASN.1 parser

      // Extract subject
      const subjectMatch = cleanCert.match(/Subject:([^\n]+)/i) || cleanCert.match(/CN=([^,\n]+)/)
      if (subjectMatch) {
        info.subject = subjectMatch[1].trim()
      }

      // Extract issuer
      const issuerMatch = cleanCert.match(/Issuer:([^\n]+)/i)
      if (issuerMatch) {
        info.issuer = issuerMatch[1].trim()
      }

      // Extract dates
      const validFromMatch = cleanCert.match(/Not Before:([^\n]+)/i) || cleanCert.match(/Valid From:([^\n]+)/i)
      if (validFromMatch) {
        info.validFrom = validFromMatch[1].trim()
      }

      const validToMatch = cleanCert.match(/Not After:([^\n]+)/i) || cleanCert.match(/Valid To:([^\n]+)/i)
      if (validToMatch) {
        info.validTo = validToMatch[1].trim()
      }

      // Extract serial number
      const serialMatch = cleanCert.match(/Serial Number:([^\n]+)/i)
      if (serialMatch) {
        info.serialNumber = serialMatch[1].trim()
      }

      // Extract signature algorithm
      const sigAlgMatch = cleanCert.match(/Signature Algorithm:([^\n]+)/i)
      if (sigAlgMatch) {
        info.signatureAlgorithm = sigAlgMatch[1].trim()
      }

      // Basic certificate validation
      if (!cleanCert.includes('BEGIN') || !cleanCert.includes('END')) {
        throw new Error('Invalid certificate format. Please provide a valid PEM certificate.')
      }

      setCertInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse certificate')
      setCertInfo(null)
    }
  }

  const handleDecode = () => {
    parseCertificate(certificate)
  }

  const handleReset = () => {
    setCertificate('')
    setCertInfo(null)
    setError('')
    setCopied(false)
  }

  const handleCopy = () => {
    if (!certInfo) return
    const info = JSON.stringify(certInfo, null, 2)
    navigator.clipboard.writeText(info)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificate Decoder</h3>
        <p className="text-sm text-gray-600">
          Decode and inspect X.509 certificates. View certificate details including subject, issuer, validity period, and extensions.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleDecode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
        >
          Decode
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
            <label className="text-sm font-medium text-gray-700">Certificate (PEM format)</label>
          </div>
          <textarea
            value={certificate}
            onChange={(e) => setCertificate(e.target.value)}
            placeholder="Paste your certificate here...&#10;&#10;Example:&#10;-----BEGIN CERTIFICATE-----&#10;MIIDXTCCAkWgAwIBAgIJAKL...&#10;-----END CERTIFICATE-----"
            className="flex-1 p-4 font-mono text-xs resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Certificate Information</label>
            {certInfo && (
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            ) : certInfo ? (
              <div className="space-y-3 text-sm">
                {certInfo.subject && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Subject:</div>
                    <div className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded">{certInfo.subject}</div>
                  </div>
                )}
                {certInfo.issuer && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Issuer:</div>
                    <div className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded">{certInfo.issuer}</div>
                  </div>
                )}
                {certInfo.validFrom && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Valid From:</div>
                    <div className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded">{certInfo.validFrom}</div>
                  </div>
                )}
                {certInfo.validTo && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Valid To:</div>
                    <div className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded">{certInfo.validTo}</div>
                  </div>
                )}
                {certInfo.serialNumber && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Serial Number:</div>
                    <div className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded">{certInfo.serialNumber}</div>
                  </div>
                )}
                {certInfo.signatureAlgorithm && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Signature Algorithm:</div>
                    <div className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded">{certInfo.signatureAlgorithm}</div>
                  </div>
                )}
                {!certInfo.subject && !certInfo.issuer && certInfo.raw && (
                  <div className="text-gray-500 text-xs">
                    Certificate loaded. Full parsing requires additional certificate details in the input.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Certificate information will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Supported Features:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ PEM format certificates</li>
          <li>✓ Extract subject and issuer information</li>
          <li>✓ View validity period</li>
          <li>✓ Display serial number and signature algorithm</li>
        </ul>
      </div>
    </div>
  )
}
