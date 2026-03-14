import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

type Mode = 'escape' | 'unescape'
type Format = 'javascript' | 'json' | 'html' | 'regex' | 'unicode'

const FORMAT_LABELS: Record<Format, string> = {
  javascript: 'JavaScript',
  json: 'JSON',
  html: 'HTML Entities',
  regex: 'RegExp',
  unicode: 'Unicode',
}

function escapeJavascript(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/`/g, '\\`')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\0/g, '\\0')
}

function unescapeJavascript(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\0/g, '\0')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\`/g, '`')
    .replace(/\\\\/g, '\\')
}

function escapeJson(text: string): string {
  return JSON.stringify(text).slice(1, -1)
}

function unescapeJson(text: string): string {
  return JSON.parse(`"${text}"`)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function unescapeHtml(text: string): string {
  const el = document.createElement('div')
  el.innerHTML = text
  return el.textContent ?? ''
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function unescapeRegex(text: string): string {
  return text.replace(/\\([.*+?^${}()|[\]\\])/g, '$1')
}

function escapeUnicode(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.codePointAt(0)!
      if (code > 127) {
        return code > 0xffff
          ? `\\u{${code.toString(16).toUpperCase()}}`
          : `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`
      }
      return ch
    })
    .join('')
}

function unescapeUnicode(text: string): string {
  return text
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
}

function process(text: string, mode: Mode, format: Format): string {
  if (mode === 'escape') {
    switch (format) {
      case 'javascript': return escapeJavascript(text)
      case 'json': return escapeJson(text)
      case 'html': return escapeHtml(text)
      case 'regex': return escapeRegex(text)
      case 'unicode': return escapeUnicode(text)
    }
  } else {
    switch (format) {
      case 'javascript': return unescapeJavascript(text)
      case 'json': return unescapeJson(text)
      case 'html': return unescapeHtml(text)
      case 'regex': return unescapeRegex(text)
      case 'unicode': return unescapeUnicode(text)
    }
  }
}

export default function EscapeUnescape() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<Mode>('escape')
  const [format, setFormat] = useState<Format>('javascript')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleProcess = () => {
    setError('')
    if (!input) {
      setOutput('')
      return
    }
    try {
      setOutput(process(input, mode, format))
    } catch {
      setError('Failed to process input. Please check the syntax.')
      setOutput('')
    }
  }

  const handleSwitch = () => {
    const next = mode === 'escape' ? 'unescape' : 'escape'
    setMode(next)
    setInput(output)
    setOutput('')
    setError('')
    setCopied(false)
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

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Escape / Unescape</h3>
        <p className="text-sm text-gray-600">
          Escape or unescape strings for JavaScript, JSON, HTML, RegExp, and Unicode formats.
        </p>
      </div>

      {/* Format selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFormat(f)
              setOutput('')
              setError('')
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              format === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {FORMAT_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleProcess}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          {mode === 'escape' ? 'Escape' : 'Unescape'}
        </button>
        <button
          onClick={handleSwitch}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Switch to {mode === 'escape' ? 'Unescape' : 'Escape'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Input */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'escape' ? 'Raw Input' : 'Escaped Input'}
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'escape'
                ? 'Enter text to escape...\n\nExample:\nHello "world"\nline two'
                : 'Enter escaped text to unescape...\n\nExample:\nHello \\"world\\"\\nline two'
            }
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'escape' ? 'Escaped Output' : 'Unescaped Output'}
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
            placeholder={`${mode === 'escape' ? 'Escaped' : 'Unescaped'} output will appear here...`}
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

      {/* Reference */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">
          {FORMAT_LABELS[format]} — Common Sequences
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-blue-800">
          {format === 'javascript' || format === 'json' ? (
            <>
              <div className="flex justify-between"><span>Newline</span><span className="font-mono">\n</span></div>
              <div className="flex justify-between"><span>Tab</span><span className="font-mono">\t</span></div>
              <div className="flex justify-between"><span>Carriage return</span><span className="font-mono">\r</span></div>
              <div className="flex justify-between"><span>Backslash</span><span className="font-mono">\\</span></div>
              <div className="flex justify-between"><span>Double quote</span><span className="font-mono">\&quot;</span></div>
              {format === 'javascript' && <div className="flex justify-between"><span>Single quote</span><span className="font-mono">\'</span></div>}
            </>
          ) : format === 'html' ? (
            <>
              <div className="flex justify-between"><span>&lt; (less than)</span><span className="font-mono">&amp;lt;</span></div>
              <div className="flex justify-between"><span>&gt; (greater than)</span><span className="font-mono">&amp;gt;</span></div>
              <div className="flex justify-between"><span>&amp; (ampersand)</span><span className="font-mono">&amp;amp;</span></div>
              <div className="flex justify-between"><span>" (quote)</span><span className="font-mono">&amp;quot;</span></div>
              <div className="flex justify-between"><span>' (apostrophe)</span><span className="font-mono">&amp;#39;</span></div>
            </>
          ) : format === 'regex' ? (
            <>
              <div className="flex justify-between"><span>. (dot)</span><span className="font-mono">\.</span></div>
              <div className="flex justify-between"><span>* (star)</span><span className="font-mono">\*</span></div>
              <div className="flex justify-between"><span>? (question)</span><span className="font-mono">\?</span></div>
              <div className="flex justify-between"><span>+ (plus)</span><span className="font-mono">\+</span></div>
              <div className="flex justify-between"><span>( ) [ ] { }</span><span className="font-mono">\( \) …</span></div>
              <div className="flex justify-between"><span>^ $ | \</span><span className="font-mono">\^ \$ \| \\</span></div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><span>BMP char</span><span className="font-mono">\uXXXX</span></div>
              <div className="flex justify-between"><span>Supplementary</span><span className="font-mono">\u&#123;XXXXX&#125;</span></div>
              <div className="flex justify-between"><span>© (U+00A9)</span><span className="font-mono">\u00A9</span></div>
              <div className="flex justify-between"><span>€ (U+20AC)</span><span className="font-mono">\u20AC</span></div>
              <div className="flex justify-between"><span>😀 (U+1F600)</span><span className="font-mono">\u&#123;1F600&#125;</span></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
