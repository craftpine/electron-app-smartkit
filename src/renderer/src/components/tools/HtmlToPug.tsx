import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function HtmlToPug() {
  const [html, setHtml] = useState('')
  const [pug, setPug] = useState('')
  const [copied, setCopied] = useState(false)

  const convertHtmlToPug = (htmlString: string) => {
    if (!htmlString.trim()) {
      setPug('')
      return
    }

    try {
      let pugOutput = ''
      let indentLevel = 0
      const indentStr = '  '

      // Parse HTML into tokens
      const tokens: Array<{ type: string; content: string }> = []
      let remaining = htmlString.trim()

      while (remaining.length > 0) {
        if (remaining.startsWith('<!--')) {
          // Comment
          const endIdx = remaining.indexOf('-->')
          if (endIdx !== -1) {
            const comment = remaining.substring(4, endIdx).trim()
            tokens.push({ type: 'comment', content: comment })
            remaining = remaining.substring(endIdx + 3).trim()
          } else {
            break
          }
        } else if (remaining.startsWith('</')) {
          // Closing tag
          const endIdx = remaining.indexOf('>')
          if (endIdx !== -1) {
            tokens.push({ type: 'closeTag', content: remaining.substring(2, endIdx) })
            remaining = remaining.substring(endIdx + 1).trim()
          } else {
            break
          }
        } else if (remaining.startsWith('<')) {
          // Opening tag
          const endIdx = remaining.indexOf('>')
          if (endIdx !== -1) {
            const tagContent = remaining.substring(1, endIdx)
            const isSelfClosing = tagContent.endsWith('/')
            const cleanTag = isSelfClosing ? tagContent.slice(0, -1).trim() : tagContent.trim()
            tokens.push({
              type: isSelfClosing ? 'selfClosingTag' : 'openTag',
              content: cleanTag,
            })
            remaining = remaining.substring(endIdx + 1).trim()
          } else {
            break
          }
        } else {
          // Text content
          const nextTagIdx = remaining.search(/</)
          if (nextTagIdx === -1) {
            const text = remaining.trim()
            if (text) {
              tokens.push({ type: 'text', content: text })
            }
            break
          } else {
            const text = remaining.substring(0, nextTagIdx).trim()
            if (text) {
              tokens.push({ type: 'text', content: text })
            }
            remaining = remaining.substring(nextTagIdx)
          }
        }
      }

      // Process tokens to generate Pug
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        if (token.type === 'comment') {
          pugOutput += `${indentStr.repeat(indentLevel)}// ${token.content}\n`
        } else if (token.type === 'closeTag') {
          indentLevel = Math.max(0, indentLevel - 1)
        } else if (token.type === 'openTag' || token.type === 'selfClosingTag') {
          const tagParts = token.content.split(/\s+(?=\w+=)/)
          const tagName = tagParts[0]
          let attributes = tagParts.slice(1)

          let pugTag = tagName
          let classNames: string[] = []
          let id = ''
          let otherAttrs: string[] = []

          // Parse attributes
          for (const attr of attributes) {
            const [name, ...valueParts] = attr.split('=')
            const value = valueParts
              .join('=')
              .replace(/^["']|["']$/g, '')
              .trim()

            if (name === 'class') {
              classNames = value.split(/\s+/)
            } else if (name === 'id') {
              id = value
            } else {
              otherAttrs.push(`${name}="${value}"`)
            }
          }

          // Build Pug tag
          if (id) {
            pugTag += `#${id}`
          }
          if (classNames.length > 0) {
            pugTag += `.${classNames.join('.')}`
          }
          if (otherAttrs.length > 0) {
            pugTag += `(${otherAttrs.join(', ')})`
          }

          // Check if next token is text (inline text)
          let textContent = ''
          if (i + 1 < tokens.length && tokens[i + 1].type === 'text') {
            textContent = tokens[i + 1].content
            i++ // Skip next token since we're processing it now
          }

          if (textContent) {
            pugOutput += `${indentStr.repeat(indentLevel)}${pugTag} #{${textContent}}\n`
          } else {
            pugOutput += `${indentStr.repeat(indentLevel)}${pugTag}\n`
          }

          if (token.type === 'openTag') {
            indentLevel++
          }
        } else if (token.type === 'text') {
          const text = token.content.trim()
          if (text) {
            pugOutput += `${indentStr.repeat(indentLevel)}| ${text}\n`
          }
        }
      }

      setPug(pugOutput.trim())
    } catch (error) {
      setPug(`Error converting HTML: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleConvert = () => {
    convertHtmlToPug(html)
  }

  const handleReset = () => {
    setHtml('')
    setPug('')
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pug)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">HTML to Pug Converter</h3>
        <p className="text-sm text-gray-600">
          Convert your HTML code to Pug (formerly Jade) template syntax. Automatically converts classes, IDs, and
          attributes.
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
            placeholder="Paste your HTML here...&#10;&#10;Example:&#10;&lt;div class=&quot;container&quot; id=&quot;app&quot;&gt;&#10;  &lt;h1&gt;Hello&lt;/h1&gt;&#10;&lt;/div&gt;"
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Pug Output</label>
            {pug && (
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
            value={pug}
            readOnly
            placeholder="Pug output will appear here..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Conversions Applied:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ class → .classname (supports multiple classes)</li>
          <li>✓ id → #id</li>
          <li>✓ Angle brackets removed</li>
          <li>✓ Indentation-based hierarchy</li>
          <li>✓ Attributes converted to Pug syntax</li>
        </ul>
      </div>
    </div>
  )
}
