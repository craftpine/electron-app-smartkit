import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function JsonToTypescript() {
  const [json, setJson] = useState('')
  const [typescript, setTypescript] = useState('')
  const [copied, setCopied] = useState(false)
  const [typeName, setTypeName] = useState('Root')

  const convertJsonToTypescript = (jsonString: string, interfaceName: string) => {
    if (!jsonString.trim()) {
      setTypescript('')
      return
    }

    try {
      const parsed = JSON.parse(jsonString)
      const types = new Map<string, string>()
      let counter = 0

      const generateTypeName = (baseName: string): string => {
        counter++
        return counter === 1 ? baseName : `${baseName}${counter}`
      }

      const getType = (value: any, key: string): string => {
        if (value === null) return 'null'
        if (Array.isArray(value)) {
          if (value.length === 0) return 'any[]'
          return `${getType(value[0], key)}[]`
        }
        if (typeof value === 'object') {
          return generateInterface(value, key)
        }
        return typeof value
      }

      const generateInterface = (obj: any, name: string): string => {
        const interfaceName = generateTypeName(name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ''))
        
        if (types.has(interfaceName)) {
          return interfaceName
        }

        const properties: string[] = []
        for (const [key, value] of Object.entries(obj)) {
          const type = getType(value, key)
          const optional = value === null ? '?' : ''
          properties.push(`  ${key}${optional}: ${type}`)
        }

        const typeDefinition = `export interface ${interfaceName} {\n${properties.join('\n')}\n}`
        types.set(interfaceName, typeDefinition)
        return interfaceName
      }

      const rootType = generateInterface(parsed, interfaceName)
      const allTypes = Array.from(types.values()).join('\n\n')
      
      setTypescript(allTypes)
    } catch (error) {
      setTypescript(`Error converting JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  const handleConvert = () => {
    convertJsonToTypescript(json, typeName || 'Root')
  }

  const handleReset = () => {
    setJson('')
    setTypescript('')
    setTypeName('Root')
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">JSON to TypeScript</h3>
        <p className="text-sm text-gray-600">
          Convert your JSON data to TypeScript interface definitions. Automatically infers types from your JSON structure.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Interface Name</label>
          <input
            type="text"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="e.g., User, Product, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
            <label className="text-sm font-medium text-gray-700">JSON Input</label>
          </div>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="Paste your JSON here...&#10;&#10;Example:&#10;{&#10;  &quot;name&quot;: &quot;John&quot;,&#10;  &quot;age&quot;: 30,&#10;  &quot;email&quot;: &quot;john@example.com&quot;&#10;}"
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
            placeholder="TypeScript interfaces will appear here..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Features:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Automatic type inference from JSON</li>
          <li>✓ Nested object support</li>
          <li>✓ Array type detection</li>
          <li>✓ Null value handling</li>
          <li>✓ Customizable interface names</li>
          <li>✓ Properly formatted output</li>
        </ul>
      </div>
    </div>
  )
}
