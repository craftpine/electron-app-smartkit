import { Copy, RefreshCw, Plus } from 'lucide-react'
import { useState } from 'react'

type UUIDVersion = 'v4' | 'v1' | 'nil'

export default function UuidGenerator() {
  const [version, setVersion] = useState<UUIDVersion>('v4')
  const [quantity, setQuantity] = useState(1)
  const [uppercase, setUppercase] = useState(false)
  const [hyphens, setHyphens] = useState(true)
  const [uuids, setUuids] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const generateV4 = (): string => {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    // Set version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    // Set variant 10xx
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join('-')
  }

  const generateV1 = (): string => {
    const now = Date.now()
    // UUID v1 epoch offset (Oct 15, 1582)
    const uuidEpoch = 122192928000000000n
    const timestamp = BigInt(now) * 10000n + uuidEpoch

    const timeLow = (timestamp & 0xffffffffn).toString(16).padStart(8, '0')
    const timeMid = ((timestamp >> 32n) & 0xffffn).toString(16).padStart(4, '0')
    const timeHi = ((timestamp >> 48n) & 0x0fffn).toString(16).padStart(4, '0')
    const timeHiVersion = '1' + timeHi.slice(1)

    const clockSeq = new Uint8Array(2)
    crypto.getRandomValues(clockSeq)
    clockSeq[0] = (clockSeq[0] & 0x3f) | 0x80
    const clockSeqHex = Array.from(clockSeq)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const node = new Uint8Array(6)
    crypto.getRandomValues(node)
    node[0] = node[0] | 0x01 // multicast bit
    const nodeHex = Array.from(node)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return `${timeLow}-${timeMid}-${timeHiVersion}-${clockSeqHex}-${nodeHex}`
  }

  const generateNil = (): string => {
    return '00000000-0000-0000-0000-000000000000'
  }

  const generateUUID = (): string => {
    switch (version) {
      case 'v1':
        return generateV1()
      case 'nil':
        return generateNil()
      case 'v4':
      default:
        return generateV4()
    }
  }

  const formatUUID = (uuid: string): string => {
    let result = uuid
    if (!hyphens) {
      result = result.replace(/-/g, '')
    }
    if (uppercase) {
      result = result.toUpperCase()
    }
    return result
  }

  const handleGenerate = () => {
    const safeQuantity = Math.max(1, Math.min(quantity, 500))
    const generated: string[] = []
    for (let i = 0; i < safeQuantity; i++) {
      generated.push(formatUUID(generateUUID()))
    }
    setUuids(generated)
    setCopied(false)
  }

  const handleReset = () => {
    setVersion('v4')
    setQuantity(1)
    setUppercase(false)
    setHyphens(true)
    setUuids([])
    setCopied(false)
  }

  const handleCopyAll = () => {
    if (uuids.length > 0) {
      navigator.clipboard.writeText(uuids.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopySingle = (uuid: string) => {
    navigator.clipboard.writeText(uuid)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">UUID Generator</h2>
        <button
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Version Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            UUID Version
          </label>
          <div className="flex space-x-2">
            {([
              { value: 'v4' as const, label: 'v4 (Random)' },
              { value: 'v1' as const, label: 'v1 (Timestamp)' },
              { value: 'nil' as const, label: 'Nil' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setVersion(opt.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  version === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max="500"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Options */}
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Uppercase</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Hyphens</span>
          </label>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Generate</span>
        </button>

        {/* Output */}
        {uuids.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">
                Generated UUID{uuids.length > 1 ? 's' : ''} ({uuids.length})
              </h3>
              <button
                onClick={handleCopyAll}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors flex items-center space-x-1"
              >
                <Copy size={16} />
                <span>{copied ? 'Copied!' : 'Copy All'}</span>
              </button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm font-mono text-gray-700 hover:bg-gray-100 group"
                >
                  <span className="break-all">{uuid}</span>
                  <button
                    onClick={() => handleCopySingle(uuid)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {uuids.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>UUID v4 (cryptographically random)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>UUID v1 (timestamp-based)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Generate up to 500 UUIDs at once</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Toggle uppercase and hyphen formatting</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
