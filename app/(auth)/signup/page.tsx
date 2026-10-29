'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { getAuthErrorMessage } from '../../lib/auth-errors'

type Step = 'email' | 'code' | 'password'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const cleanEmail = email.trim().toLowerCase()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const sendCode = async () => {
    if (loading) return

    setLoading(true)
    setError('')
    setInfo('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          // Maildeki bağlantıya tıklayanlar da şifre oluşturabilsin
          emailRedirectTo: `${window.location.origin}/set-password`,
        },
      })

      if (error) {
        setError(getAuthErrorMessage(error))
      } else {
        setStep('code')
        setCooldown(60)
        setInfo('Email adresine 6 haneli doğrulama kodu gönderdik.')
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
    setError('')
    setInfo('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token,
        type: 'email',
      })

      if (error) {
        setError(getAuthErrorMessage(error))
      } else if (data.session) {
        setStep('password')
        setInfo('Email adresin doğrulandı. Şimdi bir şifre oluştur.')
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
      setError('Şifren en az 6 karakter olmalı.')
      return
    }

    if (password !== confirm) {
      setError('Şifreler birbiriyle aynı değil.')
      return
    }

    setLoading(true)
    setError('')

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
          : 'Şifre kaydedilemedi. Lütfen tekrar dene.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-medium text-emerald-800 mb-1">
          swap<span className="text-emerald-500">well</span>
        </h1>

        <div className="bg-emerald-50 rounded-lg px-4 py-3 mb-6 mt-4">
          <p className="text-sm font-medium text-emerald-800">
            {step === 'email' ? '📝 Hesap Oluştur' : step === 'code' ? '📬 Emailini Doğrula' : '🔐 Şifreni Oluştur'}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {step === 'email'
              ? 'Email adresini yaz, doğrulama kodunu gönderelim'
              : step === 'code'
                ? `${cleanEmail} adresine gelen 6 haneli kodu gir`
                : 'Emailin doğrulandı. Giriş için bir şifre belirle'}
          </p>
        </div>

        {step === 'email' && (
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
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-emerald-400"
            />
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
            <label className="text-xs font-medium text-gray-500 mb-1 block">Şifre</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="En az 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400"
            />

            <label className="text-xs font-medium text-gray-500 mb-1 block">Şifre (tekrar)</label>
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

        {step === 'email' && (
          <button
            type="button"
            onClick={sendCode}
            disabled={loading || !cleanEmail}
            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Gönderiliyor...' : 'Doğrulama kodu gönder'}
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
                setStep('email')
                setToken('')
                setError('')
                setInfo('')
              }}
              className="w-full text-center text-sm text-gray-500 mt-3 hover:text-emerald-600"
            >
              Email adresini değiştir
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
            {loading ? 'Kaydediliyor...' : 'Şifreyi oluştur ve devam et'}
          </button>
        )}

        <Link
          href="/login"
          className="block text-center text-sm text-gray-500 mt-4 hover:text-emerald-600"
        >
          Zaten hesabın var mı? Giriş yap
        </Link>
      </div>
    </main>
  )
}
