import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import HtmlToJsx from '../renderer/src/components/tools/HtmlToJsx'

describe('HtmlToJsx', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders converter title', () => {
    render(<HtmlToJsx />)
    expect(screen.getByText('HTML to JSX Converter')).toBeInTheDocument()
  })

  it('converts class to className', () => {
    render(<HtmlToJsx />)
    const input = screen.getByPlaceholderText(/Paste your HTML here/i)
    fireEvent.change(input, { target: { value: '<div class="box">Hello</div>' } })
    fireEvent.click(screen.getByRole('button', { name: /convert/i }))

    const output = screen.getByPlaceholderText(/JSX output will appear here/i)
    expect((output as HTMLTextAreaElement).value).toContain('className')
  })

  it('reset clears input and output', () => {
    render(<HtmlToJsx />)
    const input = screen.getByPlaceholderText(/Paste your HTML here/i)
    const output = screen.getByPlaceholderText(/JSX output will appear here/i)
    fireEvent.change(input, { target: { value: '<span>Hi</span>' } })

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect((input as HTMLTextAreaElement).value).toBe('')
    expect((output as HTMLTextAreaElement).value).toBe('')
  })
})
