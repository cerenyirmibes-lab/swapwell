export type AuthError = {
  message: string
  code?: string
}

export const getAuthErrorMessage = (error: AuthError, context?: 'email' | 'phone') => {
  const message = (error.message || '').toLowerCase()
  const code = (error.code || '').toLowerCase()

  if (code === 'otp_disabled' || message.includes('signups not allowed for otp')) {
    return context === 'phone'
      ? 'Telefonla kod gönderme Supabase’de kapalı. Bunun için Phone sağlayıcısı ve ücretli SMS servisi (Twilio) gerekir. Ücretsiz kullanmak için e-posta seçeneğini seç.'
      : 'Kod ile giriş Supabase’de kapalı. Authentication → Sign In / Providers → Email bölümünde email OTP’nin açık olduğundan emin ol.'
  }

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
    return 'Email adresin henüz onaylanmadı. Gelen kutundaki 6 haneli kodu gir veya yeni kod iste.'
  }

  if (
    message.includes('phone provider is disabled') ||
    message.includes('phone signups are disabled') ||
    message.includes('phone sign-in is disabled')
  ) {
    return 'Telefonla kod gönderme Supabase’de kapalı. Bu özellik ücretli bir SMS sağlayıcısı (Twilio) gerektirir. Şimdilik e-posta ile kod alabilirsin.'
  }

  if (message.includes('sms provider') || message.includes('twilio')) {
    return 'SMS sağlayıcısı ayarlanmamış. Telefonla kod için Supabase’de Phone sağlayıcısı ve Twilio bilgileri girilmelidir. Ücretsiz değildir; e-posta ile kod alabilirsin.'
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
    message.includes('invalid otp') ||
    message.includes('token has expired') ||
    message.includes('otp_expired') ||
    message.includes('link is invalid') ||
    message.includes('expired')
  ) {
    return 'Kod geçersiz veya süresi dolmuş. Yeni kod isteyip tekrar dene.'
  }

  if (message.includes('same password')) {
    return 'Yeni şifren mevcut şifrenle aynı olamaz.'
  }

  return error.message
}
