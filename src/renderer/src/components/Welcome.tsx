import { Shuffle, Wand2 } from 'lucide-react'

type WelcomeProps = {
  onSelectTool?: (toolId: string) => void
}

export default function Welcome({ onSelectTool }: WelcomeProps) {
  return (
    <div className="h-full flex flex-col p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center mb-8">
        <div className="mb-6">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-6">
            <Shuffle className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to Dev Tools</h1>
          <p className="text-lg text-gray-600 max-w-lg">
            A collection of powerful utilities to convert, transform, and optimize your code and data
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Converters */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shuffle className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Converters</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Convert between different formats and standards
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onSelectTool?.('html-to-jsx')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              → HTML to JSX
            </button>
            <button
              onClick={() => onSelectTool?.('html-to-pug')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              → HTML to Pug
            </button>
            <button
              onClick={() => onSelectTool?.('money-converter')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              → Money Converter
            </button>
            <button
              onClick={() => onSelectTool?.('unit-converter')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              → Unit Converter
            </button>
          </div>
        </div>

        {/* Transforms */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Wand2 className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Transforms</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Transform your code to different languages and formats
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onSelectTool?.('json-to-typescript')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              → JSON to TypeScript
            </button>
            <button
              onClick={() => onSelectTool?.('css-to-tailwind')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              → CSS to Tailwind
            </button>
            <button
              onClick={() => onSelectTool?.('javascript-to-typescript')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              → JS to TypeScript
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs text-gray-600">Fast & Reliable</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-xs text-gray-600">Beautiful UI</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs text-gray-600">Private & Secure</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-xs text-gray-600">Copy Output</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 pb-1 text-center text-sm text-gray-600">
        <p>Select a tool from the sidebar to get started</p>
      </div>
    </div>
  )
}
