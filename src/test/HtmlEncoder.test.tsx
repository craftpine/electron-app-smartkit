import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import HtmlEncoder from '../renderer/src/components/tools/HtmlEncoder'

describe('HtmlEncoder', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders without crashing', () => {
    render(<HtmlEncoder />)
    expect(screen.getByText('HTML Encoder/Decoder')).toBeInTheDocument()
  })

  it('starts in encode mode', () => {
    render(<HtmlEncoder />)
    expect(screen.getByRole('button', { name: /^encode$/i })).toBeInTheDocument()
    expect(screen.getByText('Switch to Decode')).toBeInTheDocument()
  })

  it('encodes HTML special characters to entities', () => {
    render(<HtmlEncoder />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '<div class="test">Hello & goodbye</div>' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output.value).toContain('&lt;')
    expect(output.value).toContain('&gt;')
    expect(output.value).toContain('&amp;')
  })

  it('produces empty output for blank input', () => {
    render(<HtmlEncoder />)
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue('')
  })

  it('decodes HTML entities back to plain text', () => {
    render(<HtmlEncoder />)
    fireEvent.click(screen.getByText('Switch to Decode'))

    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '&lt;p&gt;Hello &amp; World&lt;/p&gt;' } })
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue('<p>Hello & World</p>')
  })

  it('swaps input and output when switching modes', () => {
    render(<HtmlEncoder />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '<b>bold</b>' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))

    const encodedValue = screen.getAllByRole('textbox')[1].value
    fireEvent.click(screen.getByText('Switch to Decode'))
    const newInput = screen.getAllByRole('textbox')[0]
    expect(newInput).toHaveValue(encodedValue)
  })

  it('resets all fields when Reset is clicked', () => {
    render(<HtmlEncoder />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '<b>bold</b>' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))

    const [inputAfter, outputAfter] = screen.getAllByRole('textbox')
    expect(inputAfter).toHaveValue('')
    expect(outputAfter).toHaveValue('')
  })

  it('copies output to clipboard when Copy is clicked', () => {
    render(<HtmlEncoder />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '<b>bold</b>' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))

    const encodedValue = (screen.getAllByRole('textbox')[1] as any)?.value
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(encodedValue)
  })

  it('round-trips encode then decode back to original', () => {
    const original = '<div id="main">Hello & World!</div>'
    render(<HtmlEncoder />)

    // Encode
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: original } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))

    // Switch to decode (swaps encoded to input)
    fireEvent.click(screen.getByText('Switch to Decode'))
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }))

    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue(original)
  })
})
