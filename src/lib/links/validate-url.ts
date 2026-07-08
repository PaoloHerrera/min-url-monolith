export type ValidationResult =
  | { ok: true; normalized: string }
  | { ok: false; reason: 'empty' | 'malformed' | 'scheme_not_allowed' | 'unsafe_target' }

function isPrivateIpv4(host: string): boolean {
  const parts = host.split('.')
  if (parts.length !== 4) return false
  const octets = parts.map((p) => Number(p))
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false

  const [a, b] = octets
  if (a === 0) return true
  if (a === 10) return true
  if (a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  return false
}

function isUnsafeHost(host: string): boolean {
  const normalized = host.replace(/^\[|\]$/g, '').toLowerCase()
  if (normalized === 'localhost') return true
  if (normalized === '::1') return true
  if (normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80')) {
    return true
  }
  return isPrivateIpv4(normalized)
}

export function validateUrl(input: string): ValidationResult {
  if (typeof input !== 'string' || input.trim() === '') {
    return { ok: false, reason: 'empty' }
  }

  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    return { ok: false, reason: 'malformed' }
  }

  const scheme = parsed.protocol.toLowerCase()
  if (scheme !== 'http:' && scheme !== 'https:') {
    return { ok: false, reason: 'scheme_not_allowed' }
  }

  if (isUnsafeHost(parsed.hostname.toLowerCase())) {
    return { ok: false, reason: 'unsafe_target' }
  }

  return { ok: true, normalized: parsed.href }
}
