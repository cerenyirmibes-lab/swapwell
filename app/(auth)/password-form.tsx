'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { getAuthErrorMessage } from '../lib/auth-errors'

type Mode = 'set' | 'reset'

const readLinkError = () => {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const searchParams = new URLSearchParams(window.location.search)
  return (
    hashParams.get('error_description') ||
    searchParams.get('error_description') ||
    null
  )
}

export default function PasswordForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; kind: 'error' | 'success' } | null>(null)

  useEffect(() => {
    let active = true
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    const linkError = readLinkError()

    if (linkError) {
      timer = setTimeout(() => {
        if (!active) return

        let text = linkError

        try {
          text = decodeURIComponent(linkError.replace(/\+/g, ' '))
        } catch {
          // bozuk URL parametresi: ham metni göster
        }

        setMessage({ text: getAuthErrorMessage({ message: text }), kind: 'error' })
        setChecking(false)
      }, 0)

      return () => {
        active = false
        if (timer) clearTimeout(timer)
      }
    }

    const check = async () => {
      const { data } = await supabase.auth.getSession()

      if (!active) return

      if (data.session) {
        setHasSession(true)
        setChecking(false)
        return
      }

      attempts += 1

      if (attempts >= 12) {
        setChecking(false)
        return
      }

      timer = setTimeout(check, 500)
    }

    check()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setHasSession(true)
        setChecking(false)
      }
    })

    return () => {
      active = false
      if (timer) clearTimeout(timer)
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSave = async () => {
    if (saving) return

    if (password.length < 6) {
      setMessage({ text: 'Şifren en az 6 karakter olmalı.', kind: 'error' })
      return
    }

    if (password !== confirm) {
      setMessage({ text: 'Şifreler birbiriyle aynı değil.', kind: 'error' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.updateUser({ password })

      if (error) {
        setMessage({ text: getAuthErrorMessage(error), kind: 'error' })
        return
      }

      setMessage({ text: 'Şifren kaydedildi. Yönlendiriliyorsun...', kind: 'success' })

      const user = data.user

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        router.push(profile ? '/profile' : '/setup')
      } else {
        router.push('/login')
      }
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? getAuthErrorMessage({ message: error.message })
            : 'Şifre kaydedilemedi. Lütfen tekrar dene.',
        kind: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">Bağlantı kontrol ediliyor...</p>
      </main>
    )
  }

  if (!hasSession) {
    return (
      <main className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm text-center">
          <div className="text-4xl mb-3">⌛</div>
          <h1 className="text-lg font-medium text-emerald-800 mb-2">
            Bağlantı geçersiz veya süresi dolmuş
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            {mode === 'set'
              ? 'Yeni bir doğrulama bağlantısı isteyip tekrar dene.'
              : 'Yeni bir şifre sıfırlama bağlantısı isteyip tekrar dene.'}
          </p>

          {message && <p className="text-sm text-red-600 mb-4">❌ {message.text}</p>}

          <Link
            href={mode === 'set' ? '/signup' : '/forgot-password'}
            className="block w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 transition-colors mb-3"
          >
            {mode === 'set' ? 'Yeni bağlantı gönder' : 'Yeni sıfırlama linki gönder'}
          </Link>

          <Link href="/login" className="text-sm text-gray-500 hover:text-emerald-600">
            Giriş sayfasına dön
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-medium text-emerald-800 mb-1">
          swap<span className="text-emerald-500">well</span>
        </h1>

        <div className="bg-emerald-50 rounded-lg px-4 py-3 mb-6 mt-4">
          <p className="text-sm font-medium text-emerald-800">
            {mode === 'set' ? '🔐 Şifreni oluştur' : '🔑 Yeni şifre belirle'}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {mode === 'set'
              ? 'Email adresin doğrulandı. Artık giriş için bir şifre belirleyebilirsin.'
              : 'Email adresin doğrulandı. Yeni şifreni belirle.'}
          </p>
        </div>

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
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-emerald-400"
        />

        {message && (
          <p
            aria-live="polite"
            className={`text-sm mb-3 ${
              message.kind === 'error' ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {message.kind === 'error' ? '❌ ' : '✅ '}
            {message.text}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !password || !confirm}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Kaydediliyor...' : mode === 'set' ? 'Şifreyi oluştur' : 'Şifreyi güncelle'}
        </button>
      </div>
    </main>
  )
}
