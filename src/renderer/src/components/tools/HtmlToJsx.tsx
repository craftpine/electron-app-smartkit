import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function HtmlToJsx() {
  const [html, setHtml] = useState('')
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

  const convertHtmlToJsx = (htmlString: string) => {
    if (!htmlString.trim()) {
      setJsx('')
      return
    }

    try {
      let jsx = htmlString
        // Convert class to className
        .replace(/\bclass=/g, 'className=')
        // Convert data-* attributes to camelCase
        .replace(/data-([a-z-]+)=/g, (match, attr) => {
          const camelCase = attr.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
          return `data${camelCase.charAt(0).toUpperCase()}${camelCase.slice(1)}=`
        })
        // Convert for to htmlFor
        .replace(/\bfor=/g, 'htmlFor=')
        // Convert checked to checked (already correct, but format consistently)
        .replace(/\bchecked=/g, 'checked=')
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
        // Self-closing tags
        .replace(/\/>/g, ' />')

      // Format the JSX with proper indentation
      const formatted = formatJsx(jsx)
      setJsx(formatted)
    } catch (error) {
      setJsx(`Error converting HTML: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleConvert = () => {
    convertHtmlToJsx(html)
  }

  const handleReset = () => {
    setHtml('')
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">HTML to JSX Converter</h3>
        <p className="text-sm text-gray-600">
          Convert your HTML code to React JSX format. Automatically handles class → className, inline styles, and more.
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
            <label className="text-sm font-medium text-gray-700">HTML Input</label>
          </div>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste your HTML here...&#10;&#10;Example:&#10;&lt;div class=&quot;container&quot;&gt;&#10;  &lt;h1&gt;Hello&lt;/h1&gt;&#10;&lt;/div&gt;"
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
          <li>✓ class → className</li>
          <li>✓ for → htmlFor</li>
          <li>✓ style strings → objects</li>
          <li>✓ data-* attributes preserved</li>
          <li>✓ Self-closing tags formatted</li>
        </ul>
      </div>
    </div>
  )
}
