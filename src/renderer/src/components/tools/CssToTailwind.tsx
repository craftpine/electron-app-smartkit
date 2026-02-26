import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function CssToTailwind() {
  const [css, setCss] = useState('')
  const [tailwind, setTailwind] = useState('')
  const [copied, setCopied] = useState(false)

  // Common CSS to Tailwind mappings
  const cssToTailwindMap: Record<string, string> = {
    'color': 'text',
    'background-color': 'bg',
    'background': 'bg',
    'padding': 'p',
    'padding-top': 'pt',
    'padding-right': 'pr',
    'padding-bottom': 'pb',
    'padding-left': 'pl',
    'margin': 'm',
    'margin-top': 'mt',
    'margin-right': 'mr',
    'margin-bottom': 'mb',
    'margin-left': 'ml',
    'width': 'w',
    'height': 'h',
    'display': 'block',
    'font-size': 'text',
    'font-weight': 'font',
    'text-align': 'text',
    'border': 'border',
    'border-radius': 'rounded',
    'opacity': 'opacity',
    'box-shadow': 'shadow',
    'transform': 'transform',
    'transition': 'transition',
  }

  const convertCssToTailwind = (cssString: string) => {
    if (!cssString.trim()) {
      setTailwind('')
      return
    }

    try {
      const classes: string[] = []
      const lines = cssString.split('\n')
      let inSelector = false
      let currentSelector = ''

      for (const line of lines) {
        const trimmed = line.trim()

        if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue

        // Match selector
        if (trimmed.includes('{') && !trimmed.includes('}')) {
          currentSelector = trimmed.replace('{', '').trim()
          inSelector = true
          continue
        }

        // Match properties
        if (inSelector && trimmed.includes(':')) {
          const [property, value] = trimmed.split(':').map((s) => s.trim()).map((s) => s.replace(';', ''))

          if (!property || !value) continue

          const propLower = property.toLowerCase()
          const valueLower = value.toLowerCase()

          // Common conversions
          if (propLower === 'display' && valueLower === 'flex') {
            classes.push('flex')
          } else if (propLower === 'display' && valueLower === 'grid') {
            classes.push('grid')
          } else if (propLower === 'display' && valueLower === 'block') {
            classes.push('block')
          } else if (propLower === 'display' && valueLower === 'inline-block') {
            classes.push('inline-block')
          } else if (propLower === 'text-align' && valueLower === 'center') {
            classes.push('text-center')
          } else if (propLower === 'text-align' && valueLower === 'left') {
            classes.push('text-left')
          } else if (propLower === 'text-align' && valueLower === 'right') {
            classes.push('text-right')
          } else if (propLower === 'border-radius') {
            const match = value.match(/(\d+)/)
            if (match) {
              const radius = parseInt(match[1])
              if (radius === 4) classes.push('rounded-sm')
              else if (radius === 6) classes.push('rounded')
              else if (radius === 8) classes.push('rounded-lg')
              else if (radius === 12) classes.push('rounded-xl')
              else classes.push(`rounded-[${value}]`)
            }
          } else if (propLower === 'font-weight') {
            if (valueLower === 'bold' || valueLower === '700' || valueLower === '600') {
              classes.push('font-bold')
            } else if (valueLower === 'normal' || valueLower === '400') {
              classes.push('font-normal')
            }
          } else if (propLower === 'gap') {
            const match = value.match(/(\d+)/)
            if (match) classes.push(`gap-${match[1]}`)
          } else if (propLower === 'justify-content') {
            if (valueLower === 'center') classes.push('justify-center')
            else if (valueLower === 'flex-start') classes.push('justify-start')
            else if (valueLower === 'flex-end') classes.push('justify-end')
            else if (valueLower === 'space-between') classes.push('justify-between')
          } else if (propLower === 'align-items') {
            if (valueLower === 'center') classes.push('items-center')
            else if (valueLower === 'flex-start') classes.push('items-start')
            else if (valueLower === 'flex-end') classes.push('items-end')
          } else if (propLower === 'cursor') {
            classes.push(`cursor-${valueLower}`)
          }
        }

        // End of selector
        if (trimmed.includes('}')) {
          inSelector = false
        }
      }

      const result = classes.length > 0 
        ? `<!-- Add these Tailwind classes to your element -->\n${classes.join(' ')}`
        : 'No CSS conversions found. Try adding common CSS properties like display, color, padding, margin, etc.'

      setTailwind(result)
    } catch (error) {
      setTailwind(`Error converting CSS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleConvert = () => {
    convertCssToTailwind(css)
  }

  const handleReset = () => {
    setCss('')
    setTailwind('')
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(tailwind)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">CSS to Tailwind</h3>
        <p className="text-sm text-gray-600">
          Convert CSS properties to Tailwind CSS class names. Recognizes common CSS patterns and suggests appropriate Tailwind utilities.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
            <label className="text-sm font-medium text-gray-700">CSS Input</label>
          </div>
          <textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder="Paste your CSS here...&#10;&#10;Example:&#10;.container {&#10;  display: flex;&#10;  gap: 16px;&#10;  padding: 20px;&#10;}"
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Tailwind Output</label>
            {tailwind && (
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
            value={tailwind}
            readOnly
            placeholder="Tailwind classes will appear here..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Supported Conversions:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ display (flex, grid, block)</li>
          <li>✓ text-align (center, left, right)</li>
          <li>✓ border-radius (rounded utilities)</li>
          <li>✓ font-weight (bold, normal)</li>
          <li>✓ gap (flex/grid gap)</li>
          <li>✓ justify-content & align-items</li>
          <li>✓ cursor properties</li>
        </ul>
      </div>
    </div>
  )
}
