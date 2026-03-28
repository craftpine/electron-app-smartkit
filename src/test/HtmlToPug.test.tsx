import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import HtmlToPug from '../renderer/src/components/tools/HtmlToPug'

describe('HtmlToPug', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders converter title', () => {
    render(<HtmlToPug />)
    expect(screen.getByText('HTML to Pug Converter')).toBeInTheDocument()
  })

  it('converts basic html', () => {
    render(<HtmlToPug />)
    const input = screen.getByPlaceholderText(/Paste your HTML here/i)
    fireEvent.change(input, { target: { value: '<div id="app">Hello</div>' } })
    fireEvent.click(screen.getByRole('button', { name: /convert/i }))

    const output = screen.getByPlaceholderText(/Pug output will appear here/i)
    expect((output as HTMLTextAreaElement).value.length).toBeGreaterThan(0)
  })

  it('reset clears form', () => {
    render(<HtmlToPug />)
    const input = screen.getByPlaceholderText(/Paste your HTML here/i)
    fireEvent.change(input, { target: { value: '<p>abc</p>' } })
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect((input as HTMLTextAreaElement).value).toBe('')
  })
})
