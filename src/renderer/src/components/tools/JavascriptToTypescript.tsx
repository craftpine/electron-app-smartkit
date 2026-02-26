import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function JavascriptToTypescript() {
  const [javascript, setJavascript] = useState('')
  const [typescript, setTypescript] = useState('')
  const [copied, setCopied] = useState(false)

  const convertJavascriptToTypescript = (jsString: string) => {
    if (!jsString.trim()) {
      setTypescript('')
      return
    }

    try {
      let ts = jsString

      // Add type annotations to function parameters
      ts = ts.replace(/function\s+(\w+)\s*\(\s*(\w+)\s*\)/g, 'function $1($2: any)')
      ts = ts.replace(/const\s+(\w+)\s*=\s*\(\s*(\w+)\s*\)\s*=>/g, 'const $1 = ($2: any) =>')
      ts = ts.replace(/\(\s*(\w+)\s*\)\s*=>/g, '($1: any) =>')

      // Add return type annotations to functions
      ts = ts.replace(/function\s+(\w+)\s*\([^)]*\)\s*{/g, 'function $1(...args: any[]): any {')

      // Convert var to const/let
      ts = ts.replace(/\bvar\s+/g, 'const ')

      // Add type annotation to common array operations
      ts = ts.replace(/const\s+(\w+)\s*=\s*\[\]/g, 'const $1: any[] = []')

      // Add type annotation to object literals
      ts = ts.replace(/const\s+(\w+)\s*=\s*{([^}]*)}/g, (match, varName, content) => {
        if (content.trim()) {
          return `const ${varName}: Record<string, any> = {${content}}`
        }
        return match
      })

      // Add interface suggestion for common patterns
      const hasClass = /class\s+\w+/.test(ts)
      const hasInterface = /interface\s+\w+/.test(ts)
      
      let suggestions = ''
      if (!hasInterface && /const\s+\w+\s*:\s*Record/.test(ts)) {
        suggestions = `\n\n// Consider defining interfaces for better type safety:\n// export interface MyObject {\n//   property: string;\n//   anotherProperty: number;\n// }`
      }

      // Convert arrow functions with implicit returns
      ts = ts.replace(/=>\s*([^{])/g, '=> {return $1}')

      // Add eslint-disable if there are any unknown types
      if (/:any/g.test(ts) && !ts.includes('/* eslint-disable')) {
        ts = `/* eslint-disable @typescript-eslint/no-explicit-any */\n${ts}`
      }

      setTypescript(ts + suggestions)
    } catch (error) {
      setTypescript(`Error converting JavaScript: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleConvert = () => {
    convertJavascriptToTypescript(javascript)
  }

  const handleReset = () => {
    setJavascript('')
    setTypescript('')
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(typescript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">JavaScript to TypeScript</h3>
        <p className="text-sm text-gray-600">
          Convert your JavaScript code to TypeScript. Adds type annotations and suggests improvements for better type safety.
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
            <label className="text-sm font-medium text-gray-700">JavaScript Input</label>
          </div>
          <textarea
            value={javascript}
            onChange={(e) => setJavascript(e.target.value)}
            placeholder="Paste your JavaScript here...&#10;&#10;Example:&#10;function greet(name) {&#10;  return `Hello, ${name}!`;&#10;}&#10;&#10;const user = { name: 'John' };"
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">TypeScript Output</label>
            {typescript && (
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
            value={typescript}
            readOnly
            placeholder="TypeScript output will appear here..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Conversions Applied:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ var → const/let</li>
          <li>✓ Function parameters → typed parameters</li>
          <li>✓ Return type annotations</li>
          <li>✓ Array and object type suggestions</li>
          <li>✓ Arrow function formatting</li>
          <li>✓ Interface suggestions for objects</li>
          <li>✓ ESLint disable comments for any types</li>
        </ul>
      </div>
    </div>
  )
}
