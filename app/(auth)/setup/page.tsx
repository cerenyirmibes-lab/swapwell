'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const categories = [
  '🧘 Yoga', '🏋️ Pilates', '🎾 Tenis', '🏄 Sörf', '⛸️ Buz Pateni',
  '🐴 Binicilik', '🎨 Resim', '🗣️ İngilizce', '🎵 Müzik', '🏊 Yüzme',
  '🚴 Bisiklet', '💃 Dans', '🥊 Boks', '🧗 Tırmanış', '🎭 Tiyatro'
]

export default function SetupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [offers, setOffers] = useState<string[]>([])
  const [wants, setWants] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) setList(list.filter(i => i !== item))
    else setList([...list, item])
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMessage('Giriş yapman gerekiyor'); setLoading(false); return }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      username,
      bio,
      offers,
      wants,
      credits: 3
    })

    if (error) setMessage(error.message)
    else router.push('/')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-emerald-50 py-10 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-medium text-emerald-800 mb-1">Profilini oluştur</h1>
        <p className="text-sm text-gray-500 mb-6">Başlamak için birkaç bilgi yeter</p>

        <input
          placeholder="Ad Soyad"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400"
        />
        <input
          placeholder="Kullanıcı adı (@)"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:border-emerald-400"
        />
        <textarea
          placeholder="Kendinden kısaca bahset..."
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-6 outline-none focus:border-emerald-400 resize-none h-20"
        />

        <p className="text-sm font-medium text-gray-700 mb-3">Ne sunuyorsun? 🎁</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => toggle(offers, setOffers, cat)}
              className={`text-xs px-3 py-2 rounded-full border transition-colors ${
                offers.includes(cat)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-gray-200 text-gray-600 hover:border-emerald-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-gray-700 mb-3">Ne istiyorsun? ✨</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => toggle(wants, setWants, cat)}
              className={`text-xs px-3 py-2 rounded-full border transition-colors ${
                wants.includes(cat)
                  ? 'bg-emerald-400 text-white border-emerald-400'
                  : 'border-gray-200 text-gray-600 hover:border-emerald-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {message && <p className="text-sm text-red-500 mb-3">{message}</p>}

        <button
          onClick={handleSave}
          disabled={loading || !fullName || !username}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Kaydediliyor...' : 'Devam et →'}
        </button>
      </div>
    </main>
  )
}