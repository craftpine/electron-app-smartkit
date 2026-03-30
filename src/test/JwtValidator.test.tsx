import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import JwtValidator from '../renderer/src/components/tools/JwtValidator'

describe('JwtValidator', () => {
  it('renders title and inputs', () => {
    render(<JwtValidator />)
    expect(screen.getByText('JWT Validator')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Paste your JWT token here/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter the secret key used to create the token/i)).toBeInTheDocument()
  })

  it('shows error when token is missing', async () => {
    render(<JwtValidator />)
    fireEvent.click(screen.getByRole('button', { name: /validate/i }))
    expect(await screen.findByText(/Please enter a JWT token/i)).toBeInTheDocument()
  })

  it('toggles secret visibility', () => {
    render(<JwtValidator />)
    const toggle = screen.getByRole('button', { name: /show/i })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument()
  })
})
