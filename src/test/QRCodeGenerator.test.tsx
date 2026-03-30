import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import QRCodeGenerator from '../renderer/src/components/tools/QRCodeGenerator'

describe('QRCodeGenerator', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { write: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders title and input', () => {
    render(<QRCodeGenerator />)
    expect(screen.getByText('QR Code Generator')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter text or URL to encode/i)).toBeInTheDocument()
  })

  it('renders size control and error correction selector', () => {
    render(<QRCodeGenerator />)
    expect(screen.getByText(/Size \(px\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Error Correction/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('reset clears text input', () => {
    render(<QRCodeGenerator />)
    const input = screen.getByPlaceholderText(/Enter text or URL to encode/i)
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect((input as HTMLTextAreaElement).value).toBe('')
  })
})
