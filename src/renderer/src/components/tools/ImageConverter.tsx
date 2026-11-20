import { Download, FileArchive, Loader2, Plus, RefreshCw, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import heic2any from 'heic2any'
import { createZip } from '../../utils/zip'

type OutputFormat = 'png' | 'jpeg' | 'webp' | 'gif'
type ResizeMode = 'original' | 'percent' | 'custom'

interface ImageItem {
  id: string
  name: string
  size: number
  url: string | null
  width: number
  height: number
  status: 'loading' | 'ready' | 'error'
  error?: string
}

let idCounter = 0
const nextId = (): string => `img-${Date.now()}-${idCounter++}`

const isHeicFile = (file: File): boolean => {
  const name = file.name.toLowerCase()
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  )
}

const isImageFile = (file: File): boolean => file.type.startsWith('image/') || isHeicFile(file)

const baseName = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.')
  return dot > 0 ? fileName.slice(0, dot) : fileName
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const extensionForBlob = (blob: Blob, requested: OutputFormat): string => {
  // Chromium cannot encode every format (e.g. GIF) and falls back to PNG,
  // so name the file after what was actually produced.
  const actual = blob.type.replace('image/', '')
  if (!actual) return requested
  return actual === 'jpeg' ? 'jpg' : actual
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })

const triggerDownload = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function ImageConverter(): React.JSX.Element {
  const [items, setItems] = useState<ImageItem[]>([])
  const [format, setFormat] = useState<OutputFormat>('png')
  const [quality, setQuality] = useState(0.9)
  const [resizeMode, setResizeMode] = useState<ResizeMode>('original')
  const [scale, setScale] = useState(100)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<ImageItem[]>([])
  itemsRef.current = items

  // Revoke all preview URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => item.url && URL.revokeObjectURL(item.url))
    }
  }, [])

  const updateItem = (id: string, patch: Partial<ImageItem>): void => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const prepareFile = async (id: string, file: File): Promise<void> => {
    let url: string | null = null
    try {
      let blob: Blob = file
      if (isHeicFile(file)) {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg' })
        blob = Array.isArray(converted) ? converted[0] : converted
      }
      url = URL.createObjectURL(blob)
      const img = await loadImage(url)
      // The item may have been removed while it was loading
      if (!itemsRef.current.some((item) => item.id === id)) {
        URL.revokeObjectURL(url)
        return
      }
      updateItem(id, { url, width: img.naturalWidth, height: img.naturalHeight, status: 'ready' })
    } catch (error) {
      console.error('Error processing file:', error)
      if (url) URL.revokeObjectURL(url)
      updateItem(id, {
        status: 'error',
        error: isHeicFile(file) ? 'Invalid HEIC/HEIF image' : 'Unable to read image'
      })
    }
  }

  const addFiles = (fileList: FileList | File[] | null): void => {
    if (!fileList) return
    const files = Array.from(fileList).filter(isImageFile)
    if (files.length === 0) return

    const newItems: ImageItem[] = files.map((file) => ({
      id: nextId(),
      name: baseName(file.name),
      size: file.size,
      url: null,
      width: 0,
      height: 0,
      status: 'loading'
    }))

    itemsRef.current = [...itemsRef.current, ...newItems]
    setItems((prev) => [...prev, ...newItems])
    newItems.forEach((item, i) => void prepareFile(item.id, files[i]))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    addFiles(event.target.files)
    // Allow selecting the same files again
    event.target.value = ''
  }

  const handleDragEnter = (e: React.DragEvent): void => {
    e.preventDefault()
    if (!e.dataTransfer.types.includes('Files')) return
    dragCounter.current++
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0) setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const removeItem = (id: string): void => {
    const item = itemsRef.current.find((i) => i.id === id)
    if (item?.url) URL.revokeObjectURL(item.url)
    itemsRef.current = itemsRef.current.filter((i) => i.id !== id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const getTargetSize = (item: ImageItem): { w: number; h: number } => {
    const ow = item.width
    const oh = item.height
    if (resizeMode === 'percent') {
      const factor = Math.max(1, scale) / 100
      return { w: Math.max(1, Math.round(ow * factor)), h: Math.max(1, Math.round(oh * factor)) }
    }
    if (resizeMode === 'custom') {
      const tw = width > 0 ? width : 0
      const th = height > 0 ? height : 0
      if (!tw && !th) return { w: ow, h: oh }
      if (maintainAspectRatio) {
        // Fit inside the box; an empty dimension means "auto"
        const ratio = Math.min(tw ? tw / ow : Infinity, th ? th / oh : Infinity)
        return { w: Math.max(1, Math.round(ow * ratio)), h: Math.max(1, Math.round(oh * ratio)) }
      }
      return { w: tw || ow, h: th || oh }
    }
    return { w: ow, h: oh }
  }

  const convertItem = async (item: ImageItem): Promise<{ blob: Blob; fileName: string }> => {
    if (!item.url) throw new Error('Image not ready')
    const img = await loadImage(item.url)
    const { w, h } = getTargetSize(item)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')

    if (format === 'jpeg') {
      // JPEG has no transparency – avoid black backgrounds
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
    }
    ctx.drawImage(img, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(
        resolve,
        `image/${format}`,
        format === 'jpeg' || format === 'webp' ? quality : undefined
      )
    )
    if (!blob) throw new Error('Conversion failed')
    return { blob, fileName: `${item.name || 'image'}.${extensionForBlob(blob, format)}` }
  }

  const setBusy = (id: string, busy: boolean): void => {
    setBusyIds((prev) => {
      const next = new Set(prev)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const downloadOne = async (item: ImageItem): Promise<void> => {
    setBusy(item.id, true)
    try {
      const { blob, fileName } = await convertItem(item)
      triggerDownload(blob, fileName)
    } catch (error) {
      console.error('Error converting image:', error)
      updateItem(item.id, { status: 'error', error: 'Conversion failed' })
    } finally {
      setBusy(item.id, false)
    }
  }

  const readyItems = items.filter((item) => item.status === 'ready')

  const downloadAll = async (): Promise<void> => {
    if (readyItems.length === 0) return
    if (readyItems.length === 1) {
      await downloadOne(readyItems[0])
      return
    }

    setBulkLoading(true)
    try {
      const usedNames = new Map<string, number>()
      const entries: { name: string; data: Uint8Array }[] = []
      for (const item of readyItems) {
        try {
          const { blob, fileName } = await convertItem(item)
          const count = usedNames.get(fileName) ?? 0
          usedNames.set(fileName, count + 1)
          const uniqueName =
            count === 0 ? fileName : fileName.replace(/(\.[^.]+)$/, ` (${count})$1`)
          entries.push({ name: uniqueName, data: new Uint8Array(await blob.arrayBuffer()) })
        } catch (error) {
          console.error('Error converting image:', error)
          updateItem(item.id, { status: 'error', error: 'Conversion failed' })
        }
      }
      if (entries.length > 0) {
        triggerDownload(createZip(entries), `converted-images-${format}.zip`)
      }
    } finally {
      setBulkLoading(false)
    }
  }

  const handleReset = (): void => {
    itemsRef.current.forEach((item) => item.url && URL.revokeObjectURL(item.url))
    itemsRef.current = []
    setItems([])
    setFormat('png')
    setQuality(0.9)
    setResizeMode('original')
    setScale(100)
    setWidth(0)
    setHeight(0)
    setMaintainAspectRatio(true)
    setBusyIds(new Set())
    setBulkLoading(false)
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div
      className="h-full flex flex-col p-6 bg-gray-50 overflow-auto relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Converter</h3>
        <p className="text-sm text-gray-600">
          Convert images between formats, resize, and adjust quality settings.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="image-file-input"
      />

      {items.length === 0 ? (
        // Upload Area
        <div className="flex-1 flex items-center justify-center mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-md p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="font-medium text-gray-700">Click to upload images</p>
                <p className="text-sm text-gray-500 mt-1">or drag and drop multiple files here</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPEG, WebP, GIF, HEIC supported</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Image list */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                {items.length} image{items.length > 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-1.5 text-gray-700"
              >
                <Plus className="w-4 h-4" />
                Add images
              </button>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              {items.map((item) => {
                const target = item.status === 'ready' ? getTargetSize(item) : null
                const busy = busyIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="relative h-28 bg-gray-100 flex items-center justify-center">
                      {item.status === 'loading' && (
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      )}
                      {item.status === 'error' && (
                        <p className="text-xs text-red-600 px-2 text-center">{item.error}</p>
                      )}
                      {item.status === 'ready' && item.url && (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="absolute top-1 right-1 p-1 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-2 flex-1 flex flex-col gap-1">
                      <p className="text-xs font-medium text-gray-800 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {formatBytes(item.size)}
                        {item.status === 'ready' && (
                          <>
                            {' · '}
                            {item.width}×{item.height}
                            {target && (target.w !== item.width || target.h !== item.height) && (
                              <>
                                {' '}
                                → {target.w}×{target.h}
                              </>
                            )}
                          </>
                        )}
                      </p>
                      <button
                        onClick={() => downloadOne(item)}
                        disabled={item.status !== 'ready' || busy || bulkLoading}
                        className="mt-auto px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {busy ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        Download
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as OutputFormat)}
                className={inputClass}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
                <option value="gif">GIF</option>
              </select>
            </div>

            {(format === 'jpeg' || format === 'webp') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resize</label>
              <select
                value={resizeMode}
                onChange={(e) => setResizeMode(e.target.value as ResizeMode)}
                className={inputClass}
              >
                <option value="original">Keep original size</option>
                <option value="percent">Scale by percentage</option>
                <option value="custom">Custom width / height</option>
              </select>
            </div>

            {resizeMode === 'percent' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scale (%)</label>
                <input
                  type="number"
                  min={1}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {resizeMode === 'custom' && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-6 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
                  <input
                    type="number"
                    min={0}
                    value={width || ''}
                    placeholder="Auto"
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={height || ''}
                    placeholder="Auto"
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  Maintain aspect ratio (fit inside width × height)
                </span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={downloadAll}
              disabled={bulkLoading || readyItems.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {readyItems.length > 1 ? (
                <FileArchive className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {bulkLoading
                ? 'Converting...'
                : readyItems.length > 1
                  ? `Download all (${readyItems.length}) as ZIP`
                  : 'Download'}
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
              <li>✓ Select or drag & drop multiple images at once</li>
              <li>✓ Convert between PNG, JPEG, WebP, GIF, HEIC</li>
              <li>✓ Auto-convert HEIC to standard formats</li>
              <li>✓ Resize by percentage or custom dimensions</li>
              <li>✓ JPEG / WebP quality control</li>
              <li>✓ Download all converted images as a single ZIP</li>
            </ul>
          </div>
        </>
      )}

      {/* Drop overlay when list is already shown */}
      {isDragging && items.length > 0 && (
        <div className="absolute inset-2 border-2 border-dashed border-blue-500 bg-blue-50/80 rounded-lg flex items-center justify-center pointer-events-none z-10">
          <p className="text-blue-700 font-medium">Drop images to add them</p>
        </div>
      )}
    </div>
  )
}
