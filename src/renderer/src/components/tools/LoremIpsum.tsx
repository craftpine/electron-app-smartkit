import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'

const LOREM_IPSUM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
]

const LOREM_PARAGRAPH = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

export default function LoremIpsum() {
  const [generatorType, setGeneratorType] = useState<'paragraphs' | 'words' | 'sentences'>('paragraphs')
  const [quantity, setQuantity] = useState(3)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const getRandomWord = (): string => {
    return LOREM_IPSUM_WORDS[Math.floor(Math.random() * LOREM_IPSUM_WORDS.length)]
  }

  const generateWords = (count: number): string => {
    const words: string[] = []
    for (let i = 0; i < count; i++) {
      words.push(getRandomWord())
    }
    return words.join(' ')
  }

  const generateSentences = (count: number): string => {
    const sentences: string[] = []
    for (let i = 0; i < count; i++) {
      const wordCount = Math.floor(Math.random() * 10) + 5
      let sentence = generateWords(wordCount)
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
      sentences.push(sentence)
    }
    return sentences.join(' ')
  }

  const generateParagraphs = (count: number): string => {
    const paragraphs: string[] = []
    for (let i = 0; i < count; i++) {
      paragraphs.push(LOREM_PARAGRAPH)
    }
    return paragraphs.join('\n\n')
  }

  const handleGenerate = () => {
    const safeQuantity = Math.max(1, Math.min(quantity, 1000))

    let result = ''
    switch (generatorType) {
      case 'words':
        result = generateWords(safeQuantity)
        break
      case 'sentences':
        result = generateSentences(safeQuantity)
        break
      case 'paragraphs':
      default:
        result = generateParagraphs(safeQuantity)
        break
    }

    setOutput(result)
  }

  const handleReset = () => {
    setQuantity(3)
    setGeneratorType('paragraphs')
    setOutput('')
    setCopied(false)
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Lorem Ipsum Generator</h2>
        <button
          onClick={handleReset}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Generate
          </label>
          <div className="flex space-x-2">
            {(['paragraphs', 'words', 'sentences'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setGeneratorType(type)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  generatorType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of {generatorType}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="1000"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              (1-1000)
            </span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Generate
        </button>

        {/* Output Section */}
        {output && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Generated Text</h3>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors flex items-center space-x-1"
              >
                <Copy size={16} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-700 focus:outline-none resize-none overflow-y-auto"
            />
          </div>
        )}

        {/* Features */}
        {!output && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Generate paragraphs, words, or sentences</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Customize quantity (1-1000 items)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Copy to clipboard with one click</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span>Standard Lorem Ipsum placeholder text</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
