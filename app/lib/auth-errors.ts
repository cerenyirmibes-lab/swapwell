export type AuthError = {
  message: string
  code?: string
}

export const getAuthErrorMessage = (error: AuthError) => {
  const message = (error.message || '').toLowerCase()
  const code = (error.code || '').toLowerCase()

  if (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('load failed')
  ) {
    return 'Sunucuya ulaşılamadı. İnternet bağlantını, VPN’i ve reklam engelleyiciyi kontrol edip tekrar dene.'
  }

  if (message.includes('invalid login credentials')) {
    return 'Email veya şifre hatalı.'
  }

  if (message.includes('email not confirmed') || code === 'email_not_confirmed') {
    return 'Email adresin henüz onaylanmadı. Gelen kutundaki doğrulama bağlantısına tıkla veya tekrar gönder.'
  }

  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    code === 'over_email_send_rate_limit'
  ) {
    return 'Email gönderim limiti doldu. Supabase’de özel SMTP kurulu değilse saatte sadece birkaç mail gönderilebilir. Biraz bekleyip tekrar dene.'
  }

  if (
    message.includes('signups not allowed') ||
    message.includes('signup is disabled')
  ) {
    return 'Yeni kayıtlar Supabase’de kapalı. Authentication → Sign In / Providers bölümünden email kaydını aç.'
  }

  if (message.includes('user already registered')) {
    return 'Bu email ile zaten bir hesap var. Giriş yapmayı dene.'
  }

  if (message.includes('password should be at least')) {
    return 'Şifren en az 6 karakter olmalı.'
  }

  if (message.includes('email address') && message.includes('invalid')) {
    return 'Geçerli bir email adresi gir.'
  }

  if (
    (message.includes('invalid') && message.includes('token')) ||
    message.includes('otp_expired') ||
    message.includes('link is invalid') ||
    message.includes('expired')
  ) {
    return 'Bağlantı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyip tekrar dene.'
  }

  if (message.includes('same password')) {
    return 'Yeni şifren mevcut şifrenle aynı olamaz.'
  }

  return error.message
}
