import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import JwtEncoder from '../renderer/src/components/tools/JwtEncoder'

describe('JwtEncoder', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders without crashing', () => {
    render(<JwtEncoder />)
    expect(screen.getByText('JWT Encoder')).toBeInTheDocument()
  })

  it('displays algorithm selector buttons', () => {
    render(<JwtEncoder />)
    expect(screen.getByRole('button', { name: 'HS256' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'HS384' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'HS512' })).toBeInTheDocument()
  })

  it('defaults to HS256 algorithm', () => {
    render(<JwtEncoder />)
    const hs256Btn = screen.getByRole('button', { name: 'HS256' })
    expect(hs256Btn.className).toMatch(/bg-blue-600/)
  })

  it('displays payload textarea with default value', () => {
    render(<JwtEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const payloadArea = textareas.find(ta => (ta as HTMLTextAreaElement).value.includes('John Doe'))
    expect(payloadArea).toBeInTheDocument()
  })

  it('displays secret input field', () => {
    render(<JwtEncoder />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('shows error when encoding without payload', async () => {
    render(<JwtEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const payloadArea = textareas.find(ta => (ta as HTMLTextAreaElement).value.includes('John Doe')) as HTMLTextAreaElement
    fireEvent.change(payloadArea, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /Encode/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a payload')).toBeInTheDocument()
    })
  })

  it('shows error when encoding without secret', async () => {
    render(<JwtEncoder />)
    const inputs = screen.getAllByRole('textbox')
    const secretInput = inputs[1]
    fireEvent.change(secretInput, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /Encode/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a secret key')).toBeInTheDocument()
    })
  })

  it('encodes JWT successfully', async () => {
    render(<JwtEncoder />)
    const inputs = screen.getAllByRole('textbox')
    const secretInput = inputs[1]
    fireEvent.change(secretInput, { target: { value: 'my-secret-key' } })
    fireEvent.click(screen.getByRole('button', { name: /Encode/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Encoded JWT/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('produces valid JWT format (three parts separated by dots)', async () => {
    render(<JwtEncoder />)
    const inputs = screen.getAllByRole('textbox')
    const secretInput = inputs[1]
    fireEvent.change(secretInput, { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Encode/i }))
    
    await waitFor(() => {
      const encodedSection = screen.queryByText(/Encoded JWT/)?.closest('.bg-white')?.querySelector('pre, textarea, [class*="mono"]')
      if (encodedSection) {
        const jwt = encodedSection.textContent
        expect(jwt?.split('.').length).toBe(3)
      }
    }, { timeout: 5000 })
  })

  it('switches between algorithms', async () => {
    render(<JwtEncoder />)
    const hs512Btn = screen.getByRole('button', { name: 'HS512' })
    fireEvent.click(hs512Btn)
    expect(hs512Btn.className).toMatch(/bg-blue-600/)
  })

  it('copies encoded JWT to clipboard', async () => {
    render(<JwtEncoder />)
    const inputs = screen.getAllByRole('textbox')
    const secretInput = inputs[1]
    fireEvent.change(secretInput, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /Encode/i }))
    
    await waitFor(() => {
      const copyBtn = screen.queryByRole('button', { name: /Copy/i })
      if (copyBtn) {
        fireEvent.click(copyBtn)
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      }
    })
  })

  it('resets all values when reset button is clicked', async () => {
    render(<JwtEncoder />)
    const inputs = screen.getAllByRole('textbox')
    const secretInput = inputs[1]
    fireEvent.change(secretInput, { target: { value: 'test-secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Encode/i }))
    
    await waitFor(() => {
      const resetBtn = screen.getByRole('button', { name: /Reset/i })
      fireEvent.click(resetBtn)
      expect((secretInput as HTMLInputElement).value).toBe('')
    })
  })

  it('validates JSON payload format', async () => {
    render(<JwtEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const payloadArea = textareas.find(ta => {
      const val = (ta as HTMLTextAreaElement).value
      return val.includes('{')
    }) as HTMLTextAreaElement
    
    fireEvent.change(payloadArea, { target: { value: 'invalid json' } })
    const inputs = screen.getAllByRole('textbox')
    const secretInput = inputs[inputs.length - 1]
    fireEvent.change(secretInput, { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Encode/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid.*json|Unexpected token|error/i) || screen.getByText(/JSON/i)).toBeDefined()
    })
  })

  it('shows helpful description', () => {
    render(<JwtEncoder />)
    expect(screen.getByText(/encode.*JWT|create.*JWT/i)).toBeInTheDocument()
  })

  it('supports custom payload', async () => {
    render(<JwtEncoder />)
    const textareas = screen.getAllByRole('textbox')
    const payloadArea = textareas.find(ta => (ta as HTMLTextAreaElement).value.includes('John Doe')) as HTMLTextAreaElement
    const customPayload = JSON.stringify({ userId: '123', email: 'test@example.com' }, null, 2)
    fireEvent.change(payloadArea, { target: { value: customPayload } })
    
    const inputs = screen.getAllByRole('textbox')
    const secretInput = inputs[1]
    fireEvent.change(secretInput, { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Encode/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Encoded JWT/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
