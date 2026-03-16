import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import EscapeUnescape from '../renderer/src/components/tools/EscapeUnescape'

describe('EscapeUnescape', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  const getInput = () => screen.getAllByRole('textbox')[0]
  const getOutput = () => screen.getAllByRole('textbox')[1]
  const clickEscape = () => fireEvent.click(screen.getByRole('button', { name: /^escape$/i }))
  const clickUnescape = () => fireEvent.click(screen.getByRole('button', { name: /^unescape$/i }))

  // ---------- render ----------
  it('renders without crashing', () => {
    render(<EscapeUnescape />)
    expect(screen.getByText('Escape / Unescape')).toBeInTheDocument()
  })

  it('starts in escape mode with JavaScript format selected', () => {
    render(<EscapeUnescape />)
    expect(screen.getByRole('button', { name: /^escape$/i })).toBeInTheDocument()
  })

  // ---------- JavaScript ----------
  it('escapes JS special characters', () => {
    render(<EscapeUnescape />)
    fireEvent.change(getInput(), { target: { value: 'say "hello"\nnew line\ttab' } })
    clickEscape()
    expect(getOutput()).toHaveValue('say \\"hello\\"\\nnew line\\ttab')
  })

  it('unescapes JS sequences', () => {
    render(<EscapeUnescape />)
    fireEvent.click(screen.getByText('Switch to Unescape'))
    fireEvent.change(getInput(), { target: { value: 'say \\"hello\\"\\nnew line\\ttab' } })
    clickUnescape()
    expect(getOutput()).toHaveValue('say "hello"\nnew line\ttab')
  })

  // ---------- JSON ----------
  it('escapes JSON special characters', () => {
    render(<EscapeUnescape />)
    fireEvent.click(screen.getByRole('button', { name: 'JSON' }))
    fireEvent.change(getInput(), { target: { value: 'line1\nline2' } })
    clickEscape()
    expect(getOutput()).toHaveValue('line1\\nline2')
  })

  it('unescapes JSON sequences', () => {
    render(<EscapeUnescape />)
    fireEvent.click(screen.getByRole('button', { name: 'JSON' }))
    fireEvent.click(screen.getByText('Switch to Unescape'))
    fireEvent.change(getInput(), { target: { value: 'line1\\nline2' } })
    clickUnescape()
    expect(getOutput()).toHaveValue('line1\nline2')
  })

  // ---------- HTML ----------
  it('escapes HTML entities', () => {
    render(<EscapeUnescape />)
    fireEvent.click(screen.getByRole('button', { name: 'HTML Entities' }))
    fireEvent.change(getInput(), { target: { value: '<b>Hello & "World"</b>' } })
    clickEscape()
    expect(getOutput()).toHaveValue('&lt;b&gt;Hello &amp; &quot;World&quot;&lt;/b&gt;')
  })

  it('unescapes HTML entities', () => {
    render(<EscapeUnescape />)
    fireEvent.click(screen.getByRole('button', { name: 'HTML Entities' }))
    fireEvent.click(screen.getByText('Switch to Unescape'))
    fireEvent.change(getInput(), { target: { value: '&lt;b&gt;Hello&lt;/b&gt;' } })
    clickUnescape()
    expect(getOutput()).toHaveValue('<b>Hello</b>')
  })

  // ---------- RegExp ----------
  it('escapes regex special characters', () => {
    render(<EscapeUnescape />)
    fireEvent.click(screen.getByRole('button', { name: 'RegExp' }))
    fireEvent.change(getInput(), { target: { value: 'foo.bar (test)' } })
    clickEscape()
    expect(getOutput()).toHaveValue('foo\\.bar \\(test\\)')
  })

  // ---------- Unicode ----------
  it('escapes non-ASCII characters to unicode sequences', () => {
    render(<EscapeUnescape />)
    fireEvent.click(screen.getByRole('button', { name: 'Unicode' }))
    fireEvent.change(getInput(), { target: { value: '©' } })
    clickEscape()
    expect(getOutput()).toHaveValue('\\u00A9')
  })

  it('unescapes unicode sequences', () => {
    render(<EscapeUnescape />)
    fireEvent.click(screen.getByRole('button', { name: 'Unicode' }))
    fireEvent.click(screen.getByText('Switch to Unescape'))
    fireEvent.change(getInput(), { target: { value: '\\u00A9' } })
    clickUnescape()
    expect(getOutput()).toHaveValue('©')
  })

  // ---------- switch / reset ----------
  it('swaps input and output when switching modes', () => {
    render(<EscapeUnescape />)
    fireEvent.change(getInput(), { target: { value: 'hello\nworld' } })
    clickEscape()
    const encoded = (getOutput() as any).value
    fireEvent.click(screen.getByText('Switch to Unescape'))
    expect(getInput()).toHaveValue(encoded)
  })

  it('resets all fields on Reset', () => {
    render(<EscapeUnescape />)
    fireEvent.change(getInput(), { target: { value: 'something' } })
    clickEscape()
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(getInput()).toHaveValue('')
    expect(getOutput()).toHaveValue('')
  })

  it('copies output to clipboard', () => {
    render(<EscapeUnescape />)
    fireEvent.change(getInput(), { target: { value: 'hi\nthere' } })
    clickEscape()
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hi\\nthere')
  })

  it('shows empty output for blank input', () => {
    render(<EscapeUnescape />)
    clickEscape()
    expect(getOutput()).toHaveValue('')
  })
})
