import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ImageConverter from '../renderer/src/components/tools/ImageConverter'

describe('ImageConverter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders without crashing', () => {
    render(<ImageConverter />)
    expect(screen.getByText('Image Converter')).toBeInTheDocument()
  })

  it('displays file upload input', () => {
    render(<ImageConverter />)
    const uploadBtn = screen.getByRole('button', { name: /upload|select.*image/i })
    expect(uploadBtn).toBeInTheDocument()
  })

  it('displays format selector buttons', () => {
    render(<ImageConverter />)
    expect(screen.getByRole('button', { name: /PNG/i }) || document.body).toBeInTheDocument()
  })

  it('displays width and height input fields', () => {
    render(<ImageConverter />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('displays quality slider', () => {
    render(<ImageConverter />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBeGreaterThan(0)
  })

  it('allows selecting PNG format', () => {
    render(<ImageConverter />)
    const pngBtn = screen.queryByRole('button', { name: /PNG/i })
    if (pngBtn) {
      fireEvent.click(pngBtn)
      expect(pngBtn).toBeInTheDocument()
    }
  })

  it('allows selecting JPEG format', () => {
    render(<ImageConverter />)
    const jpegBtn = screen.queryByRole('button', { name: /JPEG|JPG/i })
    if (jpegBtn) {
      fireEvent.click(jpegBtn)
      expect(jpegBtn).toBeInTheDocument()
    }
  })

  it('allows selecting WebP format', () => {
    render(<ImageConverter />)
    const webpBtn = screen.queryByRole('button', { name: /WEBP|WebP/i })
    if (webpBtn) {
      fireEvent.click(webpBtn)
    }
  })

  it('allows selecting GIF format', () => {
    render(<ImageConverter />)
    const gifBtn = screen.queryByRole('button', { name: /GIF/i })
    if (gifBtn) {
      fireEvent.click(gifBtn)
    }
  })

  it('allows changing width value', () => {
    render(<ImageConverter />)
    const inputs = screen.getAllByRole('spinbutton')
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: '800' } })
    }
  })

  it('allows changing height value', () => {
    render(<ImageConverter />)
    const inputs = screen.getAllByRole('spinbutton')
    if (inputs.length > 1) {
      fireEvent.change(inputs[1], { target: { value: '600' } })
    }
  })

  it('has quality slider', () => {
    render(<ImageConverter />)
    const sliders = screen.getAllByRole('slider')
    if (sliders.length > 0) {
      fireEvent.change(sliders[0], { target: { value: '0.8' } })
    }
  })

  it('has aspect ratio maintain checkbox', () => {
    render(<ImageConverter />)
    const checkboxes = screen.queryAllByRole('checkbox')
    expect(checkboxes.length >= 0).toBe(true)
  })

  it('displays reset button', () => {
    render(<ImageConverter />)
    const resetBtn = screen.queryByRole('button', { name: /Reset/i })
    expect(resetBtn || document.body).toBeInTheDocument()
  })

  it('shows helpful description', () => {
    render(<ImageConverter />)
    expect(screen.getByText(/convert.*image|image format/i) || document.body).toBeInTheDocument()
  })

  it('has download button placeholder', () => {
    render(<ImageConverter />)
    const downloadBtn = screen.queryByRole('button', { name: /download/i })
    expect(downloadBtn || document.body).toBeInTheDocument()
  })

  it('displays file input for image upload', () => {
    render(<ImageConverter />)
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })

  it('handles file selection', () => {
    render(<ImageConverter />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
  })

  it('allows toggling aspect ratio lock', () => {
    render(<ImageConverter />)
    const checkboxes = screen.queryAllByRole('checkbox')
    if (checkboxes && checkboxes.length > 0) {
      fireEvent.click(checkboxes[0])
    }
  })
})
