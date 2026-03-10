import QRCode from 'qrcode'
import { Download, RefreshCw, Copy } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

const errorLevels: { value: ErrorCorrectionLevel; label: string; desc: string }[] = [
  { value: 'L', label: 'L – Low', desc: '~7% data recovery' },
  { value: 'M', label: 'M – Medium', desc: '~15% data recovery' },
  { value: 'Q', label: 'Q – Quartile', desc: '~25% data recovery' },
  { value: 'H', label: 'H – High', desc: '~30% data recovery' },
]

export default function QRCodeGenerator() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const generate = async (value: string) => {
    if (!value.trim()) {
      setDataUrl(null)
      setError('')
      return
    }
    try {
      const url = await QRCode.toDataURL(value, {
        width: size,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
        margin: 2,
      })
      setDataUrl(url)
      setError('')
    } catch {
      setError('Failed to generate QR code. Input may be too large.')
      setDataUrl(null)
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => generate(text), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [text, size, errorLevel, fgColor, bgColor])

  const handleReset = () => {
    setText('')
    setSize(256)
    setErrorLevel('M')
    setFgColor('#000000')
    setBgColor('#ffffff')
    setDataUrl(null)
    setError('')
    setCopied(false)
  }

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'qrcode.png'
    a.click()
  }

  const handleCopy = async () => {
    if (!dataUrl) return
    try {
      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: copy the data URL text
      navigator.clipboard.writeText(dataUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
        <button
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          title="Reset"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Text / URL Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text / URL
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text or URL to encode..."
            rows={3}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Size (px)</label>
              <span className="text-sm font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                {size}
              </span>
            </div>
            <input
              type="range"
              min={128}
              max={512}
              step={8}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Error Correction */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Error Correction
            </label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {errorLevels.map((lvl) => (
                <option key={lvl.value} value={lvl.value} title={lvl.desc}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Colors */}
        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Foreground</label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-sm font-mono text-gray-600">{fgColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Background</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-sm font-mono text-gray-600">{bgColor}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            {error}
          </p>
        )}

        {/* QR Preview */}
        {dataUrl && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 inline-block">
              <img
                src={dataUrl}
                alt="QR Code"
                style={{ width: Math.min(size, 320), height: Math.min(size, 320) }}
                className="block"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy Image'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                Download PNG
              </button>
            </div>
          </div>
        )}

        {!dataUrl && !error && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Enter text or a URL above to generate a QR code
          </div>
        )}
      </div>
    </div>
  )
}
