import { Download, RefreshCw, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import heic2any from 'heic2any'

export default function ImageConverter() {
  const [image, setImage] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>('')
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'gif'>('png')
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [quality, setQuality] = useState(0.9)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageName(file.name.split('.')[0])

    try {
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || 
                     file.name.toLowerCase().endsWith('.heic') || 
                     file.name.toLowerCase().endsWith('.heif')

      let blobToUse: Blob = file
      let imageUrl: string = ''

      // Handle HEIC/HEIF conversion
      if (isHeic) {
        try {
          const converted = await heic2any({
            blob: file,
            toType: 'image/jpeg'
          })
          blobToUse = converted instanceof Blob ? converted : (converted as any)[0]
          
          // Create URL from converted blob
          imageUrl = URL.createObjectURL(blobToUse)
        } catch (error) {
          console.error('HEIC conversion failed:', error)
          alert('Failed to convert HEIC image. Make sure the file is a valid HEIC/HEIF image.')
          return
        }
      } else {
        // For non-HEIC files, use the file directly
        imageUrl = URL.createObjectURL(file)
      }

      // Display the image and get dimensions
      const img = new Image()
      img.onload = () => {
        setImage(imageUrl)
        setWidth(img.width)
        setHeight(img.height)
      }
      img.onerror = () => {
        console.error('Failed to load image')
        URL.revokeObjectURL(imageUrl)
        alert('Failed to load image. Please try another file.')
      }
      img.src = imageUrl
    } catch (error) {
      console.error('Error processing file:', error)
      alert('An error occurred while processing the file.')
    }
  }

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (maintainAspectRatio && height > 0) {
      const newHeight = Math.round((newWidth * height) / width)
      setHeight(newHeight)
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (maintainAspectRatio && width > 0) {
      const newWidth = Math.round((newHeight * width) / height)
      setWidth(newWidth)
    }
  }

  const convertImage = async () => {
    if (!image || !canvasRef.current) return

    setLoading(true)
    try {
      const img = new Image()
      const timeout = setTimeout(() => {
        console.error('Image conversion timeout')
        setLoading(false)
      }, 30000) // 30 second timeout

      img.onload = () => {
        clearTimeout(timeout)
        try {
          const canvas = canvasRef.current!
          canvas.width = width || img.width
          canvas.height = height || img.height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            setLoading(false)
            return
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                setLoading(false)
                return
              }
              try {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${imageName || 'image'}.${format}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              } catch (error) {
                console.error('Error downloading blob:', error)
              } finally {
                setLoading(false)
              }
            },
            `image/${format}`,
            format === 'jpeg' ? quality : undefined
          )
        } catch (error) {
          console.error('Error in image conversion:', error)
          setLoading(false)
        }
      }

      img.onerror = () => {
        clearTimeout(timeout)
        console.error('Failed to load image for conversion')
        setLoading(false)
      }

      img.src = image
    } catch (error) {
      console.error('Error converting image:', error)
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (image && image.startsWith('blob:')) {
      URL.revokeObjectURL(image)
    }
    setImage(null)
    setImageName('')
    setFormat('png')
    setWidth(0)
    setHeight(0)
    setQuality(0.9)
    setLoading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Converter</h3>
        <p className="text-sm text-gray-600">
          Convert images between formats, resize, and adjust quality settings.
        </p>
      </div>

      {/* Main Content */}
      {!image ? (
        // Upload Area
        <div className="flex-1 flex items-center justify-center mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md p-12 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="font-medium text-gray-700">Click to upload an image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPEG, WebP, GIF, HEIC supported</p>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        // Preview and Controls
        <>
          {/* Image Preview */}
          <div className="mb-6 flex justify-center">
            <div className="max-w-sm">
              <img
                src={image}
                alt="Preview"
                className="w-full rounded-lg border border-gray-300 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">{imageName}</p>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as typeof format)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
                <option value="gif">GIF</option>
              </select>
            </div>

            {/* Quality Control (for JPEG) */}
            {format === 'jpeg' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Aspect Ratio Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Maintain aspect ratio</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={convertImage}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Converting...' : 'Download'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Features:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>✓ Convert between PNG, JPEG, WebP, GIF, HEIC</li>
              <li>✓ Auto-convert HEIC to standard formats</li>
              <li>✓ Resize images to custom dimensions</li>
              <li>✓ Maintain aspect ratio option</li>
              <li>✓ JPEG quality control</li>
            </ul>
          </div>
        </>
      )}

      {/* Hidden Canvas for conversion */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
