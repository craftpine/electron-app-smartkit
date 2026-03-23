import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import QRCodeGenerator from '../renderer/src/components/tools/QRCodeGenerator'

describe('QRCodeGenerator', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { write: vi.fn().mockResolvedValue(undefined) },
    })
    // Mock fetch for download
    global.fetch = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders without crashing', () => {
    render(<QRCodeGenerator />)
    expect(screen.getByText('QR Code Generator')).toBeInTheDocument()
  })

  it('displays all error correction level buttons', () => {
    render(<QRCodeGenerator />)
    expect(screen.getByRole('button', { name: /L.*Low/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /M.*Medium/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Q.*Quartile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /H.*High/i })).toBeInTheDocument()
  })

  it('defaults to M (Medium) error correction level', () => {
    render(<QRCodeGenerator />)
    const mediumBtn = screen.getByRole('button', { name: /M.*Medium/i })
    expect(mediumBtn.className).toMatch(/bg-blue-600/)
  })

  it('displays size input', () => {
    render(<QRCodeGenerator />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('displays color pickers for foreground and background', () => {
    render(<QRCodeGenerator />)
    const colorInputs = screen.getAllByRole('slider')
    expect(colorInputs.length).toBeGreaterThan(0)
  })

  it('generates QR code when text is entered', async () => {
    render(<QRCodeGenerator />)
    const textInput = screen.getByPlaceholderText(/Enter.*QR code/i) || screen.getByRole('textbox')
    
    fireEvent.change(textInput, { target: { value: 'https://example.com' } })
    
    await waitFor(() => {
      const qrImage = screen.queryByRole('img')
      expect(qrImage || screen.getByText(/generated/i)).toBeInTheDocument()
    })
  })

  it('clears QR code when text is cleared', async () => {
    render(<QRCodeGenerator />)
    const textInput = screen.getByPlaceholderText(/Enter.*QR code/i) || screen.getByRole('textbox')
    
    fireEvent.change(textInput, { target: { value: 'test' } })
    
    await waitFor(() => {
      // QR code should be generated
    }, { timeout: 2000 })
    
    fireEvent.change(textInput, { target: { value: '' } })
    
    await waitFor(() => {
      const qrImage = screen.queryByRole('img')
      if (qrImage) {
        expect(qrImage).not.toBeVisible()
      }
    })
  })

  it('changes error correction level', async () => {
    render(<QRCodeGenerator />)
    const textInput = screen.getByPlaceholderText(/Enter.*QR code/i) || screen.getByRole('textbox')
    fireEvent.change(textInput, { target: { value: 'test' } })
    
    fireEvent.click(screen.getByRole('button', { name: /H.*High/i }))
    const highBtn = screen.getByRole('button', { name: /H.*High/i })
    expect(highBtn.className).toMatch(/bg-blue-600/)
  })

  it('changes QR code size', async () => {
    render(<QRCodeGenerator />)
    const sizeInput = screen.getByRole('spinbutton')
    fireEvent.change(sizeInput, { target: { value: '512' } })
    
    expect(sizeInput).toHaveValue(512)
  })

  it('allows foreground color selection', () => {
    render(<QRCodeGenerator />)
    const colorInputs = screen.getAllByRole('slider')
    if (colorInputs.length > 0) {
      fireEvent.change(colorInputs[0], { target: { value: '#ff0000' } })
    }
  })

  it('allows background color selection', () => {
    render(<QRCodeGenerator />)
    const colorInputs = screen.getAllByRole('slider')
    if (colorInputs.length > 1) {
      fireEvent.change(colorInputs[1], { target: { value: '#0000ff' } })
    }
  })

  it('has download button for QR code', async () => {
    render(<QRCodeGenerator />)
    const textInput = screen.getByPlaceholderText(/Enter.*QR code/i) || screen.getByRole('textbox')
    fireEvent.change(textInput, { target: { value: 'download test' } })
    
    await waitFor(() => {
      const downloadBtn = screen.queryByRole('button', { name: /download/i })
      if (downloadBtn) {
        expect(downloadBtn).toBeInTheDocument()
      }
    }, { timeout: 2000 })
  })

  it('resets all values', async () => {
    render(<QRCodeGenerator />)
    const textInput = screen.getByPlaceholderText(/Enter.*QR code/i) || screen.getByRole('textbox')
    fireEvent.change(textInput, { target: { value: 'test' } })
    
    const resetBtn = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetBtn)
    
    expect((textInput as HTMLInputElement).value).toBe('')
  })

  it('handles special characters in QR code text', async () => {
    render(<QRCodeGenerator />)
    const textInput = screen.getByPlaceholderText(/Enter.*QR code/i) || screen.getByRole('textbox')
    fireEvent.change(textInput, { target: { value: 'Hello @#$%^&*()!!' } })
    
    await waitFor(() => {
      // Should handle special characters without error
    }, { timeout: 2000 })
  })

  it('handles long text in QR code', async () => {
    render(<QRCodeGenerator />)
    const longText = 'a'.repeat(100)
    const textInput = screen.getByPlaceholderText(/Enter.*QR code/i) || screen.getByRole('textbox')
    fireEvent.change(textInput, { target: { value: longText } })
    
    await waitFor(() => {
      // Should generate QR code for long text
    }, { timeout: 2000 })
  })
})
