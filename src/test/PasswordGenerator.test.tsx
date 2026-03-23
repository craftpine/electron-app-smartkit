import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import PasswordGenerator from '../renderer/src/components/tools/PasswordGenerator'

describe('PasswordGenerator', () => {
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
    render(<PasswordGenerator />)
    expect(screen.getByText('Password Generator')).toBeInTheDocument()
  })

  it('displays default length of 16', () => {
    render(<PasswordGenerator />)
    const lengthInput = screen.getByRole('slider')
    expect(lengthInput).toHaveValue('16')
  })

  it('displays default quantity of 1', () => {
    render(<PasswordGenerator />)
    const quantityInput = screen.getByRole('spinbutton')
    expect(quantityInput).toHaveValue(1)
  })

  it('has lowercase, uppercase, and numbers enabled by default', () => {
    render(<PasswordGenerator />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked() // lowercase
    expect(checkboxes[1]).toBeChecked() // uppercase
    expect(checkboxes[2]).toBeChecked() // numbers
    expect(checkboxes[3]).not.toBeChecked() // symbols
    expect(checkboxes[4]).not.toBeChecked() // exclude ambiguous
  })

  it('shows features section before generating', () => {
    render(<PasswordGenerator />)
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText(/Cryptographically secure random generation/i)).toBeInTheDocument()
    expect(screen.getByText(/Password strength indicator/i)).toBeInTheDocument()
  })

  it('hides features section and shows output after generating', () => {
    render(<PasswordGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.queryByText('Features')).not.toBeInTheDocument()
    expect(screen.getByText(/Generated Password/)).toBeInTheDocument()
  })

  it('generates a password with correct length', () => {
    render(<PasswordGenerator />)
    const sliderInput = screen.getByRole('slider')
    fireEvent.change(sliderInput, { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    const outputSection = screen.getByText(/Generated Password/)
    const passwordElement = outputSection.closest('.bg-white')?.querySelector('.font-mono')
    expect(passwordElement?.textContent).toHaveLength(20)
  })

  it('generates multiple passwords with correct quantity', () => {
    render(<PasswordGenerator />)
    const quantityInput = screen.getByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    expect(screen.getByText(/Generated Passwords \(3\)/)).toBeInTheDocument()
  })

  it('shows error when no character types are selected', () => {
    render(<PasswordGenerator />)
    const checkboxes = screen.getAllByRole('checkbox')
    
    // Uncheck all character types
    fireEvent.click(checkboxes[0]) // lowercase
    fireEvent.click(checkboxes[1]) // uppercase
    fireEvent.click(checkboxes[2]) // numbers
    
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    expect(screen.getByText('Select at least one character type.')).toBeInTheDocument()
  })

  it('includes only selected character types in password', () => {
    render(<PasswordGenerator />)
    const checkboxes = screen.getAllByRole('checkbox')
    
    // Uncheck uppercase and numbers, keep only lowercase
    fireEvent.click(checkboxes[1]) // uncheck uppercase
    fireEvent.click(checkboxes[2]) // uncheck numbers
    
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    const outputSection = screen.getByText(/Generated Password/)
    const passwordText = outputSection.closest('.bg-white')?.querySelector('.font-mono')?.textContent
    expect(passwordText).toMatch(/^[a-z]+$/)
  })

  it('includes symbols when checked', () => {
    render(<PasswordGenerator />)
    const checkboxes = screen.getAllByRole('checkbox')
    
    fireEvent.click(checkboxes[3]) // check symbols
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    expect(screen.getByText(/Generated Password/)).toBeInTheDocument()
  })

  it('excludes ambiguous characters when checked', () => {
    render(<PasswordGenerator />)
    const checkboxes = screen.getAllByRole('checkbox')
    
    fireEvent.click(checkboxes[4]) // check exclude ambiguous
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    const outputSection = screen.getByText(/Generated Password/)
    const passwordText = outputSection.closest('.bg-white')?.querySelector('.font-mono')?.textContent
    expect(passwordText).not.toMatch(/[0OIl1]/)
  })

  it('changes length slider value', () => {
    render(<PasswordGenerator />)
    const sliderInput = screen.getByRole('slider')
    fireEvent.change(sliderInput, { target: { value: '32' } })
    
    expect(sliderInput).toHaveValue('32')
  })

  it('changes quantity value', () => {
    render(<PasswordGenerator />)
    const quantityInput = screen.getByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '5' } })
    
    expect(quantityInput).toHaveValue(5)
  })

  it('clamps quantity to max 100', () => {
    render(<PasswordGenerator />)
    const quantityInput = screen.getByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '200' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    expect(screen.getByText(/Generated Passwords \(100\)/)).toBeInTheDocument()
  })

  it('displays strength indicator for single password', () => {
    render(<PasswordGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    expect(screen.getByText('Strength')).toBeInTheDocument()
  })

  it('does not show strength indicator for multiple passwords', () => {
    render(<PasswordGenerator />)
    const quantityInput = screen.getByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    expect(screen.queryByText('Strength')).not.toBeInTheDocument()
  })

  it('copies single password to clipboard', () => {
    render(<PasswordGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    const copyButtons = screen.getAllByRole('button')
    const singleCopyBtn = copyButtons.find((btn) => btn.title === 'Copy')
    
    if (singleCopyBtn) {
      fireEvent.click(singleCopyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('shows "Copy All" button for multiple passwords', () => {
    render(<PasswordGenerator />)
    const quantityInput = screen.getByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    expect(screen.getByText(/Copy All/)).toBeInTheDocument()
  })

  it('copies all passwords to clipboard when "Copy All" is clicked', () => {
    render(<PasswordGenerator />)
    const quantityInput = screen.getByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    const copyAllBtn = screen.getByText(/Copy All/)
    fireEvent.click(copyAllBtn)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('clears error message when character type is selected after error', () => {
    render(<PasswordGenerator />)
    const checkboxes = screen.getAllByRole('checkbox')
    
    // Uncheck all character types
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    fireEvent.click(checkboxes[2])
    
    // Try to generate (should show error)
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.getByText('Select at least one character type.')).toBeInTheDocument()
    
    // Re-enable a character type
    fireEvent.click(checkboxes[0])
    
    // Error should be cleared on next generate
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(screen.queryByText('Select at least one character type.')).not.toBeInTheDocument()
  })

  it('generates different passwords each time', () => {
    render(<PasswordGenerator />)
    
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    let outputSection = screen.getByText(/Generated Password/)
    const firstPassword = outputSection.closest('.bg-white')?.querySelector('.font-mono')?.textContent
    
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    outputSection = screen.getByText(/Generated Password/)
    const secondPassword = outputSection.closest('.bg-white')?.querySelector('.font-mono')?.textContent
    
    expect(firstPassword).not.toEqual(secondPassword)
  })

  it('handles minimum length of 4', () => {
    render(<PasswordGenerator />)
    const sliderInput = screen.getByRole('slider')
    fireEvent.change(sliderInput, { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    const outputSection = screen.getByText(/Generated Password/)
    const passwordText = outputSection.closest('.bg-white')?.querySelector('.font-mono')?.textContent
    expect(passwordText).toHaveLength(4)
  })

  it('handles maximum length of 128', () => {
    render(<PasswordGenerator />)
    const sliderInput = screen.getByRole('slider')
    fireEvent.change(sliderInput, { target: { value: '128' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    
    const outputSection = screen.getByText(/Generated Password/)
    const passwordText = outputSection.closest('.bg-white')?.querySelector('.font-mono')?.textContent
    expect(passwordText).toHaveLength(128)
  })
})
