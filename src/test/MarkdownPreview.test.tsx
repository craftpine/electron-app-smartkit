import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import MarkdownPreview from '../renderer/src/components/tools/MarkdownPreview'

describe('MarkdownPreview', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with input and preview panels', () => {
    render(<MarkdownPreview />)

    expect(screen.getByRole('heading', { name: 'Markdown Preview', level: 3 })).toBeInTheDocument()
    expect(screen.getByText('Markdown Input')).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type markdown here...')).toBeInTheDocument()
  })

  it('renders default markdown content in preview', () => {
    render(<MarkdownPreview />)

    expect(screen.getByRole('heading', { name: 'Syntax Support' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Links' })).toHaveAttribute('href', 'https://example.com')
    expect(screen.getByText('Tables')).toBeInTheDocument()
    expect(screen.getByText('Supported')).toBeInTheDocument()
  })

  it('updates preview when markdown input changes', () => {
    render(<MarkdownPreview />)

    const textarea = screen.getByPlaceholderText('Type markdown here...')
    fireEvent.change(textarea, { target: { value: '# Hello\n\nThis is **bold** text.' } })

    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument()
    expect(screen.getByText('bold')).toBeInTheDocument()
  })

  it('clears markdown input and preview when Clear is clicked', () => {
    render(<MarkdownPreview />)

    const textarea = screen.getByPlaceholderText('Type markdown here...') as HTMLTextAreaElement
    expect(textarea.value).not.toBe('')

    fireEvent.click(screen.getByRole('button', { name: /clear/i }))

    expect(textarea).toHaveValue('')
    expect(screen.queryByRole('heading', { name: 'Syntax Support' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument()
  })

  it('copies markdown text and toggles copied feedback', async () => {
    vi.useFakeTimers()
    render(<MarkdownPreview />)

    fireEvent.click(screen.getByRole('button', { name: /^copy$/i }))

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument()
  })
})
