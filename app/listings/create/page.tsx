'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const categories = [
  '🧘 Yoga', '🏋️ Pilates', '🏃 Fitness', '🎾 Tenis', '🏄 Sörf', '⛸️ Buz Pateni',
  '🐴 Binicilik', '🎨 Resim', '🗣️ İngilizce', '🎵 Müzik', '🏊 Yüzme',
  '🚴 Bisiklet', '💃 Dans', '🥊 Boks', '🧗 Tırmanış', '🎭 Tiyatro',
  '📸 Fotoğrafçılık', '🍳 Yemek', '🧘 Meditasyon', '🎸 Gitar'
]

export default function CreateListingPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [offering, setOffering] = useState('')
  const [wanting, setWanting] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleCreate = async () => {
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('listings').insert({
      user_id: user.id,
      title,
      description,
      offering,
      wanting,
      type: 'swap'
    })

    if (error) {
      setMessage('❌ ' + error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <main className="min-h-screen bg-emerald-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-lg font-medium text-gray-800">Takas ilanı oluştur</h1>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">İlan başlığı</label>
            <input
              placeholder="örn. Yoga dersi veriyorum"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Açıklama</label>
            <textarea
              placeholder="Deneyimin, seviyesi, ne kadar süre, nerede..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none h-20"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">🎁 Ne sunuyorsun?</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setOffering(cat)}
                  className={`text-xs px-3 py-2 rounded-full border transition-colors ${offering === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {offering && <p className="text-xs text-emerald-600 mt-2">Seçilen: {offering}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">✨ Ne istiyorsun?</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setWanting(cat)}
                  className={`text-xs px-3 py-2 rounded-full border transition-colors ${wanting === cat ? 'bg-emerald-400 text-white border-emerald-400' : 'border-gray-200 text-gray-600 hover:border-emerald-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {wanting && <p className="text-xs text-emerald-400 mt-2">Seçilen: {wanting}</p>}
          </div>

          {message && <p className="text-sm text-red-500">{message}</p>}

          <button
            onClick={handleCreate}
            disabled={loading || !title || !offering || !wanting}
            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Oluşturuluyor...' : 'İlanı oluştur →'}
          </button>

        </div>
      </div>
    </main>
  )
}