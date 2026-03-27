import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import GzipEncoder from '../renderer/src/components/tools/GzipEncoder'

describe('GzipEncoder', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders title and mode controls', () => {
    render(<GzipEncoder />)
    expect(screen.getByText('Gzip Encoder/Decoder')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decompress/i })).toBeInTheDocument()
  })

  it('switches mode', () => {
    render(<GzipEncoder />)
    const toggle = screen.getByRole('button', { name: /decompress/i })
    fireEvent.click(toggle)
    expect(toggle.className).toMatch(/bg-purple-600/)
  })

  it('resets input text', () => {
    render(<GzipEncoder />)
    const input = screen.getByPlaceholderText(/Enter text to compress/i)
    fireEvent.change(input, { target: { value: 'hello world' } })
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect((input as HTMLTextAreaElement).value).toBe('')
  })
})
