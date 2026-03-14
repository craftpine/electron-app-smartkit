import UrlEncoder from '../renderer/src/components/tools/UrlEncoder'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('UrlEncoder', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders without crashing', () => {
    render(<UrlEncoder />)
    expect(screen.getByText('URL Encoder/Decoder')).toBeInTheDocument()
  })

  it('starts in encode mode', () => {
    render(<UrlEncoder />)
    expect(screen.getByRole('button', { name: /^encode$/i })).toBeInTheDocument()
    expect(screen.getByText('Switch to Decode')).toBeInTheDocument()
  })

  it('encodes a URL with special characters', () => {
    render(<UrlEncoder />)
    const textarea = screen.getAllByRole('textbox')[0]
    fireEvent.change(textarea, { target: { value: 'hello world & foo=bar' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue('hello%20world%20%26%20foo%3Dbar')
  })

  it('shows an empty output when input is blank', () => {
    render(<UrlEncoder />)
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue('')
  })

  it('switches to decode mode and decodes a percent-encoded string', () => {
    render(<UrlEncoder />)
    fireEvent.click(screen.getByText('Switch to Decode'))
    expect(screen.getByRole('button', { name: /^decode$/i })).toBeInTheDocument()

    const textarea = screen.getAllByRole('textbox')[0]
    fireEvent.change(textarea, { target: { value: 'hello%20world' } })
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }))
    const output = screen.getAllByRole('textbox')[1]
    expect(output).toHaveValue('hello world')
  })

  it('shows an error for an invalid percent-encoded string', () => {
    render(<UrlEncoder />)
    fireEvent.click(screen.getByText('Switch to Decode'))

    const textarea = screen.getAllByRole('textbox')[0]
    fireEvent.change(textarea, { target: { value: '%zz' } })
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }))
    expect(screen.getByText(/invalid url-encoded string/i)).toBeInTheDocument()
  })

  it('swaps input and output when switching modes', () => {
    render(<UrlEncoder />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: 'hello world' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))

    fireEvent.click(screen.getByText('Switch to Decode'))
    const newInput = screen.getAllByRole('textbox')[0]
    expect(newInput).toHaveValue('hello%20world')
  })

  it('resets all fields when Reset is clicked', () => {
    render(<UrlEncoder />)
    const input = screen.getAllByRole('textbox')[0]
    fireEvent.change(input, { target: { value: 'hello world' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))

    const [inputAfter, outputAfter] = screen.getAllByRole('textbox')
    expect(inputAfter).toHaveValue('')
    expect(outputAfter).toHaveValue('')
  })

  it('copies output to clipboard when Copy is clicked', async () => {
    render(<UrlEncoder />)
    const textarea = screen.getAllByRole('textbox')[0]
    fireEvent.change(textarea, { target: { value: 'hello world' } })
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }))

    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello%20world')
  })
})
