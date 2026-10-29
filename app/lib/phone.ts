export const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (digits.length === 12 && digits.startsWith('90')) return `+${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `+90${digits.slice(1)}`
  if (digits.length === 10 && digits.startsWith('5')) return `+90${digits}`

  return null
}

export const formatPhone = (phone?: string | null) => {
  if (!phone) return ''
  return phone
    .replace(/^\+90/, '0')
    .replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
}
