'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { getAuthErrorMessage } from '../../lib/auth-errors'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const cleanEmail = email.trim().toLowerCase()

  const handleSendLink = async () => {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/set-password`,
        },
      })

      if (error) {
        setError(getAuthErrorMessage(error))
      } else {
        setSent(true)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? getAuthErrorMessage({ message: err.message })
          : 'Bağlantı gönderilemedi. Lütfen tekrar dene.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm text-center">
          <div className="text-4xl mb-3">📬</div>
          <h1 className="text-lg font-medium text-emerald-800 mb-2">Emailini kontrol et</h1>
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-medium text-gray-700">{cleanEmail}</span> adresine bir doğrulama
            bağlantısı gönderdik. Bağlantıya tıkladıktan sonra şifreni oluşturacaksın.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Mail gelmediyse spam/gereksiz klasörüne de bak. Bağlantı bir süre sonra geçersiz olur.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false)
              setError('')
            }}
            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 transition-colors mb-3"
          >
            Tekrar gönder
          </button>
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
          <p className="text-sm font-medium text-emerald-800">📝 Hesap Oluştur</p>
          <p className="text-xs text-emerald-600 mt-1">
            Emailini yaz, doğrulama bağlantısı gönderelim. Sonra şifreni oluşturacaksın.
          </p>
        </div>

        <label className="text-xs font-medium text-gray-500 mb-1 block">Email adresin</label>
        <input
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && cleanEmail && handleSendLink()}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-emerald-400"
        />

        {error && <p className="text-sm text-red-600 mb-3">❌ {error}</p>}

        <button
          type="button"
          onClick={handleSendLink}
          disabled={loading || !cleanEmail}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Gönderiliyor...' : 'Doğrulama bağlantısı gönder'}
        </button>

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
