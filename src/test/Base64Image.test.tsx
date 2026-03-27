import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Base64Image from '../renderer/src/components/tools/Base64Image'

describe('Base64Image', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders title and input', () => {
    render(<Base64Image />)
    expect(screen.getByText('Base64 Image Encoder/Decoder')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Paste base64 string here/i)).toBeInTheDocument()
  })

  it('updates textarea value', () => {
    render(<Base64Image />)
    const input = screen.getByPlaceholderText(/Paste base64 string here/i)
    fireEvent.change(input, { target: { value: 'data:image/png;base64,abc' } })
    expect((input as HTMLTextAreaElement).value).toContain('data:image/png;base64,abc')
  })

  it('resets content', () => {
    render(<Base64Image />)
    const input = screen.getByPlaceholderText(/Paste base64 string here/i)
    fireEvent.change(input, { target: { value: 'abc' } })

    const resetBtn = screen.getByRole('button', { name: /reset/i })
    fireEvent.click(resetBtn)

    expect((input as HTMLTextAreaElement).value).toBe('')
  })
})
