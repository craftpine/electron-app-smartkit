import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import LoremIpsum from '../renderer/src/components/tools/LoremIpsum'

describe('LoremIpsum', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders without crashing', () => {
    render(<LoremIpsum />)
    expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument()
  })

  it('shows all three type buttons', () => {
    render(<LoremIpsum />)
    expect(screen.getByRole('button', { name: /paragraphs/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /words/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sentences/i })).toBeInTheDocument()
  })

  it('defaults to paragraphs mode with quantity 3', () => {
    render(<LoremIpsum />)
    expect(screen.getByRole('spinbutton')).toHaveValue(3)
    expect(screen.getByText(/number of paragraphs/i)).toBeInTheDocument()
    // Paragraphs button should be active (blue style)
    const paragraphsBtn = screen.getByRole('button', { name: /^paragraphs$/i })
    expect(paragraphsBtn.className).toMatch(/bg-blue-600/)
  })

  it('shows features section before generating', () => {
    render(<LoremIpsum />)
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText(/generate paragraphs, words, or sentences/i)).toBeInTheDocument()
  })

  it('hides features section and shows output after generating', () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.queryByText('Features')).not.toBeInTheDocument()
    expect(screen.getByText('Generated Text')).toBeInTheDocument()
  })

  it('generates paragraphs containing Lorem Ipsum text', () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toContain('Lorem ipsum dolor sit amet')
  })

  it('generates 3 paragraphs by default (separated by blank lines)', () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const textarea = screen.getByRole('textbox')
    const paragraphs = (textarea as HTMLTextAreaElement).value.split('\n\n')
    expect(paragraphs).toHaveLength(3)
  })

  it('updates quantity label when type changes', () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /^words$/i }))
    expect(screen.getByText(/number of words/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^sentences$/i }))
    expect(screen.getByText(/number of sentences/i)).toBeInTheDocument()
  })

  it('generates the requested number of words', () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /^words$/i }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const textarea = screen.getByRole('textbox')
    const words = (textarea as HTMLTextAreaElement).value.split(' ')
    expect(words).toHaveLength(10)
  })

  it('generates the requested number of sentences', () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /^sentences$/i }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const textarea = screen.getByRole('textbox')
    const sentences = (textarea as HTMLTextAreaElement).value.match(/[^.]+\./g) ?? []
    expect(sentences).toHaveLength(4)
  })

  it('clamps quantity to 1 when set to 0', () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /^words$/i }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    const textarea = screen.getByRole('textbox')
    const words = (textarea as HTMLTextAreaElement).value.trim().split(' ')
    expect(words).toHaveLength(1)
  })

  it('copies output to clipboard when Copy is clicked', () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Lorem ipsum')
    )
  })

  it('shows "Copied!" after clicking Copy and reverts after 2 seconds', async () => {
    render(<LoremIpsum />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument()
  })

  it('does not copy when output is empty', () => {
    render(<LoremIpsum />)
    // Output section is not rendered before generating, so Copy button doesn't exist yet
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument()
  })

  it('resets all fields when reset button is clicked', () => {
    render(<LoremIpsum />)
    // Change state
    fireEvent.click(screen.getByRole('button', { name: /^words$/i }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))

    // Output is visible — now reset
    fireEvent.click(screen.getByRole('button', { name: '' })) // reset icon button
    // After reset: back to defaults
    expect(screen.getByRole('spinbutton')).toHaveValue(3)
    const paragraphsBtn = screen.getByRole('button', { name: /^paragraphs$/i })
    expect(paragraphsBtn.className).toMatch(/bg-blue-600/)
    expect(screen.queryByText('Generated Text')).not.toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })
})
