#!/usr/bin/env node
/**
 * Supabase'in gerçekten mail gönderip göndermediğini test eder.
 *
 * Kullanım:
 *   npm run mail:test -- senin@email.com
 *
 * Bu komut Supabase Auth üzerinden 6 haneli bir kod isteği atar.
 * Dönen cevap "ok" ise SMTP çalışıyor ve mail yola çıktı demektir.
 * Hata varsa Supabase'in döndürdüğü kodu gösterir (ör. over_email_send_rate_limit).
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const loadEnv = () => {
  const env = { ...process.env }

  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!match) continue
      const [, key, value] = match
      if (!env[key]) env[key] = value.replace(/^['"]|['"]$/g, '')
    }
  } catch {
    // .env.local yoksa process.env ile devam et
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY bulunamadı (.env.local).')
    process.exit(1)
  }

  return { url: url.replace(/\/$/, ''), key }
}

const email = (process.argv[2] || '').trim().toLowerCase()

if (!email || !email.includes('@')) {
  console.error('Kullanım: npm run mail:test -- senin@email.com')
  process.exit(1)
}

const { url, key } = loadEnv()

console.log(`→ ${email} adresine doğrulama kodu isteniyor...`)

const startedAt = Date.now()

const response = await fetch(`${url}/auth/v1/otp`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify({
    email,
    create_user: true,
    gotrue_meta_security: {},
  }),
})

const elapsed = Date.now() - startedAt
const text = await response.text()

let body
try {
  body = text ? JSON.parse(text) : {}
} catch {
  body = { raw: text }
}

if (response.ok) {
  console.log(`✅ İstek kabul edildi (${response.status}, ${elapsed} ms).`)
  console.log('   Gelen kutunu ve spam klasörünü kontrol et. Kod mailde görünmüyorsa')
  console.log('   Supabase → Authentication → Emails → Magic Link şablonunda {{ .Token }} yok.')
  process.exit(0)
}

console.error(`❌ Supabase isteği reddetti (${response.status}, ${elapsed} ms).`)
console.error(`   code: ${body.code ?? '-'}`)
console.error(`   msg : ${body.msg ?? body.message ?? '-'}`)

const message = String(body.msg ?? body.message ?? '').toLowerCase()
const rawCode = String(body.code ?? '')

const hints = {
  over_email_send_rate_limit:
    'Limit doldu. Authentication → Rate Limits bölümünde "Emails per hour" değerini artır veya bir sonraki saati bekle.',
  over_request_rate_limit:
    'IP/istek limiti doldu. Authentication → Rate Limits → "Sign ups / sign ins" değerini kontrol et.',
  otp_disabled:
    'Email ile kod girişi kapalı. Authentication → Sign In / Providers → Email bölümünü kontrol et.',
  email_address_invalid:
    'Bu email adresi Supabase tarafından geçersiz sayıldı. Gerçek bir adres dene.',
  email_provider_disabled:
    'Email sağlayıcısı kapalı. Authentication → Sign In / Providers → Email açık olmalı.',
}

const rateLimited =
  response.status === 429 ||
  rawCode === 'over_email_send_rate_limit' ||
  message.includes('rate limit')

if (rateLimited) {
  console.error('\n💡 Supabase varsayılan servisi saatte ~2 mail gönderir.')
  console.error('   Kalıcı çözüm: Authentication → SMTP Settings → custom SMTP (Brevo/Gmail) bağla,')
  console.error('   sonra Authentication → Rate Limits → "Emails per hour" değerini 30 yap.')
} else if (hints[rawCode]) {
  console.error(`\n💡 ${hints[rawCode]}`)
} else if (message.includes('signups not allowed')) {
  console.error('\n💡 Bu email ile yeni kayıt kapalı görünüyor. Authentication → Providers ayarlarını kontrol et.')
}

if (process.env.DEBUG) {
  console.error('\nHam cevap:', JSON.stringify(body, null, 2))
}

process.exit(1)
