'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [participations, setParticipations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)

    const { data: l } = await supabase.from('listings').select('*').eq('user_id', user.id)
    setListings(l || [])

    const { data: parts } = await supabase.from('event_participants').select('*, events(*)').eq('user_id', user.id)
    setParticipations(parts || [])

    setLoading(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <p className="text-gray-400">Yükleniyor...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-emerald-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-medium text-emerald-800">
          swap<span className="text-emerald-500">well</span>
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Ana sayfa</Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-6 flex flex-col gap-6">

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-medium text-emerald-700">
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
            </div>
            <div>
              <h2 className="font-medium text-gray-800">{profile?.full_name || 'İsimsiz'}</h2>
              <p className="text-sm text-gray-400">@{profile?.username || 'kullanici'}</p>
            </div>
            <div className="ml-auto text-center">
              <div className="text-2xl font-medium text-emerald-600">{profile?.credits || 0}</div>
              <div className="text-xs text-gray-400">kredi</div>
            </div>
          </div>
          {profile?.bio && <p className="text-sm text-gray-500 mb-4">{profile.bio}</p>}
          <div className="flex gap-3">
            {profile?.offers?.length > 0 && (
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-2">Sunuyor</p>
                <div className="flex flex-wrap gap-1">
                  {profile.offers.map((o: string) => <span key={o} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">{o}</span>)}
                </div>
              </div>
            )}
            {profile?.wants?.length > 0 && (
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-2">İstiyor</p>
                <div className="flex flex-wrap gap-1">
                  {profile.wants.map((w: string) => <span key={w} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{w}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">İlanlarım</h3>
            <Link href="/listings/create" className="text-xs text-emerald-600">+ Yeni ilan</Link>
          </div>
          {listings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {listings.map(l => (
                <div key={l.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800 mb-1">{l.title}</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">🎁 {l.offering}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">✨ {l.wanting}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">Henüz ilan yok</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-medium text-gray-800 mb-4">Katıldığım etkinlikler</h3>
          {participations.length > 0 ? (
            <div className="flex flex-col gap-3">
              {participations.map((p: any) => (
                <div key={p.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800">{p.events?.title}</p>
                  {p.events?.event_date && <p className="text-xs text-gray-400 mt-1">📅 {new Date(p.events.event_date).toLocaleDateString('tr-TR')}</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">Henüz etkinliğe katılmadın</p>}
        </div>

      </div>
    </main>
  )
}