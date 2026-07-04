import Link from 'next/link'

const mockEvents = [
  {
    id: 1,
    title: 'Teknede Pilates — Boğaz Turu',
    organizer: 'Ayşe Koç',
    role: 'Pilates eğitmeni',
    location: 'Beşiktaş Marina, İstanbul',
    date: '15 Temmuz, Pazar',
    time: '09:00 — 11:30',
    maxParticipants: 8,
    currentParticipants: 5,
    creditCost: 2,
    emoji: '🧘',
    tag: '⛵ Tekne etkinliği',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 2,
    title: 'SUP Yoga — Yat Güvertesinde',
    organizer: 'Bora Tunç',
    role: 'Sörf & SUP eğitmeni',
    location: 'Çeşme Martı Marina',
    date: '20 Temmuz, Cumartesi',
    time: '07:30 — 10:00',
    maxParticipants: 6,
    currentParticipants: 2,
    creditCost: 2,
    emoji: '🏄',
    tag: '🛥️ Yat etkinliği',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 3,
    title: 'Şafak Biniciliği — Orman Parkuru',
    organizer: 'Selin Demir',
    role: 'Binicilik eğitmeni',
    location: 'Belgrad Ormanı, İstanbul',
    date: '21 Temmuz, Pazar',
    time: '06:30 — 09:00',
    maxParticipants: 5,
    currentParticipants: 4,
    creditCost: 0,
    emoji: '🏇',
    tag: '🐴 Outdoor',
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 4,
    title: 'Gün Batımı Yoga — Sahilde',
    organizer: 'Melis Yıldız',
    role: 'Yoga eğitmeni',
    location: 'Kilyos Plajı, İstanbul',
    date: '22 Temmuz, Pazartesi',
    time: '19:30 — 21:00',
    maxParticipants: 12,
    currentParticipants: 7,
    creditCost: 1,
    emoji: '🌅',
    tag: '🌊 Outdoor',
    color: 'from-orange-400 to-pink-500',
  },
]

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-emerald-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-medium text-emerald-800">
          swap<span className="text-emerald-500">well</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-emerald-600 py-2 px-4">
            Takas
          </Link>
          <Link href="/events" className="text-sm text-emerald-600 font-medium py-2 px-4 border-b-2 border-emerald-500">
            Etkinlikler
          </Link>
        </div>
      </nav>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800">Etkinlikler</h2>
          <Link href="/events/create" className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            + Etkinlik oluştur
          </Link>
        </div>

        {/* Filtreler */}
        <div className="flex gap-2 overflow-x-auto mb-6">
          {['Tümü', '⛵ Tekne/Yat', '🏋️ Fitness', '🧘 Wellness', '🌊 Su sporları', '🐴 Outdoor'].map((f, i) => (
            <button key={i} className={`flex-shrink-0 text-sm px-4 py-2 rounded-full border transition-colors ${i === 0 ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 bg-white hover:border-emerald-400'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Etkinlik kartları */}
        <div className="flex flex-col gap-4">
          {mockEvents.map(event => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-colors">
              {/* Banner */}
              <div className={`h-24 bg-gradient-to-r ${event.color} flex items-center justify-between px-4`}>
                <span className="text-white text-xs bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">{event.tag}</span>
                <span className="text-4xl">{event.emoji}</span>
              </div>

              <div className="p-4">
                {/* Organizatör */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">
                    {event.organizer.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-xs text-gray-500">{event.organizer}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{event.role}</span>
                </div>

                <h3 className="font-medium text-gray-800 mb-2">{event.title}</h3>

                {/* Konum */}
                <div className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 mb-3">
                  📍 {event.location}
                </div>

                {/* Meta */}
                <div className="flex gap-4 mb-4">
                  <span className="text-xs text-gray-500">📅 {event.date}</span>
                  <span className="text-xs text-gray-500">🕐 {event.time}</span>
                  <span className="text-xs text-gray-500">👥 Maks {event.maxParticipants} kişi</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {/* Doluluk */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: event.maxParticipants }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < event.currentParticipants ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{event.currentParticipants}/{event.maxParticipants}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {event.creditCost === 0 ? (
                      <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full">✓ Ücretsiz</span>
                    ) : (
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">🔄 {event.creditCost} kredi</span>
                    )}
                    <button className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                      Katıl
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}