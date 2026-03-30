import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import SvgToJsx from '../renderer/src/components/tools/SvgToJsx'

describe('SvgToJsx', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders converter title', () => {
    render(<SvgToJsx />)
    expect(screen.getByText('SVG to JSX Converter')).toBeInTheDocument()
  })

  it('converts onclick to onClick after clicking convert', () => {
    render(<SvgToJsx />)
    const input = screen.getByPlaceholderText(/Paste your SVG here/i)
    fireEvent.change(input, { target: { value: '<svg><rect onclick="x()" /></svg>' } })
    fireEvent.click(screen.getByRole('button', { name: /convert/i }))

    const output = screen.getByPlaceholderText(/JSX output will appear here/i)
    expect((output as HTMLTextAreaElement).value).toContain('onClick=')
  })

  it('reset clears both input and output', () => {
    render(<SvgToJsx />)
    const input = screen.getByPlaceholderText(/Paste your SVG here/i)
    const output = screen.getByPlaceholderText(/JSX output will appear here/i)
    fireEvent.change(input, { target: { value: '<svg><circle /></svg>' } })
    fireEvent.click(screen.getByRole('button', { name: /convert/i }))

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect((input as HTMLTextAreaElement).value).toBe('')
    expect((output as HTMLTextAreaElement).value).toBe('')
  })
})
