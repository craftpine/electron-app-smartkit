import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import TextDiff from '../renderer/src/components/tools/TextDiff'

describe('TextDiff', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders without crashing', () => {
    render(<TextDiff />)
    expect(screen.getByText('Text Diff')).toBeInTheDocument()
  })

  it('shows placeholder before comparing', () => {
    render(<TextDiff />)
    expect(screen.getByText(/paste text in both panels/i)).toBeInTheDocument()
  })

  it('shows diff stats after comparing', () => {
    render(<TextDiff />)
    const [originalTA, modifiedTA] = screen.getAllByRole('textbox')
    fireEvent.change(originalTA, { target: { value: 'hello\nworld' } })
    fireEvent.change(modifiedTA, { target: { value: 'hello\nearth' } })
    fireEvent.click(screen.getByRole('button', { name: /compare/i }))
    expect(screen.getByText(/\+1 added/i)).toBeInTheDocument()
    expect(screen.getByText(/-1 removed/i)).toBeInTheDocument()
    expect(screen.getByText(/1 unchanged/i)).toBeInTheDocument()
  })

  it('shows no removals when modified is a superset', () => {
    render(<TextDiff />)
    const [originalTA, modifiedTA] = screen.getAllByRole('textbox')
    fireEvent.change(originalTA, { target: { value: 'line1' } })
    fireEvent.change(modifiedTA, { target: { value: 'line1\nline2' } })
    fireEvent.click(screen.getByRole('button', { name: /compare/i }))
    expect(screen.getByText(/\+1 added/i)).toBeInTheDocument()
    expect(screen.getByText(/-0 removed/i)).toBeInTheDocument()
  })

  it('shows no additions when modified removes a line', () => {
    render(<TextDiff />)
    const [originalTA, modifiedTA] = screen.getAllByRole('textbox')
    fireEvent.change(originalTA, { target: { value: 'line1\nline2' } })
    fireEvent.change(modifiedTA, { target: { value: 'line1' } })
    fireEvent.click(screen.getByRole('button', { name: /compare/i }))
    expect(screen.getByText(/\+0 added/i)).toBeInTheDocument()
    expect(screen.getByText(/-1 removed/i)).toBeInTheDocument()
  })

  it('shows all unchanged when texts are identical', () => {
    render(<TextDiff />)
    const [originalTA, modifiedTA] = screen.getAllByRole('textbox')
    fireEvent.change(originalTA, { target: { value: 'same\ntext' } })
    fireEvent.change(modifiedTA, { target: { value: 'same\ntext' } })
    fireEvent.click(screen.getByRole('button', { name: /compare/i }))
    expect(screen.getByText(/\+0 added/i)).toBeInTheDocument()
    expect(screen.getByText(/-0 removed/i)).toBeInTheDocument()
    expect(screen.getByText(/2 unchanged/i)).toBeInTheDocument()
  })

  it('can switch to split view', () => {
    render(<TextDiff />)
    const [originalTA, modifiedTA] = screen.getAllByRole('textbox')
    fireEvent.change(originalTA, { target: { value: 'foo' } })
    fireEvent.change(modifiedTA, { target: { value: 'bar' } })
    fireEvent.click(screen.getByRole('button', { name: /compare/i }))
    fireEvent.click(screen.getByRole('button', { name: /split/i }))
    // Split view renders a table with column headers
    const headers = screen.getAllByRole('columnheader')
    const headerTexts = headers.map((h) => h.textContent?.trim())
    expect(headerTexts).toContain('Original')
    expect(headerTexts).toContain('Modified')
  })

  it('resets all state when Reset is clicked', () => {
    render(<TextDiff />)
    const [originalTA, modifiedTA] = screen.getAllByRole('textbox')
    fireEvent.change(originalTA, { target: { value: 'foo' } })
    fireEvent.change(modifiedTA, { target: { value: 'bar' } })
    fireEvent.click(screen.getByRole('button', { name: /compare/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    const [oAfter, mAfter] = screen.getAllByRole('textbox')
    expect(oAfter).toHaveValue('')
    expect(mAfter).toHaveValue('')
    expect(screen.getByText(/paste text in both panels/i)).toBeInTheDocument()
  })

  it('copies patch to clipboard when Copy patch is clicked', () => {
    render(<TextDiff />)
    const [originalTA, modifiedTA] = screen.getAllByRole('textbox')
    fireEvent.change(originalTA, { target: { value: 'hello' } })
    fireEvent.change(modifiedTA, { target: { value: 'world' } })
    fireEvent.click(screen.getByRole('button', { name: /compare/i }))
    fireEvent.click(screen.getByRole('button', { name: /copy patch/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('- hello\n+ world')
  })
})
