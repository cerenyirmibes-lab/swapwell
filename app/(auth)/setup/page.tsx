'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const categories = [
  '🏋️ Fitness', '🧘 Yoga', '🏋️ Pilates', '🎾 Tenis', '🏄 Sörf', '⛸️ Buz Pateni',
  '🐴 Binicilik', '🎨 Resim', '🗣️ İngilizce', '🎵 Müzik', '🏊 Yüzme',
  '🚴 Bisiklet', '💃 Dans', '🥊 Boks', '🧗 Tırmanış', '🎭 Tiyatro'
]

const MAX_AVATAR_SIZE = 2 * 1024 * 1024

export default function SetupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [offers, setOffers] = useState<string[]>([])
  const [wants, setWants] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [hasProfile, setHasProfile] = useState(false)
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        setHasProfile(true)
        setFullName(profile.full_name || '')
        setUsername(profile.username || '')
        setBio(profile.bio || '')
        setOffers(profile.offers || [])
        setWants(profile.wants || [])
        setExistingAvatarUrl(profile.avatar_url || null)
        setAvatarPreview(profile.avatar_url || null)
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) setList(list.filter(i => i !== item))
    else setList([...list, item])
  }

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Sadece resim dosyası yükleyebilirsin.')
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setMessage('Profil fotoğrafı en fazla 2 MB olabilir.')
      return
    }

    setMessage('')
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (saving) return

    setSaving(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      let avatarUrl = existingAvatarUrl

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filePath = `${user.id}/avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            upsert: true,
            cacheControl: '3600',
            contentType: avatarFile.type,
          })

        if (uploadError) {
          setMessage(`Fotoğraf yüklenemedi: ${uploadError.message}`)
          return
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`
      }

      const profileData: Record<string, unknown> = {
        id: user.id,
        full_name: fullName.trim(),
        username: username.replace(/^@/, '').trim(),
        bio: bio.trim(),
        offers,
        wants,
        avatar_url: avatarUrl,
      }

      if (!hasProfile) profileData.credits = 3

      const { error } = await supabase.from('profiles').upsert(profileData)

      if (error) {
        if (error.code === '23505') {
          setMessage('Bu kullanıcı adı zaten alınmış. Başka bir kullanıcı adı dene.')
        } else {
          setMessage(error.message)
        }
        return
      }

      router.push('/profile')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Profil kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-gray-400">Yükleniyor...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-emerald-50 py-10 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-medium text-emerald-800 mb-1">
          {hasProfile ? 'Profilini düzenle' : 'Profilini oluştur'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {hasProfile
            ? 'Bilgilerini güncelleyip kaydedebilirsin'
            : 'Başlamak için birkaç bilgi ve bir profil fotoğrafı yeter'}
        </p>

        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-emerald-200 hover:border-emerald-400 transition-colors"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-emerald-400">📷</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => handleAvatarChange(e.target.files?.[0])}
          />
          <p className="text-xs text-gray-400 mt-2">Profil fotoğrafı ekle (en fazla 2 MB)</p>
        </div>

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
              type="button"
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
              type="button"
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
          type="button"
          onClick={handleSave}
          disabled={saving || !fullName.trim() || !username.trim()}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Kaydediliyor...' : hasProfile ? 'Değişiklikleri kaydet' : 'Devam et →'}
        </button>

        {hasProfile && (
          <Link
            href="/profile"
            className="block text-center text-sm text-gray-500 mt-4 hover:text-emerald-600"
          >
            Profilime dön
          </Link>
        )}
      </div>
    </main>
  )
}
