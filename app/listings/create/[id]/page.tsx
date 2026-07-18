'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const categories = [
  '🧘 Yoga', '🏋️ Pilates', '🏃 Fitness', '🎾 Tenis', '🏄 Sörf', '⛸️ Buz Pateni',
  '🐴 Binicilik', '🎨 Resim', '🗣️ İngilizce', '🎵 Müzik', '🏊 Yüzme',
  '🚴 Bisiklet', '💃 Dans', '🥊 Boks', '🧗 Tırmanış', '🎭 Tiyatro',
]

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [offering, setOffering] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    fetchListing()
  }, [])

  const fetchListing = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('id', params.id)
      .single()
    setListing(data)
    setLoading(false)
  }

  const handleSwap = async () => {
    setSending(true)
    setFeedback('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    if (user.id === listing.user_id) {
      setFeedback('❌ Kendi ilanına teklif gönderemezsin!')
      setSending(false)
      return
    }

    const { error } = await supabase.from('swap_requests').insert({
      listing_id: listing.id,
      sender_id: user.id,
      receiver_id: listing.user_id,
      offering,
      message,
      status: 'pending'
    })

    if (error) {
      setFeedback('❌ ' + error.message)
    } else {
      setSent(true)
      setFeedback('✅ Teklif gönderildi!')
    }
    setSending(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <p className="text-gray-400">Yükleniyor...</p>
    </main>
  )

  if (!listing) return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <p className="text-gray-400">İlan bulunamadı</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-emerald-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-lg font-medium text-gray-800">İlan Detayı</h1>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-6 flex flex-col gap-4">

        {/* İlan kartı */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="h-20 bg-emerald-50 rounded-lg flex items-center justify-center text-4xl mb-4">🔄</div>
          <h2 className="font-medium text-gray-800 text-lg mb-2">{listing.title}</h2>
          {listing.description && <p className="text-sm text-gray-500 mb-4">{listing.description}</p>}
          <div className="flex gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">🎁 Sunuyor: {listing.offering}</span>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">✨ İstiyor: {listing.wanting}</span>
          </div>
        </div>

        {/* Teklif formu */}
        {!sent ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-medium text-gray-800 mb-4">Takas teklifi gönder</h3>

            <p className="text-sm font-medium text-gray-700 mb-2">Ne teklif ediyorsun?</p>
            <div className="flex flex-wrap gap-2 mb-4">
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

            <p className="text-sm font-medium text-gray-700 mb-2">Mesaj (opsiyonel)</p>
            <textarea
              placeholder="Kendinden kısaca bahset, ne zaman uygunsun..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none h-20 mb-4"
            />

            {feedback && <p className="text-sm mb-3">{feedback}</p>}

            <button
              onClick={handleSwap}
              disabled={sending || !offering}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {sending ? 'Gönderiliyor...' : 'Teklif gönder →'}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-medium text-emerald-800">Teklif gönderildi!</p>
            <p className="text-sm text-emerald-600 mt-1">Karşı taraf kabul edince bildirim alacaksın.</p>
            <Link href="/" className="inline-block mt-4 text-sm text-emerald-600 hover:underline">Ana sayfaya dön</Link>
          </div>
        )}
      </div>
    </main>
  )
}