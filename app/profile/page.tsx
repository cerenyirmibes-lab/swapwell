'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { emailToPhone, formatPhone } from '../lib/phone'

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
  avatar_url: string | null
  credits: number | null
  offers: string[] | null
  wants: string[] | null
}

type Listing = {
  id: string
  title: string
  offering: string
  wanting: string
}

type Participation = {
  id: string
  events: {
    title: string | null
    event_date: string | null
  } | null
}

type IncomingSwap = {
  id: string
  offering: string
  message: string | null
  sender: { full_name: string | null } | null
  listings: { title: string | null } | null
}

const getPhone = (user: User | null) => {
  if (!user) return ''
  return (
    (user.user_metadata?.phone as string | undefined) ??
    emailToPhone(user.email) ??
    user.phone ??
    ''
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [participations, setParticipations] = useState<Participation[]>([])
  const [incomingSwaps, setIncomingSwaps] = useState<IncomingSwap[]>([])
  const [loading, setLoading] = useState(true)

  const handleSwapResponse = async (swapId: string, status: string) => {
    await supabase.from('swap_requests').update({ status }).eq('id', swapId)
    setIncomingSwaps(prev => prev.filter(s => s.id !== swapId))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!active) return
      if (!user) { router.push('/login'); return }

      setAuthUser(user)

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (!active) return
      if (!p) {
        router.push('/setup')
        return
      }

      setProfile(p)

      const { data: l } = await supabase.from('listings').select('*').eq('user_id', user.id)
      if (!active) return
      setListings(l || [])

      const { data: parts } = await supabase.from('event_participants').select('*, events(*)').eq('user_id', user.id)
      if (!active) return
      setParticipations(parts || [])

      const { data: swaps } = await supabase
        .from('swap_requests')
        .select('*, listings(*), sender:profiles!swap_requests_sender_id_fkey(*)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
      if (!active) return
      setIncomingSwaps(swaps || [])

      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [router])

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
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">Ana sayfa</Link>
          <Link href="/setup" className="text-sm text-emerald-600 hover:text-emerald-700">Profili düzenle</Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Çıkış yap
          </button>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-6 flex flex-col gap-6">

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-medium text-emerald-700 overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.full_name || 'Profil fotoğrafı'}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile?.full_name?.split(' ').map(n => n[0]).join('') || '?'
              )}
            </div>
            <div>
              <h2 className="font-medium text-gray-800">{profile?.full_name || 'Isimsiz'}</h2>
              <p className="text-sm text-gray-400">@{profile?.username || 'kullanici'}</p>
              {getPhone(authUser) && (
                <p className="text-xs text-gray-400 mt-1">{formatPhone(getPhone(authUser))}</p>
              )}
            </div>
            <div className="ml-auto text-center">
              <div className="text-2xl font-medium text-emerald-600">{profile?.credits || 0}</div>
              <div className="text-xs text-gray-400">kredi</div>
            </div>
          </div>
          {profile?.bio && <p className="text-sm text-gray-500 mb-4">{profile.bio}</p>}
          <div className="flex gap-3">
            {(profile?.offers?.length ?? 0) > 0 && (
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-2">Sunuyor</p>
                <div className="flex flex-wrap gap-1">
                  {profile?.offers?.map(o => <span key={o} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">{o}</span>)}
                </div>
              </div>
            )}
            {(profile?.wants?.length ?? 0) > 0 && (
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-2">Istiyor</p>
                <div className="flex flex-wrap gap-1">
                  {profile?.wants?.map(w => <span key={w} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{w}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Ilanlarim</h3>
            <Link href="/listings/create" className="text-xs text-emerald-600">+ Yeni ilan</Link>
          </div>
          {listings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {listings.map(l => (
                <div key={l.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800 mb-1">{l.title}</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Sunuyor: {l.offering}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Istiyor: {l.wanting}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">Henuz ilan yok</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-medium text-gray-800 mb-4">Katildigim etkinlikler</h3>
          {participations.length > 0 ? (
            <div className="flex flex-col gap-3">
              {participations.map(p => (
                <div key={p.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800">{p.events?.title}</p>
                  {p.events?.event_date && <p className="text-xs text-gray-400 mt-1">{new Date(p.events.event_date).toLocaleDateString('tr-TR')}</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">Henuz etkinlige katilmadin</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-medium text-gray-800 mb-4">Gelen takas teklifleri</h3>
          {incomingSwaps.length > 0 ? (
            <div className="flex flex-col gap-3">
              {incomingSwaps.map(swap => (
                <div key={swap.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {swap.sender?.full_name || 'Bilinmeyen'} - {swap.listings?.title}
                  </p>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Teklif: {swap.offering}</span>
                  </div>
                  {swap.message && <p className="text-xs text-gray-400 mb-3">{swap.message}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSwapResponse(swap.id, 'accepted')}
                      className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Kabul et
                    </button>
                    <button
                      onClick={() => handleSwapResponse(swap.id, 'rejected')}
                      className="text-xs border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-4">Henuz gelen teklif yok</p>}
        </div>

      </div>
    </main>
  )
}