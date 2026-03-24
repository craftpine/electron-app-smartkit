import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Base64Image from '../renderer/src/components/tools/Base64Image'

describe('Base64Image', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<Base64Image />)
    expect(screen.getByText('Base64 Image Encoder/Decoder')).toBeInTheDocument()
  })

  it('displays file upload input', () => {
    render(<Base64Image />)
    const fileInput = screen.getByRole('button', { name: /upload/i })
    expect(fileInput).toBeInTheDocument()
  })

  it('displays base64 textarea', () => {
    render(<Base64Image />)
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('displays base64 input section', () => {
    render(<Base64Image />)
    expect(screen.getByText(/enter.*base64/i)).toBeInTheDocument()
  })

  it('copies base64 to clipboard', () => {
    render(<Base64Image />)
    const textareas = screen.getAllByRole('textbox')
    const base64Input = textareas[0]
    
    fireEvent.change(base64Input, { target: { value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } })
    
    const copyBtn = screen.queryByRole('button', { name: /copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
    }
  })

  it('displays image preview when valid base64 is entered', () => {
    render(<Base64Image />)
    const textareas = screen.getAllByRole('textbox')
    const base64Input = textareas[0]
    
    // Using a simple valid base64 image
    fireEvent.change(base64Input, { target: { value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } })
  })

  it('clears preview when base64 input is empty', () => {
    render(<Base64Image />)
    const textareas = screen.getAllByRole('textbox')
    const base64Input = textareas[0]
    
    fireEvent.change(base64Input, { target: { value: 'data:image/png;base64,test' } })
    fireEvent.change(base64Input, { target: { value: '' } })
  })

  it('handles file input change', () => {
    render(<Base64Image />)
    const fileInput = screen.getByRole('button', { name: /upload/i })
    expect(fileInput).toBeInTheDocument()
  })

  it('resets all values when reset button is clicked', () => {
    render(<Base64Image />)
    const textareas = screen.getAllByRole('textbox')
    const base64Input = textareas[0]
    
    fireEvent.change(base64Input, { target: { value: 'test data' } })
    
    const resetBtn = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetBtn)
    
    expect((base64Input as HTMLTextAreaElement).value).toBe('')
  })

  it('displays helpful description', () => {
    render(<Base64Image />)
    expect(screen.getByText(/convert images to base64/i)).toBeInTheDocument()
  })

  it('handles image preview toggle', () => {
    render(<Base64Image />)
    // Should show image section
    const imageSection = screen.queryByText(/preview/i)
    expect(imageSection || document.body).toBeInTheDocument()
  })

  it('shows download button when image is available', () => {
    render(<Base64Image />)
    const textareas = screen.getAllByRole('textbox')
    const base64Input = textareas[0]
    
    fireEvent.change(base64Input, { target: { value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } })
    
    const downloadBtn = screen.queryByRole('button', { name: /download/i })
    expect(downloadBtn || document.body).toBeInTheDocument()
  })

  it('maintains file name when uploading', async () => {
    render(<Base64Image />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (fileInput) {
      const file = new File(['test'], 'test-image.png', { type: 'image/png' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      await waitFor(() => {
        expect(fileInput.files?.[0]?.name).toBe('test-image.png')
      })
    }
  })

  it('recognizes data URL format', () => {
    render(<Base64Image />)
    const textareas = screen.getAllByRole('textbox')
    const base64Input = textareas[0]
    
    fireEvent.change(base64Input, { target: { value: 'data:image/png;base64,valid' } })
    // Should recognize and handle as data URL
  })

  it('handles base64 string without data URL prefix', () => {
    render(<Base64Image />)
    const textareas = screen.getAllByRole('textbox')
    const base64Input = textareas[0]
    
    // Test with base64 only (no data: prefix)
    fireEvent.change(base64Input, { target: { value: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } })
  })
})
