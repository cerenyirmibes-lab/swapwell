'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const categories = [
  '🧘 Yoga', '🏋️ Pilates', '🎾 Tenis', '🏄 Sörf', '⛸️ Buz Pateni',
  '🐴 Binicilik', '🎨 Resim', '🗣️ İngilizce', '🎵 Müzik', '🏊 Yüzme',
  '🚴 Bisiklet', '💃 Dans', '🥊 Boks', '🧗 Tırmanış', '🎭 Tiyatro'
]

const locations = [
  '⛵ Tekne/Yat', '🏋️ Spor salonu', '🌊 Sahil', '🌿 Orman/Doğa', '🏢 Stüdyo', '☕ Kafe', '🏠 Ev', '📍 Diğer'
]

export default function CreateEventPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [locationDetail, setLocationDetail] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(8)
  const [creditCost, setCreditCost] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    // Gerçek kayıt sonra eklenecek
    setTimeout(() => {
      router.push('/events')
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-emerald-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/events" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-lg font-medium text-gray-800">Etkinlik oluştur</h1>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Etkinlik adı</label>
            <input
              placeholder="örn. Teknede Pilates — Boğaz Turu"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Açıklama</label>
            <textarea
              placeholder="Etkinliği anlat, ne yapılacak, ne gerekli..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none h-24"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-3 py-2 rounded-full border transition-colors ${category === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Mekan tipi</label>
            <div className="flex flex-wrap gap-2">
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`text-xs px-3 py-2 rounded-full border transition-colors ${location === loc ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-400'}`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Adres / Konum detayı</label>
            <input
              placeholder="örn. Beşiktaş Marina, İstanbul"
              value={locationDetail}
              onChange={e => setLocationDetail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tarih</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Saat</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Maks katılımcı</label>
              <input
                type="number"
                min={2}
                max={50}
                value={maxParticipants}
                onChange={e => setMaxParticipants(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Kredi maliyeti</label>
              <input
                type="number"
                min={0}
                max={10}
                value={creditCost}
                onChange={e => setCreditCost(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
              />
              <p className="text-xs text-gray-400 mt-1">0 = ücretsiz</p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !title || !date}
            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Oluşturuluyor...' : 'Etkinliği oluştur →'}
          </button>

        </div>
      </div>
    </main>
  )
}