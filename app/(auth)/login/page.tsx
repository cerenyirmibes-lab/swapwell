'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { normalizePhone, phoneToEmail } from '../../lib/phone'

type MessageKind = 'error' | 'success' | 'info'
type AuthMode = 'phone' | 'email'

type AuthError = {
  message: string
  code?: string
}

const getErrorMessage = (error: AuthError) => {
  const message = (error.message || '').toLowerCase()

  if (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('load failed')
  ) {
    return 'Sunucuya ulaşılamadı. İnternet bağlantını, VPN’i ve reklam engelleyiciyi kontrol edip tekrar dene.'
  }

  if (message.includes('invalid login credentials')) {
    return 'Telefon/email veya şifre hatalı.'
  }

  if (message.includes('email not confirmed')) {
    return 'Bu hesap henüz onaylanmamış. Email onayı açıkken oluşturulmuş olabilir. Supabase → Authentication → Users bölümünden kullanıcıyı silip tekrar kayıt ol ya da email onayını kapat.'
  }

  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Supabase email gönderim limiti doldu. Authentication → Providers → Email → “Confirm email” ayarını kapatınca bu limit kalkar.'
  }

  if (message.includes('password should be at least')) {
    return 'Şifren en az 6 karakter olmalı.'
  }

  if (message.includes('user already registered')) {
    return 'Bu numara veya email ile zaten bir hesap var. Giriş yapmayı dene.'
  }

  if (message.includes('email address') && message.includes('invalid')) {
    return 'Geçerli bir telefon numarası veya email adresi gir.'
  }

  return error.message
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('phone')
  const [isSignUp, setIsSignUp] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; kind: MessageKind } | null>(null)
  const [canResendEmail, setCanResendEmail] = useState(false)

  const cleanEmail = email.trim().toLowerCase()
  const normalizedPhone = normalizePhone(phone)

  const getPostAuthPath = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    return data ? '/profile' : '/setup'
  }

  const handleAuth = async () => {
    if (loading) return

    setLoading(true)
    setMessage(null)
    setCanResendEmail(false)

    try {
      if (mode === 'phone') {
        if (!normalizedPhone) {
          setMessage({
            text: 'Telefon numarasını 5xx xxx xx xx formatında gir.',
            kind: 'error',
          })
          return
        }

        if (password.length < 6) {
          setMessage({ text: 'Şifren en az 6 karakter olmalı.', kind: 'error' })
          return
        }

        // Telefon numarasını Supabase'in email alanına eşliyoruz.
        // Böylece SMS ücreti olmadan telefon + şifre ile giriş yapılabiliyor.
        const authEmail = phoneToEmail(normalizedPhone)

        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email: authEmail,
            password,
            options: {
              data: { phone: normalizedPhone, signup_mode: 'phone' },
            },
          })

          if (error) {
            setMessage({ text: getErrorMessage(error), kind: 'error' })
          } else if (data.user && data.user.identities?.length === 0) {
            setMessage({
              text: 'Bu telefon numarası ile zaten bir hesap var. Giriş yapmayı dene.',
              kind: 'info',
            })
          } else if (data.session && data.user) {
            router.push(await getPostAuthPath(data.user.id))
          } else {
            setMessage({
              text: 'Kayıt alındı ama oturum açılmadı. Supabase’de Authentication → Providers → Email → “Confirm email” ayarını kapatman gerekiyor.',
              kind: 'error',
            })
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password,
          })

          if (error) {
            setMessage({ text: getErrorMessage(error), kind: 'error' })
          } else if (data.user) {
            router.push(await getPostAuthPath(data.user.id))
          }
        }
      } else {
        if (!cleanEmail) {
          setMessage({ text: 'Email adresini gir.', kind: 'error' })
          return
        }

        if (isSignUp && password.length < 6) {
          setMessage({ text: 'Şifren en az 6 karakter olmalı.', kind: 'error' })
          return
        }

        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
          })

          if (error) {
            setMessage({ text: getErrorMessage(error), kind: 'error' })
          } else if (data.user && data.user.identities?.length === 0) {
            setMessage({
              text: 'Bu email ile zaten bir hesap var. Giriş yapmayı dene.',
              kind: 'info',
            })
          } else if (!data.session) {
            setMessage({
              text: 'Kayıt alındı! Email adresine gelen onay linkine tıktıktan sonra giriş yapabilirsin.',
              kind: 'success',
            })
            setCanResendEmail(true)
            setIsSignUp(false)
          } else if (data.user) {
            router.push(await getPostAuthPath(data.user.id))
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          })

          if (error) {
            setMessage({ text: getErrorMessage(error), kind: 'error' })
            setCanResendEmail(
              error.code === 'email_not_confirmed' ||
                error.message.toLowerCase().includes('email not confirmed')
            )
          } else if (data.user) {
            router.push(await getPostAuthPath(data.user.id))
          }
        }
      }
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? getErrorMessage({ message: error.message })
            : 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.',
        kind: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (loading || !cleanEmail) return

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      })

      if (error) {
        setMessage({ text: getErrorMessage(error), kind: 'error' })
      } else {
        setMessage({
          text: 'Onay emaili tekrar gönderildi. Gelen kutunu ve spam klasörünü kontrol et.',
          kind: 'success',
        })
        setCanResendEmail(false)
      }
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? getErrorMessage({ message: error.message })
            : 'Onay emaili gönderilemedi. Lütfen tekrar dene.',
        kind: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setIsSignUp(false)
    setMessage(null)
    setCanResendEmail(false)
  }

  const title =
    isSignUp
      ? mode === 'phone'
        ? '📝 Telefonla Kayıt Ol'
        : '📝 Email ile Kayıt Ol'
      : '👋 Tekrar Hoş Geldin'

  const description =
    isSignUp
      ? mode === 'phone'
        ? 'Telefon numaranı ve bir şifre belirle, hemen üye ol'
        : 'Email adresini ve bir şifre belirleyerek üye ol'
      : mode === 'phone'
        ? 'Telefon numaran ve şifrenle giriş yap'
        : 'Email ve şifrenle giriş yap'

  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-medium text-emerald-800 mb-1">
          swap<span className="text-emerald-500">well</span>
        </h1>

        <div className="bg-emerald-50 rounded-lg px-4 py-3 mb-6 mt-4">
          <p className="text-sm font-medium text-emerald-800">{title}</p>
          <p className="text-xs text-emerald-600 mt-1">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-emerald-50 p-1 rounded-lg mb-5">
          <button
            type="button"
            onClick={() => switchMode('phone')}
            className={`text-sm py-2 rounded-md transition-colors ${
              mode === 'phone'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-emerald-600'
            }`}
          >
            📱 Telefon
          </button>
          <button
            type="button"
            onClick={() => switchMode('email')}
            className={`text-sm py-2 rounded-md transition-colors ${
              mode === 'email'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-emerald-600'
            }`}
          >
            ✉️ E-posta
          </button>
        </div>

        {mode === 'phone' ? (
          <>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Telefon numaran</label>
            <div className="flex mb-3">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                +90
              </span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="5xx xxx xx xx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                className="w-full border border-gray-200 rounded-r-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
              />
            </div>
          </>
        ) : (
          <>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email adresin</label>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400"
            />
          </>
        )}

        <label className="text-xs font-medium text-gray-500 mb-1 block">
          {isSignUp ? 'Bir şifre oluştur' : 'Şifren'}
        </label>
        <input
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          placeholder={isSignUp ? 'En az 6 karakter' : 'Şifreni gir'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-emerald-400"
        />

        {message && (
          <p
            aria-live="polite"
            className={`text-sm mb-3 ${
              message.kind === 'error'
                ? 'text-red-600'
                : message.kind === 'success'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
            }`}
          >
            {message.kind === 'error' ? '❌ ' : message.kind === 'success' ? '✅ ' : 'ℹ️ '}
            {message.text}
          </p>
        )}

        {canResendEmail && (
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full text-emerald-700 underline text-sm mb-4 disabled:opacity-50"
          >
            Onay emailini tekrar gönder
          </button>
        )}

        <button
          type="button"
          onClick={handleAuth}
          disabled={
            loading ||
            (mode === 'phone' ? !normalizedPhone || !password : !cleanEmail || !password)
          }
          className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Yükleniyor...' : isSignUp ? 'Hesabı oluştur' : 'Giriş yap'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setMessage(null)
            setCanResendEmail(false)
          }}
          className="w-full text-center text-sm text-gray-500 mt-4 hover:text-emerald-600"
        >
          {isSignUp
            ? 'Zaten hesabın var mı? Giriş yap'
            : mode === 'phone'
              ? 'Hesabın yok mu? Telefonla kayıt ol'
              : 'Hesabın yok mu? Email ile kayıt ol'}
        </button>

        {mode === 'phone' && (
          <p className="text-xs text-gray-400 text-center mt-4">
            SMS kodu gönderilmez, ek ücret yok. Numaran profilinde görünür.
          </p>
        )}
      </div>
    </main>
  )
}
