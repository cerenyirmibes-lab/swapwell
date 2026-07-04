'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [message, setMessage] = useState('')
  const [joined, setJoined] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)

  useEffect(() => {
    fetchEvent()
  }, [])

  const fetchEvent = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (data) {
      setEvent(data)
      const { count } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact' })
        .eq('event_id', data.id)
      setParticipantCount(count || 0)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: existing } = await supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', data.id)
          .eq('user_id', user.id)
          .single()
        if (existing) setJoined(true)
      }
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    setJoining(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Kredi kontrol
    if (event.credit_cost > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (!profile || profile.credits < event.credit_cost) {
        setMessage('❌ Yeterli kredin yok!')
        setJoining(false)
        return
      }

      // Kredi düş
      await supabase
        .from('profiles')
        .update({ credits: profile.credits - event.credit_cost })
        .eq('id', user.id)
    }

    // Katılımcı ekle
    const { error } = await supabase
      .from('event_participants')
      .insert({ event_id: event.id, user_id: user.id })

    if (error) {
      setMessage('❌ Bir hata oluştu')
    } else {
      setJoined(true)
      setParticipantCount(prev => prev + 1)
      setMessage('✅ Etkinliğe katıldın!')
    }
    setJoining(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <p className="text-gray-400">Yükleniyor...</p>
    </main>
  )

  if (!event) return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <p className="text-gray-400">Etkinlik bulunamadı</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-emerald-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/events" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-lg font-medium text-gray-800">Etkinlik Detayı</h1>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center px-6">
            <h2 className="text-white text-xl font-medium">{event.title}</h2>
          </div>

          <div className="p-6">
            {event.description && (
              <p className="text-gray-600 text-sm mb-4">{event.description}</p>
            )}

            <div className="flex flex-col gap-2 mb-6">
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>📍</span> {event.location}
                </div>
              )}
              {event.event_date && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>📅</span> {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>👥</span> {participantCount} / {event.max_participants} katılımcı
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>🔄</span> {event.credit_cost === 0 ? 'Ücretsiz' : `${event.credit_cost} kredi`}
              </div>
            </div>

            {/* Doluluk */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: event.max_participants }).map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i < participantCount ? 'bg-emerald-500' : 'bg-gray-100'}`} />
              ))}
            </div>

            {message && (
              <p className="text-sm mb-4 text-center">{message}</p>
            )}

            {joined ? (
              <div className="w-full bg-emerald-50 text-emerald-600 rounded-lg py-3 text-sm font-medium text-center border border-emerald-200">
                ✅ Katıldın!
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining || participantCount >= event.max_participants}
                className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {joining ? 'İşleniyor...' : participantCount >= event.max_participants ? 'Etkinlik dolu' : `Katıl ${event.credit_cost > 0 ? `(${event.credit_cost} kredi)` : '(ücretsiz)'}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}