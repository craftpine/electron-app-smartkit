import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import CertificateDecoder from '../renderer/src/components/tools/CertificateDecoder'

describe('CertificateDecoder', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders title and textarea', () => {
    render(<CertificateDecoder />)
    expect(screen.getByText('Certificate Decoder')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Paste your certificate here/i)).toBeInTheDocument()
  })

  it('parses basic fields from input', () => {
    render(<CertificateDecoder />)
    const input = screen.getByPlaceholderText(/Paste your certificate here/i)
    fireEvent.change(input, {
      target: { value: 'Subject: CN=example.com\nIssuer: CN=Test CA\nSerial Number: 123' },
    })

    expect(screen.getByText(/example.com/i)).toBeInTheDocument()
    expect(screen.getByText(/Test CA/i)).toBeInTheDocument()
  })

  it('resets all values', () => {
    render(<CertificateDecoder />)
    const input = screen.getByPlaceholderText(/Paste your certificate here/i)
    fireEvent.change(input, { target: { value: 'Subject: CN=test' } })
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect((input as HTMLTextAreaElement).value).toBe('')
  })
})
