'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage('❌ ' + error.message)
      } else {
        setMessage('✅ Hesabın oluşturuldu! Şimdi giriş yapabilirsin.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage('❌ ' + error.message)
      } else {
        router.push('/setup')
      }
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-medium text-emerald-800 mb-1">
          swap<span className="text-emerald-500">well</span>
        </h1>

        <div className="bg-emerald-50 rounded-lg px-4 py-3 mb-6 mt-4">
          <p className="text-sm font-medium text-emerald-800">
            {isSignUp ? '📝 Yeni Hesap Oluşturuyorsun' : '👋 Tekrar Hoş Geldin'}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {isSignUp
              ? 'Email adresini ve bir şifre belirleyerek üye ol'
              : 'Email ve şifrenle giriş yap'}
          </p>
        </div>

        <label className="text-xs font-medium text-gray-500 mb-1 block">Email adresin</label>
        <input
          type="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400"
        />

        <label className="text-xs font-medium text-gray-500 mb-1 block">
          {isSignUp ? 'Bir şifre oluştur' : 'Şifren'}
        </label>
        <input
          type="password"
          placeholder={isSignUp ? 'En az 6 karakter' : 'Şifreni gir'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-emerald-400"
        />

        {message && (
          <p className="text-sm text-emerald-600 mb-3">{message}</p>
        )}

        <button
          onClick={handleAuth}
          disabled={loading || !email || !password}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Yükleniyor...' : isSignUp ? '✅ Hesabı Oluştur' : 'Giriş yap'}
        </button>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
          className="w-full text-center text-sm text-gray-500 mt-4 hover:text-emerald-600"
        >
          {isSignUp ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
        </button>
      </div>
    </main>
  )
}