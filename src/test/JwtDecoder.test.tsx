import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import JwtDecoder from '../renderer/src/components/tools/JwtDecoder'

describe('JwtDecoder', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders title and token input', () => {
    render(<JwtDecoder />)
    expect(screen.getByText('JWT Decoder')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Paste your JWT token here/i)).toBeInTheDocument()
  })

  it('shows validation error for malformed jwt', () => {
    render(<JwtDecoder />)
    const input = screen.getByPlaceholderText(/Paste your JWT token here/i)
    fireEvent.change(input, { target: { value: 'abc.def' } })
    fireEvent.click(screen.getByRole('button', { name: /decode/i }))

    expect(screen.getByText(/Invalid JWT format/i)).toBeInTheDocument()
  })

  it('decodes a valid jwt structure', () => {
    render(<JwtDecoder />)
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.' +
      'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

    fireEvent.change(screen.getByPlaceholderText(/Paste your JWT token here/i), {
      target: { value: token },
    })
    fireEvent.click(screen.getByRole('button', { name: /decode/i }))

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Payload')).toBeInTheDocument()
    expect(screen.getByText('Signature')).toBeInTheDocument()
  })
})
