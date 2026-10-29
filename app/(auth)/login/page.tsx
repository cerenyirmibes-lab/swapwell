'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { getAuthErrorMessage } from '../../lib/auth-errors'

type MessageKind = 'error' | 'success' | 'info'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; kind: MessageKind } | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const cleanEmail = email.trim().toLowerCase()

  const handleSignIn = async () => {
    if (loading) return

    setLoading(true)
    setMessage(null)
    setNeedsConfirmation(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        const needsConfirm =
          error.code === 'email_not_confirmed' ||
          error.message.toLowerCase().includes('email not confirmed')

        setNeedsConfirmation(needsConfirm)
        setMessage({ text: getAuthErrorMessage(error), kind: 'error' })
        return
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()

        router.push(profile ? '/profile' : '/setup')
      }
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? getAuthErrorMessage({ message: error.message })
            : 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.',
        kind: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (loading || !cleanEmail) return

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/set-password`,
        },
      })

      if (error) {
        setMessage({ text: getAuthErrorMessage(error), kind: 'error' })
      } else {
        setMessage({
          text: 'Doğrulama bağlantısı tekrar gönderildi. Gelen kutunu ve spam klasörünü kontrol et.',
          kind: 'success',
        })
        setNeedsConfirmation(false)
      }
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
          <p className="text-sm font-medium text-emerald-800">👋 Tekrar Hoş Geldin</p>
          <p className="text-xs text-emerald-600 mt-1">Email ve şifrenle giriş yap</p>
        </div>

        <label className="text-xs font-medium text-gray-500 mb-1 block">Email adresin</label>
        <input
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSignIn()}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400"
        />

        <label className="text-xs font-medium text-gray-500 mb-1 block">Şifren</label>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Şifreni gir"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSignIn()}
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

        {needsConfirmation && (
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={loading}
            className="w-full text-emerald-700 underline text-sm mb-4 disabled:opacity-50"
          >
            Doğrulama bağlantısını tekrar gönder
          </button>
        )}

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading || !cleanEmail || !password}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Yükleniyor...' : 'Giriş yap'}
        </button>

        <div className="flex items-center justify-between mt-4 text-sm">
          <Link href="/forgot-password" className="text-gray-500 hover:text-emerald-600">
            Şifremi unuttum
          </Link>
          <Link href="/signup" className="text-emerald-700 hover:text-emerald-800">
            Hesabın yok mu? Kayıt ol
          </Link>
        </div>
      </div>
    </main>
  )
}
