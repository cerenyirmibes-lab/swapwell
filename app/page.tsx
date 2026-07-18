import Link from 'next/link'
import { supabase } from './lib/supabase'

const categories = [
  { label: 'Tümü', emoji: '✨' },
  { label: 'Spor', emoji: '🏋️' },
  { label: 'Wellness', emoji: '🧘' },
  { label: 'Sanat', emoji: '🎨' },
  { label: 'Dil', emoji: '🗣️' },
  { label: 'Müzik', emoji: '🎵' },
  { label: 'Outdoor', emoji: '🌿' },
]

export default async function Home() {
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-emerald-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-medium text-emerald-800">
          swap<span className="text-emerald-500">well</span>
        </h1>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-emerald-600 py-2 px-4">
            Giriş yap
          </Link>
          <Link href="/login" className="text-sm bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700">
            Üye ol
          </Link>
        </div>
      </nav>

      <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 px-6 py-12 text-center">
        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-3">Wellness · Spor · Sanat · Kültür</p>
        <h2 className="text-3xl font-medium text-emerald-900 mb-3">Yeteneğini paylaş,<br />yeni bir deneyim kazan</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Yoga öğret, İngilizce öğren. Pilates ver, buz pateni al. Etkinlikleri para yerine takas et.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/listings/create" className="bg-emerald-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-emerald-700">
            İlan oluştur
          </Link>
          <Link href="/events" className="border border-emerald-300 text-emerald-700 px-6 py-3 rounded-lg text-sm hover:bg-emerald-50">
            Etkinliklere bak
          </Link>
        </div>
      </div>

      <div className="px-6 py-4 flex gap-2 overflow-x-auto">
        {categories.map((cat, i) => (
          <button key={i} className={`flex-shrink-0 text-sm px-4 py-2 rounded-full border transition-colors ${i === 0 ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-400 bg-white'}`}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">Takas ilanları</h3>
          <span className="text-sm text-gray-400">{listings?.length || 0} ilan</span>
        </div>

        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-colors">
                <div className="h-24 bg-emerald-50 flex items-center justify-center text-4xl">
                  🔄
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-800 text-sm mb-1">{listing.title}</p>
                  {listing.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{listing.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">İstiyor: <strong>{listing.wanting}</strong></span>
                   <Link href={`/listings/${listing.id}`} className="text-xs border border-emerald-300 text-emerald-600 px-3 py-1 rounded-full hover:bg-emerald-50">
                    Takas et
                   </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🌿</p>
            <p className="text-gray-500 mb-4">Henüz ilan yok</p>
            <Link href="/listings/create" className="text-sm bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700">
              İlk ilanı oluştur
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}