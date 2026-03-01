import { Copy, Download, RefreshCw, Upload } from 'lucide-react'
import { useState, useRef } from 'react'

export default function Base64Image() {
  const [base64, setBase64] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [copied, setCopied] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setBase64(result)
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleBase64Input = (value: string) => {
    setBase64(value)
    if (value.trim()) {
      // Check if it's a valid data URL
      if (value.startsWith('data:image')) {
        setImagePreview(value)
      } else {
        // Try to create a data URL from base64 string
        try {
          const dataUrl = `data:image/png;base64,${value.replace(/\s/g, '')}`
          setImagePreview(dataUrl)
        } catch {
          setImagePreview('')
        }
      }
    } else {
      setImagePreview('')
    }
  }

  const handleReset = () => {
    setBase64('')
    setImagePreview('')
    setCopied(false)
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(base64)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!imagePreview) return

    const link = document.createElement('a')
    link.href = imagePreview
    link.download = fileName || 'image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Base64 Image Encoder/Decoder</h3>
        <p className="text-sm text-gray-600">
          Convert images to base64 strings or decode base64 strings to images. Perfect for embedding images in CSS or HTML.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
        {imagePreview && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Base64 Input/Output */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Base64 String</label>
            {base64 && (
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
            value={base64}
            onChange={(e) => handleBase64Input(e.target.value)}
            placeholder="Paste base64 string here or upload an image..."
            className="flex-1 p-4 font-mono text-xs resize-none focus:outline-none"
          />
        </div>

        {/* Image Preview */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <label className="text-sm font-medium text-gray-700">Image Preview</label>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-gray-50">
            {imagePreview ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded shadow-lg"
                />
                {fileName && (
                  <p className="text-xs text-gray-600 font-mono">{fileName}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No image to preview</p>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Supported Features:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Encode images to base64</li>
          <li>✓ Decode base64 to images</li>
          <li>✓ Supports all common image formats (PNG, JPG, GIF, SVG, WebP)</li>
          <li>✓ Copy base64 string to clipboard</li>
          <li>✓ Download decoded images</li>
        </ul>
      </div>
    </div>
  )
}
