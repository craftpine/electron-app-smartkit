import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('heic2any', () => ({
  default: vi.fn()
}))

import ImageConverter from '../renderer/src/components/tools/ImageConverter'
import { crc32, createZip } from '../renderer/src/utils/zip'

class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 200
  naturalHeight = 100
  set src(_value: string) {
    setTimeout(() => this.onload?.(), 0)
  }
}

const makeFile = (name: string, type = 'image/png'): File =>
  new File([new Uint8Array([1, 2, 3])], name, { type })

describe('ImageConverter', () => {
  const originalImage = globalThis.Image

  beforeEach(() => {
    globalThis.Image = MockImage as unknown as typeof Image
    URL.createObjectURL = vi.fn(() => `blob:mock-${Math.random()}`)
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    globalThis.Image = originalImage
  })

  it('renders title and description', () => {
    render(<ImageConverter />)
    expect(screen.getByText('Image Converter')).toBeInTheDocument()
    expect(screen.getByText(/Convert images between formats/i)).toBeInTheDocument()
  })

  it('shows upload prompt with drag and drop hint in initial state', () => {
    render(<ImageConverter />)
    expect(screen.getByText(/Click to upload images/i)).toBeInTheDocument()
    expect(screen.getByText(/drag and drop multiple files/i)).toBeInTheDocument()
  })

  it('renders hidden file input that accepts multiple files', () => {
    render(<ImageConverter />)
    const fileInput = screen.getByTestId('image-file-input') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    expect(fileInput.multiple).toBe(true)
  })

  it('adds multiple images selected from the file picker', async () => {
    render(<ImageConverter />)
    const fileInput = screen.getByTestId('image-file-input')

    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [makeFile('a.png'), makeFile('b.jpg', 'image/jpeg')] }
      })
    })

    expect(await screen.findByText('2 images selected')).toBeInTheDocument()
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(await screen.findByText(/Download all \(2\) as ZIP/)).toBeInTheDocument()
  })

  it('adds multiple images via drag and drop and ignores non-image files', async () => {
    const { container } = render(<ImageConverter />)
    const root = container.firstChild as HTMLElement

    await act(async () => {
      fireEvent.drop(root, {
        dataTransfer: {
          files: [
            makeFile('one.png'),
            makeFile('two.webp', 'image/webp'),
            makeFile('notes.txt', 'text/plain')
          ],
          types: ['Files']
        }
      })
    })

    expect(await screen.findByText('2 images selected')).toBeInTheDocument()
    expect(screen.queryByText('notes')).not.toBeInTheDocument()
  })

  it('appends more images when dropping onto an existing list and can remove one', async () => {
    const { container } = render(<ImageConverter />)
    const root = container.firstChild as HTMLElement

    await act(async () => {
      fireEvent.drop(root, { dataTransfer: { files: [makeFile('one.png')], types: ['Files'] } })
    })
    expect(await screen.findByText('1 image selected')).toBeInTheDocument()

    await act(async () => {
      fireEvent.drop(root, {
        dataTransfer: { files: [makeFile('two.png'), makeFile('three.png')], types: ['Files'] }
      })
    })
    expect(await screen.findByText('3 images selected')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Remove two'))
    expect(screen.getByText('2 images selected')).toBeInTheDocument()
  })

  it('reset clears all images', async () => {
    render(<ImageConverter />)
    await act(async () => {
      fireEvent.change(screen.getByTestId('image-file-input'), {
        target: { files: [makeFile('a.png'), makeFile('b.png')] }
      })
    })
    expect(await screen.findByText('2 images selected')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Reset'))
    expect(screen.getByText(/Click to upload images/i)).toBeInTheDocument()
  })
})

describe('zip utils', () => {
  it('computes CRC32 correctly', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
  })

  it('creates a zip with the expected structure', async () => {
    const zip = createZip([
      { name: 'a.png', data: new Uint8Array([1, 2, 3]) },
      { name: 'b.png', data: new Uint8Array([4, 5]) }
    ])
    const bytes = new Uint8Array(await zip.arrayBuffer())
    const view = new DataView(bytes.buffer)

    expect(zip.type).toBe('application/zip')
    expect(view.getUint32(0, true)).toBe(0x04034b50)
    // End of central directory is the last 22 bytes
    const eocd = bytes.length - 22
    expect(view.getUint32(eocd, true)).toBe(0x06054b50)
    expect(view.getUint16(eocd + 10, true)).toBe(2)
  })
})
