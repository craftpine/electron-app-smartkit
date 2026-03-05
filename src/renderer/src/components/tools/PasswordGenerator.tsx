import { Copy, RefreshCw, Plus } from 'lucide-react'
import { useState } from 'react'

const CHARS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
}

type Strength = 'Weak' | 'Fair' | 'Good' | 'Strong'

function getStrength(password: string): Strength {
  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return 'Weak'
  if (score <= 3) return 'Fair'
  if (score <= 4) return 'Good'
  return 'Strong'
}

const strengthColor: Record<Strength, string> = {
  Weak: 'bg-red-500',
  Fair: 'bg-orange-400',
  Good: 'bg-yellow-400',
  Strong: 'bg-green-500',
}

const strengthWidth: Record<Strength, string> = {
  Weak: 'w-1/4',
  Fair: 'w-2/4',
  Good: 'w-3/4',
  Strong: 'w-full',
}

const strengthText: Record<Strength, string> = {
  Weak: 'text-red-600',
  Fair: 'text-orange-500',
  Good: 'text-yellow-600',
  Strong: 'text-green-600',
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [quantity, setQuantity] = useState(1)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [passwords, setPasswords] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [error, setError] = useState('')

  const generatePassword = (): string => {
    let charset = ''
    if (useLowercase) charset += CHARS.lowercase
    if (useUppercase) charset += CHARS.uppercase
    if (useNumbers) charset += CHARS.numbers
    if (useSymbols) charset += CHARS.symbols

    if (excludeAmbiguous) {
      charset = charset.replace(/[0OIl1]/g, '')
    }

    if (!charset) return ''

    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => charset[b % charset.length])
      .join('')
  }

  const handleGenerate = () => {
    setError('')

    if (!useLowercase && !useUppercase && !useNumbers && !useSymbols) {
      setError('Select at least one character type.')
      return
    }

    const safeQuantity = Math.max(1, Math.min(quantity, 100))
    const generated: string[] = []
    for (let i = 0; i < safeQuantity; i++) {
      generated.push(generatePassword())
    }
    setPasswords(generated)
    setCopiedIndex(null)
    setCopiedAll(false)
  }

  const handleReset = () => {
    setLength(16)
    setQuantity(1)
    setUseLowercase(true)
    setUseUppercase(true)
    setUseNumbers(true)
    setUseSymbols(false)
    setExcludeAmbiguous(false)
    setPasswords([])
    setCopiedIndex(null)
    setCopiedAll(false)
    setError('')
  }

  const handleCopySingle = (password: string, index: number) => {
    navigator.clipboard.writeText(password)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(passwords.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const firstStrength = passwords.length > 0 ? getStrength(passwords[0]) : null

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Password Generator</h2>
        <button
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Length Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Length</label>
            <span className="text-sm font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700">
              {length}
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="128"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Character Types */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Character Types
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Lowercase (a-z)', value: useLowercase, set: setUseLowercase },
              { label: 'Uppercase (A-Z)', value: useUppercase, set: setUseUppercase },
              { label: 'Numbers (0-9)', value: useNumbers, set: setUseNumbers },
              { label: 'Symbols (!@#...)', value: useSymbols, set: setUseSymbols },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => set(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Extra Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Options
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Exclude ambiguous characters (0, O, I, l, 1)</span>
          </label>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Generate</span>
        </button>

        {/* Strength Indicator */}
        {firstStrength && passwords.length === 1 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-600">Strength</span>
              <span className={`text-xs font-bold ${strengthText[firstStrength]}`}>
                {firstStrength}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${strengthColor[firstStrength]} ${strengthWidth[firstStrength]}`}
              />
            </div>
          </div>
        )}

        {/* Output */}
        {passwords.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">
                Generated Password{passwords.length > 1 ? 's' : ''} ({passwords.length})
              </h3>
              {passwords.length > 1 && (
                <button
                  onClick={handleCopyAll}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors flex items-center space-x-1"
                >
                  <Copy size={16} />
                  <span>{copiedAll ? 'Copied!' : 'Copy All'}</span>
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {passwords.map((password, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded group hover:bg-gray-100"
                >
                  <span className="text-sm font-mono text-gray-700 break-all">{password}</span>
                  <button
                    onClick={() => handleCopySingle(password, index)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Copy"
                  >
                    {copiedIndex === index ? (
                      <span className="text-xs text-green-600 font-medium">Copied!</span>
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {passwords.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Cryptographically secure random generation</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Adjustable length from 4 to 128 characters</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Customizable character sets</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Password strength indicator</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Generate up to 100 passwords at once</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
