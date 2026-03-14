import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Base64Text from '../renderer/src/components/tools/Base64Text'

describe('Base64Text', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders without crashing', () => {
    render(<Base64Text />)
    expect(screen.getByText('Base64 Text Encoder/Decoder')).toBeInTheDocument()
  })

  it('starts in encode mode', () => {
    render(<Base64Text />)
    expect(screen.getByRole('button', { name: /^encode$/i })).toBeInTheDocument()
    expect(screen.getByText('Switch to Decode')).toBeInTheDocument()
  })

  it('encodes plain text to base64', () => {
    render(<Base64Text />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: 'Hello, World!' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue('SGVsbG8sIFdvcmxkIQ==')
  })

  it('produces empty output for blank input', () => {
    render(<Base64Text />)
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue('')
  })

  it('decodes a valid base64 string', () => {
    render(<Base64Text />)
    fireEvent.click(screen.getByText('Switch to Decode'))

    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: 'SGVsbG8sIFdvcmxkIQ==' } })
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue('Hello, World!')
  })

  it('shows an error for invalid base64 input', () => {
    render(<Base64Text />)
    fireEvent.click(screen.getByText('Switch to Decode'))

    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: '!!!not-valid-base64!!!' } })
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }))
    // Error is shown in the output textarea placeholder
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveAttribute('placeholder', expect.stringMatching(/invalid base64 string/i))
  })

  it('swaps input and output when switching modes', () => {
    render(<Base64Text />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))

    fireEvent.click(screen.getByText('Switch to Decode'))
    const newInput = screen.getAllByRole('textbox')[0]
    expect(newInput).toHaveValue('SGVsbG8=')
  })

  it('resets all fields when Reset is clicked', () => {
    render(<Base64Text />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))

    const [inputAfter, outputAfter] = screen.getAllByRole('textbox')
    expect(inputAfter).toHaveValue('')
    expect(outputAfter).toHaveValue('')
  })

  it('copies output to clipboard when Copy is clicked', () => {
    render(<Base64Text />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))

    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SGVsbG8=')
  })

  it('shows encoding stats when input and output are populated', () => {
    render(<Base64Text />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: 'Hello, World!' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    expect(screen.getByText(/input length/i)).toBeInTheDocument()
    expect(screen.getByText(/output length/i)).toBeInTheDocument()
  })
})
