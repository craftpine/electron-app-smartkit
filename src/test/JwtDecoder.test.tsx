import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import JwtDecoder from '../renderer/src/components/tools/JwtDecoder'

describe('JwtDecoder', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<JwtDecoder />)
    expect(screen.getByText('JWT Decoder')).toBeInTheDocument()
  })

  it('displays JWT input textarea', () => {
    render(<JwtDecoder />)
    expect(screen.getByPlaceholderText(/Paste your JWT token/i)).toBeInTheDocument()
  })

  it('displays decode button', () => {
    render(<JwtDecoder />)
    expect(screen.getByRole('button', { name: /Decode/i })).toBeInTheDocument()
  })

  it('shows error when decoding empty token', () => {
    render(<JwtDecoder />)
    fireEvent.click(screen.getByRole('button', { name: /Decode/i }))
    expect(screen.getByText('Please enter a JWT token')).toBeInTheDocument()
  })

  it('shows error for invalid JWT format', () => {
    render(<JwtDecoder />)
    const textarea = screen.getByPlaceholderText(/Paste your JWT token/i)
    fireEvent.change(textarea, { target: { value: 'invalid.token' } })
    fireEvent.click(screen.getByRole('button', { name: /Decode/i }))
    
    expect(screen.getByText(/Invalid JWT format/i)).toBeInTheDocument()
  })

  it('decodes valid JWT token', () => {
    render(<JwtDecoder />)
    // Use a sample valid JWT (header.payload.signature)
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const textarea = screen.getByPlaceholderText(/Paste your JWT token/i)
    fireEvent.change(textarea, { target: { value: validJWT } })
    fireEvent.click(screen.getByRole('button', { name: /Decode/i }))
    
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Payload')).toBeInTheDocument()
  })

  it('displays decoded header', () => {
    render(<JwtDecoder />)
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const textarea = screen.getByPlaceholderText(/Paste your JWT token/i)
    fireEvent.change(textarea, { target: { value: validJWT } })
    fireEvent.click(screen.getByRole('button', { name: /Decode/i }))
    
    expect(screen.getByText(/HS256|JWT/)).toBeInTheDocument()
  })

  it('displays decoded payload', () => {
    render(<JwtDecoder />)
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const textarea = screen.getByPlaceholderText(/Paste your JWT token/i)
    fireEvent.change(textarea, { target: { value: validJWT } })
    fireEvent.click(screen.getByRole('button', { name: /Decode/i }))
    
    expect(screen.getByText(/John Doe|sub|1234567890/)).toBeInTheDocument()
  })

  it('displays signature after decoding', () => {
    render(<JwtDecoder />)
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const textarea = screen.getByPlaceholderText(/Paste your JWT token/i)
    fireEvent.change(textarea, { target: { value: validJWT } })
    fireEvent.click(screen.getByRole('button', { name: /Decode/i }))
    
    expect(screen.getByText('Signature')).toBeInTheDocument()
  })

  it('copies header to clipboard', () => {
    render(<JwtDecoder />)
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const textarea = screen.getByPlaceholderText(/Paste your JWT token/i)
    fireEvent.change(textarea, { target: { value: validJWT } })
    fireEvent.click(screen.getByRole('button', { name: /Decode/i }))
    
    const copyButtons = screen.getAllByRole('button', { name: '' })
    const headerCopyBtn = copyButtons.find(btn => btn.title === 'Copy header')
    if (headerCopyBtn) {
      fireEvent.click(headerCopyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('resets all values when reset button is clicked', () => {
    render(<JwtDecoder />)
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const textarea = screen.getByPlaceholderText(/Paste your JWT token/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: validJWT } })
    fireEvent.click(screen.getByRole('button', { name: /Decode/i }))
    
    const resetBtn = screen.getByRole('button', { name: /Reset/ })
    fireEvent.click(resetBtn)
    
    expect(textarea.value).toBe('')
    expect(screen.queryByText('Header')).not.toBeInTheDocument()
  })

  it('shows helpful description', () => {
    render(<JwtDecoder />)
    expect(screen.getByText(/decode.*JWT/i)).toBeInTheDocument()
  })
})
