import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState('# Markdown Preview\n\nType your markdown here to see the preview.\n\n## Syntax Support\n- **Bold** and *Italic* text\n- [Links](https://example.com)\n- \`Inline code\`\n\n```javascript\n// Code blocks\nconst greeting = "Hello World";\nconsole.log(greeting);\n```\n\n> Blockquotes\n\n| Tables | Are | Supported |\n| --- | --- | --- |\n| Yes | Very | Much |')
  const [copied, setCopied] = useState(false)

  const handleReset = () => {
    setMarkdown('')
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Markdown Preview</h3>
        <p className="text-sm text-gray-600">
          Write markdown and instantly see the rendered output. Supports GitHub Flavored Markdown (tables, strikethrough, tasklists).
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Input */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Markdown Input</label>
            {markdown && (
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
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type markdown here..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Preview</label>
          </div>
          <div className="flex-1 p-4 overflow-auto prose prose-sm max-w-none focus:outline-none bg-white text-gray-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
