import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function SvgToJsx() {
  const [svg, setSvg] = useState('')
  const [jsx, setJsx] = useState('')
  const [copied, setCopied] = useState(false)

  const formatJsx = (jsx: string): string => {
    let formatted = ''
    let indentLevel = 0
    const indentStr = '  '

    // Split into tokens
    const tokens = jsx.match(/(<[^>]+>|[^<]+)/g) || []

    for (const token of tokens) {
      const trimmed = token.trim()

      if (!trimmed) continue

      // Closing tag
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1)
        formatted += `\n${indentStr.repeat(indentLevel)}${trimmed}`
      }
      // Self-closing tag or opening tag with immediate content
      else if (trimmed.endsWith('/>')) {
        formatted += `\n${indentStr.repeat(indentLevel)}${trimmed}`
      }
      // Opening tag
      else if (trimmed.startsWith('<')) {
        formatted += `\n${indentStr.repeat(indentLevel)}${trimmed}`
        // Check if it's not self-closing
        if (!trimmed.endsWith('/>')) {
          indentLevel++
        }
      }
      // Text content
      else {
        const text = trimmed.replace(/\s+/g, ' ')
        if (text && text !== ' ') {
          formatted += `\n${indentStr.repeat(indentLevel)}${text}`
        }
      }
    }

    return formatted.trim()
  }

  const convertSvgToJsx = (svgString: string) => {
    if (!svgString.trim()) {
      setJsx('')
      return
    }

    try {
      let jsx = svgString
        // Remove XML declaration
        .replace(/<\?xml[^?]*\?>/g, '')
        // Remove DOCTYPE declaration
        .replace(/<!DOCTYPE[^>]*>/g, '')
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove namespace declarations from svg tag
        .replace(/\s*xmlns[^=]*="[^"]*"/g, '')
        // Remove namespace prefixes (xlink:, xmlns:, etc)
        .replace(/([a-z]+):/g, (match, prefix) => {
          // Keep certain prefixes or convert them
          if (prefix === 'xlink') {
            return 'xlinkHref='
          }
          return match
        })
        // Convert xlink:href to xlinkHref
        .replace(/xlink:href=/g, 'xlinkHref=')
        // Convert event handlers to camelCase (onclick → onClick)
        .replace(/\bon([a-z]+)=/g, (match, event) => {
          return `on${event.charAt(0).toUpperCase() + event.slice(1)}=`
        })
        // Convert style strings to objects (basic conversion)
        .replace(/style="([^"]*)"/g, (match, styles) => {
          const styleObj = styles.split(';').reduce((acc: Record<string, string>, style: string) => {
            const [prop, value] = style.split(':').map((s) => s.trim())
            if (prop && value) {
              const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
              acc[camelProp] = value
            }
            return acc
          }, {})
          return `style={${JSON.stringify(styleObj)}}`
        })
        // Ensure self-closing tags have a space before />
        .replace(/([^/\s])\/>/g, '$1 />')

      // Format the JSX with proper indentation
      const formatted = formatJsx(jsx)
      setJsx(formatted)
    } catch (error) {
      setJsx(`Error converting SVG: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleConvert = () => {
    convertSvgToJsx(svg)
  }

  const handleReset = () => {
    setSvg('')
    setJsx('')
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsx)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">SVG to JSX Converter</h3>
        <p className="text-sm text-gray-600">
          Convert your SVG code to React JSX format. Automatically removes namespaces, converts event handlers, and more.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
        >
          Convert
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
            <label className="text-sm font-medium text-gray-700">SVG Input</label>
          </div>
          <textarea
            value={svg}
            onChange={(e) => setSvg(e.target.value)}
            placeholder="Paste your SVG here...&#10;&#10;Example:&#10;&lt;svg viewBox=&quot;0 0 24 24&quot;&gt;&#10;  &lt;circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;10&quot; /&gt;&#10;&lt;/svg&gt;"
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">JSX Output</label>
            {jsx && (
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
            value={jsx}
            readOnly
            placeholder="JSX output will appear here..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Conversions Applied:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Removes XML declarations</li>
          <li>✓ Removes namespace prefixes</li>
          <li>✓ onclick → onClick (camelCase events)</li>
          <li>✓ xlink:href → xlinkHref</li>
          <li>✓ style strings → objects</li>
          <li>✓ Self-closing tags formatted</li>
        </ul>
      </div>
    </div>
  )
}
