// Telefon numarası ile giriş yapabilmek için Supabase'in email alanını
// arka planda kullanıyoruz. Bu adrese gerçek mail gönderilmez.
// example.com alan adı IANA tarafından dokümantasyon için ayrılmıştır,
// hiçbir zaman gerçek bir posta kutusuna teslim edilmez.
export const PHONE_EMAIL_DOMAIN = 'phone.example.com'

export const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (digits.length === 12 && digits.startsWith('90')) return `+${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `+90${digits.slice(1)}`
  if (digits.length === 10 && digits.startsWith('5')) return `+90${digits}`

  return null
}

export const phoneToEmail = (phone: string) =>
  `${phone.replace(/\D/g, '')}@${PHONE_EMAIL_DOMAIN}`

export const emailToPhone = (email?: string | null) => {
  if (!email || !email.endsWith(`@${PHONE_EMAIL_DOMAIN}`)) return null
  const digits = email.split('@')[0]
  return digits ? `+${digits}` : null
}

export const formatPhone = (phone?: string | null) => {
  if (!phone) return ''
  return phone
    .replace(/^\+90/, '0')
    .replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
}
