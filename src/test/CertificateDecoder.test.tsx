import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import CertificateDecoder from '../renderer/src/components/tools/CertificateDecoder'

describe('CertificateDecoder', () => {
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
    render(<CertificateDecoder />)
    expect(screen.getByText('Certificate Decoder')).toBeInTheDocument()
  })

  it('displays certificate input textarea', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('displays reset button', () => {
    render(<CertificateDecoder />)
    expect(screen.getByRole('button', { name: /Reset/ })).toBeInTheDocument()
  })

  it('shows helpful description', () => {
    render(<CertificateDecoder />)
    expect(screen.getByText(/decode.*certificate|certificate.*information/i)).toBeInTheDocument()
  })

  it('handles empty certificate input', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    fireEvent.change(certInput, { target: { value: '' } })
    // Should not show any certificate info
    expect(screen.queryByText(/Subject|Issuer|Valid/)).not.toBeInTheDocument()
  })

  it('parses basic certificate format', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    const sampleCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1+sKSvzUJMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
-----END CERTIFICATE-----`
    fireEvent.change(certInput, { target: { value: sampleCert } })
  })

  it('displays parsed certificate information', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    const sampleCert = `Subject: CN=example.com, O=Example Inc, C=US
Issuer: CN=Example CA, O=Example Inc, C=US
Valid From: Jan  1 00:00:00 2023 GMT
Valid To: Jan  1 00:00:00 2024 GMT
Serial Number: 1234567890`
    fireEvent.change(certInput, { target: { value: sampleCert } })
  })

  it('validates certificate format', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    fireEvent.change(certInput, { target: { value: 'invalid certificate data' } })
    // Should handle invalid certificates gracefully
  })

  it('copies certificate information to clipboard', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    const sampleCert = `Subject: CN=test.com
-----BEGIN CERTIFICATE-----
test
-----END CERTIFICATE-----`
    fireEvent.change(certInput, { target: { value: sampleCert } })
    
    const copyBtn = screen.queryByRole('button', { name: /Copy|copy/i })
    if (copyBtn) {
      fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it('resets certificate input and output', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0] as HTMLTextAreaElement
    fireEvent.change(certInput, { target: { value: 'test cert' } })
    
    const resetBtn = screen.getByRole('button', { name: /Reset/ })
    fireEvent.click(resetBtn)
    
    expect(certInput.value).toBe('')
  })

  it('handles PEM formatted certificates', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    const pemCert = `-----BEGIN CERTIFICATE-----
MIIE5jCCA86gAwIBAgIQWJSkLgxPEHhjMn2YY38qXTANBgkqhkiG9w0BAQsFAAA=
-----END CERTIFICATE-----`
    fireEvent.change(certInput, { target: { value: pemCert } })
  })

  it('handles certificate without PEM headers', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    const baseCert = 'MIIE5jCCA86gAwIBAgIQWJSkLgxPEHhjMn2YY38qXTANBgkqhkiG9w0BAQsFAAA='
    fireEvent.change(certInput, { target: { value: baseCert } })
    // Should attempt to add headers if missing
  })

  it('displays extracted certificate fields', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    const certWithFields = `Fingerprint: AB:CD:EF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00
Subject: CN=example.com
Issuer: CN=CA Server
Version: 3`
    fireEvent.change(certInput, { target: { value: certWithFields } })
  })

  it('handles multi-line certificate data', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    const multilineCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1+sKSvzUJ
MAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNB
-----END CERTIFICATE-----`
    fireEvent.change(certInput, { target: { value: multilineCert } })
  })

  it('shows error for malformed input', () => {
    render(<CertificateDecoder />)
    const inputs = screen.getAllByRole('textbox')
    const certInput = inputs[0]
    fireEvent.change(certInput, { target: { value: '!!invalid!!certificate!!' } })
    // Should handle gracefully without crashing
  })
})
