import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default async function EventsPage() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  return (
    <main className="min-h-screen bg-emerald-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-medium text-emerald-800">
          swap<span className="text-emerald-500">well</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-emerald-600 py-2 px-4">Takas</Link>
          <Link href="/events" className="text-sm text-emerald-600 font-medium py-2 px-4 border-b-2 border-emerald-500">Etkinlikler</Link>
        </div>
      </nav>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-800">Etkinlikler</h2>
          <Link href="/events/create" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            + Etkinlik oluştur
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-6">
          {['Tümü', '⛵ Tekne/Yat', '🏋️ Fitness', '🧘 Wellness', '🌊 Su sporları', '🐴 Outdoor'].map((f, i) => (
            <button key={i} className={`flex-shrink-0 text-sm px-4 py-2 rounded-full border transition-colors ${i === 0 ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 bg-white hover:border-emerald-400'}`}>
              {f}
            </button>
          ))}
        </div>

        {events && events.length > 0 ? (
          <div className="flex flex-col gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-colors">
                <div className="h-20 bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center px-4">
                  <span className="text-white font-medium">{event.title}</span>
                </div>
                <div className="p-4">
                  {event.location && (
                    <div className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 mb-3">
                      📍 {event.location}
                    </div>
                  )}
                  <div className="flex gap-4 mb-4">
                    {event.event_date && (
                      <span className="text-xs text-gray-500">📅 {new Date(event.event_date).toLocaleDateString('tr-TR')}</span>
                    )}
                    <span className="text-xs text-gray-500">👥 Maks {event.max_participants} kişi</span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-500 mb-4">{event.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {event.credit_cost === 0 ? (
                      <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full">✓ Ücretsiz</span>
                    ) : (
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">🔄 {event.credit_cost} kredi</span>
                    )}
                    <Link href={`/events/${event.id}`} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                      Katıl
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🌿</p>
            <p className="text-gray-500 mb-4">Henüz etkinlik yok</p>
            <Link href="/events/create" className="text-sm bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700">
              İlk etkinliği oluştur
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}