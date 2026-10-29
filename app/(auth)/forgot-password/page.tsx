'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { getAuthErrorMessage } from '../../lib/auth-errors'
import { normalizePhone } from '../../lib/phone'

type Method = 'email' | 'phone'
type Step = 'request' | 'code' | 'password'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [method, setMethod] = useState<Method>('email')
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const cleanEmail = email.trim().toLowerCase()
  const normalizedPhone = normalizePhone(phone)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const resetFeedback = () => {
    setError('')
    setInfo('')
  }

  const sendCode = async () => {
    if (loading) return

    if (method === 'email' && !cleanEmail) {
      setError('Email adresini gir.')
      return
    }

    if (method === 'phone' && !normalizedPhone) {
      setError('Telefon numarasını 5xx xxx xx xx formatında gir.')
      return
    }

    setLoading(true)
    resetFeedback()

    try {
      const { error } =
        method === 'email'
          ? await supabase.auth.signInWithOtp({
              email: cleanEmail,
              options: {
                shouldCreateUser: false,
                emailRedirectTo: `${window.location.origin}/reset-password`,
              },
            })
          : await supabase.auth.signInWithOtp({
              phone: normalizedPhone as string,
              options: { shouldCreateUser: false },
            })

      if (error) {
        setError(getAuthErrorMessage(error, method))
      } else {
        setStep('code')
        setCooldown(60)
        setInfo(
          method === 'email'
            ? 'Email adresine 6 haneli şifre sıfırlama kodu gönderdik.'
            : 'Telefonuna 6 haneli şifre sıfırlama kodu gönderdik.'
        )
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? getAuthErrorMessage({ message: err.message })
          : 'Kod gönderilemedi. Lütfen tekrar dene.'
      )
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    if (loading) return

    if (token.length !== 6) {
      setError('Kodu 6 haneli olarak gir.')
      return
    }

    setLoading(true)
    resetFeedback()

    try {
      const { data, error } =
        method === 'email'
          ? await supabase.auth.verifyOtp({
              email: cleanEmail,
              token,
              type: 'email',
            })
          : await supabase.auth.verifyOtp({
              phone: normalizedPhone as string,
              token,
              type: 'sms',
            })

      if (error) {
        setError(getAuthErrorMessage(error))
      } else if (data.session) {
        setStep('password')
        setInfo('Kod doğrulandı. Şimdi yeni şifreni belirle.')
      } else {
        setError('Kod doğrulanamadı. Lütfen tekrar dene.')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? getAuthErrorMessage({ message: err.message })
          : 'Kod doğrulanamadı. Lütfen tekrar dene.'
      )
    } finally {
      setLoading(false)
    }
  }

  const savePassword = async () => {
    if (loading) return

    if (password.length < 6) {
      setError('Yeni şifren en az 6 karakter olmalı.')
      return
    }

    if (password !== confirm) {
      setError('Şifreler birbiriyle aynı değil.')
      return
    }

    setLoading(true)
    resetFeedback()

    try {
      const { data, error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(getAuthErrorMessage(error))
        return
      }

      const user = data.user

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      router.push(profile ? '/profile' : '/setup')
    } catch (err) {
      setError(
        err instanceof Error
          ? getAuthErrorMessage({ message: err.message })
          : 'Şifre güncellenemedi. Lütfen tekrar dene.'
      )
    } finally {
      setLoading(false)
    }
  }

  const switchMethod = (next: Method) => {
    setMethod(next)
    setStep('request')
    setToken('')
    setError('')
    setInfo('')
  }

  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-medium text-emerald-800 mb-1">
          swap<span className="text-emerald-500">well</span>
        </h1>

        <div className="bg-emerald-50 rounded-lg px-4 py-3 mb-6 mt-4">
          <p className="text-sm font-medium text-emerald-800">
            {step === 'request' ? '🔑 Şifremi Unuttum' : step === 'code' ? '📨 Kodu Gir' : '🔐 Yeni Şifre'}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {step === 'request'
              ? 'Kodu hangi yolla almak istersin?'
              : step === 'code'
                ? method === 'email'
                  ? `${cleanEmail} adresine gelen 6 haneli kodu gir`
                  : `${normalizedPhone} numarasına gelen 6 haneli kodu gir`
                : 'Kod doğrulandı. Yeni şifreni belirle.'}
          </p>
        </div>

        {step === 'request' && (
          <>
            <div className="grid grid-cols-2 gap-2 bg-emerald-50 p-1 rounded-lg mb-5">
              <button
                type="button"
                onClick={() => switchMethod('email')}
                className={`text-sm py-2 rounded-md transition-colors ${
                  method === 'email'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-emerald-600'
                }`}
              >
                ✉️ E-posta
              </button>
              <button
                type="button"
                onClick={() => switchMethod('phone')}
                className={`text-sm py-2 rounded-md transition-colors ${
                  method === 'phone'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-emerald-600'
                }`}
              >
                📱 Telefon
              </button>
            </div>

            {method === 'email' ? (
              <>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email adresin</label>
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && cleanEmail && sendCode()}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400"
                />
              </>
            ) : (
              <>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Telefon numaran</label>
                <div className="flex mb-3">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                    +90
                  </span>
                  <input
                    type="tel"
                    autoComplete="tel-national"
                    inputMode="tel"
                    placeholder="5xx xxx xx xx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && normalizedPhone && sendCode()}
                    className="w-full border border-gray-200 rounded-r-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
                  />
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Telefonla kod için Supabase’de SMS sağlayıcısı (Twilio) kurulu olmalıdır. Bu ücretli
                  bir hizmettir; ücretsiz kullanmak istersen e-posta seçeneğini kullan.
                </p>
              </>
            )}
          </>
        )}

        {step === 'code' && (
          <>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Doğrulama kodu</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6 haneli kod"
              value={token}
              onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && verifyCode()}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 tracking-[0.4em] text-center outline-none focus:border-emerald-400"
            />
          </>
        )}

        {step === 'password' && (
          <>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Yeni şifre</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="En az 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400"
            />

            <label className="text-xs font-medium text-gray-500 mb-1 block">Yeni şifre (tekrar)</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Şifreni tekrar gir"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && savePassword()}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-emerald-400"
            />
          </>
        )}

        {info && <p className="text-sm text-emerald-600 mb-3">✅ {info}</p>}
        {error && <p className="text-sm text-red-600 mb-3">❌ {error}</p>}

        {step === 'request' && (
          <button
            type="button"
            onClick={sendCode}
            disabled={
              loading ||
              (method === 'email' ? !cleanEmail : !normalizedPhone)
            }
            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading
              ? 'Gönderiliyor...'
              : method === 'email'
                ? 'E-postaya kod gönder'
                : 'Telefona kod gönder'}
          </button>
        )}

        {step === 'code' && (
          <>
            <button
              type="button"
              onClick={verifyCode}
              disabled={loading || token.length !== 6}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Doğrulanıyor...' : 'Kodu doğrula'}
            </button>

            <button
              type="button"
              onClick={sendCode}
              disabled={loading || cooldown > 0}
              className="w-full text-center text-sm text-emerald-700 underline mt-4 disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Kodu tekrar gönder (${cooldown}s)` : 'Kodu tekrar gönder'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('request')
                setToken('')
                resetFeedback()
              }}
              className="w-full text-center text-sm text-gray-500 mt-3 hover:text-emerald-600"
            >
              Yöntemi değiştir
            </button>
          </>
        )}

        {step === 'password' && (
          <button
            type="button"
            onClick={savePassword}
            disabled={loading || !password || !confirm}
            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Kaydediliyor...' : 'Şifreyi güncelle'}
          </button>
        )}

        <Link
          href="/login"
          className="block text-center text-sm text-gray-500 mt-4 hover:text-emerald-600"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    </main>
  )
}
