# SwapWell Kurulum: Email Doğrulama Kodlu Üyelik ve Şifre Sıfırlama

Proje klasörü:

```bash
cd ~/Desktop/swapwell/swapwell
```

## Akış

**Kayıt**

1. Email adresi yazılır
2. Email adresine **6 haneli doğrulama kodu** gelir
3. Kod girilir, email doğrulanır
4. Şifre belirlenir
5. Profil bilgileri + fotoğraf yüklenir
6. Giriş / çıkış email + şifre ile yapılır

**Şifre sıfırlama**

1. Giriş sayfasında **Şifremi unuttum**
2. **E-posta** veya **Telefon** seçilir
3. Seçilen yere 6 haneli kod gider
4. Kod doğrulanır
5. Yeni şifre belirlenir ve giriş yapılır

## 1. Supabase URL ayarları (zorunlu)

Supabase Dashboard → **Authentication** → **URL Configuration**:

| Alan | Değer |
|---|---|
| **Site URL** | `https://swapwell.vercel.app` |
| **Redirect URLs** | `https://swapwell.vercel.app/**` |
| | `http://localhost:3000/**` |

## 2. Email şablonuna doğrulama kodunu ekle (zorunlu)

Varsayılan Supabase maili sadece bağlantı içerir, **kod içermez**. Kodun mailde görünmesi için:

1. Supabase → **Authentication** → **Emails**
2. **Magic Link** şablonunu aç
3. İçeriği şu şekilde değiştir:

```html
<h2>SwapWell doğrulama kodun</h2>
<p>6 haneli doğrulama kodun:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">{{ .Token }}</p>
<p>Kod 1 saat geçerlidir.</p>
<p>Dilersen bağlantıya tıklayarak da doğrulayabilirsin:</p>
<p><a href="{{ .ConfirmationURL }}">Email adresimi doğrula</a></p>
```

4. **Save**

> `{{ .Token }}` kod, `{{ .ConfirmationURL }}` bağlantıdır. İkisini birlikte kullanabilirsin. Sadece kodu göndermek istersen bağlantı satırını silebilirsin.

Bu şablon hem kayıt kodunu hem de email ile şifre sıfırlama kodunu gönderir.

## 3. Email gönderimi için SMTP (zorunlu)

Supabase'in varsayılan mail servisi **test içindir**: saatte yaklaşık 2 mail gönderir, çoğu zaman spam'e düşer. Gerçek kullanıcılar için kendi SMTP'ni bağla.

Supabase → **Authentication** → **SMTP Settings** (bazı sürümlerde **Project Settings → Authentication → SMTP**).

### Ücretsiz seçenek A: Gmail SMTP (domain gerekmez, en kolay)

1. Google hesabında **2 Adımlı Doğrulama** açık olsun
2. https://myaccount.google.com/apppasswords → **Uygulama şifresi** oluştur (16 karakter)
3. Supabase'e gir:

| Alan | Değer |
|---|---|
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | Gmail adresin |
| Password | 16 haneli uygulama şifresi |
| Sender email | Aynı Gmail adresi |
| Sender name | `SwapWell` |

Günde ~500 mail. Küçük proje için yeterli.

### Ücretsiz seçenek B: Brevo (günde 300 mail, domain gerekmez)

1. https://www.brevo.com → ücretsiz hesap
2. **SMTP & API → SMTP** bölümünden SMTP anahtarını al
3. Gönderici email adresini doğrula
4. Supabase'e gir:

| Alan | Değer |
|---|---|
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | Brevo hesap emailin |
| Password | Brevo SMTP anahtarı |
| Sender email | Doğruladığın adres |
| Sender name | `SwapWell` |

### Ücretsiz seçenek C: Resend (ayda 3.000 mail, domain gerekir)

| Alan | Değer |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API key |
| Sender email | `noreply@domainin.com` |
| Sender name | `SwapWell` |

SMTP'yi kaydettikten sonra **Authentication → Rate Limits** bölümünde email limitini artırabilirsin (örn. saatte 30).

## 4. Telefonla kod seçeneği hakkında (önemli)

Şifre sıfırlama ekranındaki **Telefon** seçeneği kodda hazır, ancak çalışması için:

1. Supabase → **Authentication → Providers → Phone** açık olmalı
2. **Twilio** gibi ücretli bir SMS sağlayıcısı bağlı olmalı
3. Kullanıcının hesabında **doğrulanmış bir telefon numarası** bulunmalı

Bu projede kayıt email ile yapıldığı için kullanıcıların telefon kimliği yoktur. Telefonla kod gerçekten gönderilsin istiyorsan:

- Twilio hesabı açıp Supabase'e bilgileri gir (ücretli)
- Kayıt sırasında veya profilde telefon numarası ekleme + SMS doğrulama akışını da kur

Ücretsiz kalmak istiyorsan **E-posta** seçeneğini kullan; aynı işi görür.

## 5. Profil ve fotoğraf için SQL

1. Supabase Dashboard → **SQL Editor** → **New query**
2. `supabase/schema.sql` dosyasının tamamını kopyala, yapıştır
3. **Run**

Bu SQL:

- `profiles` tablosunu ve eksik kolonlarını oluşturur
- Profil okuma/yazma için RLS izinlerini ekler
- `avatars` isimli public storage bucket'ını oluşturur
- Kullanıcıların sadece kendi profil fotoğrafını yüklemesini sağlar

## 6. Uygulamayı çalıştır

```bash
cd ~/Desktop/swapwell/swapwell
npm run dev
```

Tarayıcıda: `http://localhost:3000/login`

## 7. Sayfalar ve görevleri

| Dosya | Görev |
|---|---|
| `app/(auth)/login/page.tsx` | Email + şifre girişi, “Şifremi unuttum”, onay kodu tekrar gönderme |
| `app/(auth)/signup/page.tsx` | Email → 6 haneli kod → şifre oluşturma (3 adım) |
| `app/(auth)/forgot-password/page.tsx` | E-posta veya telefon seçimi → kod → yeni şifre |
| `app/(auth)/set-password/page.tsx` | Maildeki bağlantıya tıklayanlar için şifre oluşturma |
| `app/(auth)/reset-password/page.tsx` | Giriş yapmış kullanıcı için şifre değiştirme |
| `app/(auth)/password-form.tsx` | Şifre formu ve oturum kontrolü |
| `app/(auth)/setup/page.tsx` | Profil bilgileri + fotoğraf yükleme (max 2 MB) |
| `app/profile/page.tsx` | Profil görünümü, düzenleme, şifre değiştirme, çıkış |
| `app/lib/auth-errors.ts` | Türkçe hata mesajları |
| `app/lib/phone.ts` | Telefon numarası normalize/biçimlendirme |
| `supabase/schema.sql` | Profil tablosu, RLS, `avatars` bucket'ı |

## 8. Yayına alma

```bash
cd ~/Desktop/swapwell/swapwell
git add 'app/(auth)' app/profile/page.tsx app/lib supabase/schema.sql KURULUM.md
git commit -m "feat: email otp signup, password reset via email or phone"
git push
```

Vercel `main` branch'ine push edince otomatik deploy eder.

## 9. Sorun giderme

- **Mailde kod yok, sadece link var**: Bölüm 2'yi uygula; Magic Link şablonunda `{{ .Token }}` olmalı.
- **Mail hiç gelmiyor**: SMTP kurulmamış olabilir. Varsayılan servis saatte ~2 mail atar. Bölüm 3'ü uygula, spam klasörüne bak.
- **“Email gönderim limiti doldu”**: Aynı sebep. SMTP kur veya bekle.
- **“Kod geçersiz veya süresi dolmuş”**: Kod tek kullanımlık ve sürelidir. “Kodu tekrar gönder” ile yeni kod al.
- **Telefona kod gelmiyor**: Phone sağlayıcısı + Twilio kurulu değil veya hesapta telefon kimliği yok. Bölüm 4'e bak; email seçeneğini kullan.
- **Bağlantı yanlış sayfaya dönüyor**: Authentication → URL Configuration'daki Redirect URLs listesini kontrol et.
- **Fotoğraf yüklenemiyor**: `supabase/schema.sql` çalıştırıldı mı, `avatars` bucket'ı public mi? Dosya en fazla 2 MB.
- **Profil kaydedilmiyor**: SQL Editor'de RLS politikalarının oluştuğunu kontrol et.
