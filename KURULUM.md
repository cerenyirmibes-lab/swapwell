# SwapWell Kurulum: Email Doğrulamalı Üyelik ve Şifre Sıfırlama

Proje klasörü:

```bash
cd ~/Desktop/swapwell/swapwell
```

Akış:

1. **Kayıt**: Email yazılır → email adresine doğrulama bağlantısı gider
2. **Doğrulama**: Bağlantıya tıklanır → email doğrulanmış olur
3. **Şifre oluşturma**: `/set-password` sayfasında şifre belirlenir
4. **Profil**: Ad, kullanıcı adı, biyografi, fotoğraf → `/setup`
5. **Giriş/çıkış**: Email + şifre ile giriş, profilden çıkış
6. **Şifre sıfırlama**: “Şifremi unuttum” → email bağlantısı → yeni şifre

## 1. Supabase URL ayarları (zorunlu)

Supabase Dashboard → **Authentication** → **URL Configuration**:

| Alan | Değer |
|---|---|
| **Site URL** | `https://swapwell.vercel.app` |
| **Redirect URLs** | `https://swapwell.vercel.app/**` |
| | `http://localhost:3000/**` |

Bu olmadan email bağlantıları yanlış sayfaya döner. Vercel adresin farklıysa ona göre yaz.

## 2. Email gönderimi için SMTP (zorunlu)

Supabase'in varsayılan mail servisi **test içindir**: saatte yaklaşık 2 mail gönderir ve çoğu zaman spam'e düşer. Gerçek kullanıcılar için kendi SMTP'ni bağlamalısın.

Supabase → **Authentication** → **SMTP Settings** (bazı sürümlerde **Project Settings → Authentication → SMTP**).

### Ücretsiz seçenek A: Gmail SMTP (domain gerekmez, en kolay)

1. Google hesabında **2 Adımlı Doğrulama**'yı aç.
2. https://myaccount.google.com/apppasswords → **Uygulama şifresi** oluştur (16 karakter).
3. Supabase SMTP ayarları:

| Alan | Değer |
|---|---|
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | Gmail adresin |
| Password | 16 haneli uygulama şifresi |
| Sender email | Aynı Gmail adresi |
| Sender name | `SwapWell` |

Gmail günde ~500 alıcıyla sınırlıdır, küçük projeler için yeterli.

### Ücretsiz seçenek B: Brevo (günde 300 mail)

1. https://www.brevo.com → ücretsiz hesap
2. **SMTP & API → SMTP** bölümünden SMTP anahtarını al
3. Sender olarak kendi email adresini doğrula
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

1. https://resend.com → hesap aç → API key oluştur
2. Kendi domainini Resend'de doğrula
3. Supabase'e gir:

| Alan | Değer |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API key |
| Sender email | `noreply@domainin.com` |
| Sender name | `SwapWell` |

> Domainin yoksa Gmail veya Brevo kullan.

SMTP'yi kaydettikten sonra **Authentication → Rate Limits** bölümünden email limitini ihtiyacına göre artırabilirsin (örn. saatte 30).

## 3. Profil ve fotoğraf için SQL

1. Supabase Dashboard → **SQL Editor** → **New query**
2. `supabase/schema.sql` dosyasının tamamını kopyala, yapıştır
3. **Run**

Bu SQL:

- `profiles` tablosunu ve eksik kolonlarını oluşturur
- Profil okuma/yazma için RLS izinlerini ekler
- `avatars` isimli public storage bucket'ını oluşturur
- Kullanıcıların sadece kendi profil fotoğrafını yüklemesini sağlar

## 4. Email şablonlarını Türkçeleştir (isteğe bağlı)

Supabase → **Authentication** → **Emails**:

- **Magic Link** → kayıt doğrulama maili
- **Reset Password** → şifre sıfırlama maili

Varsayılan şablonlar çalışır. İstersen metinleri Türkçe yapabilirsin. Bağlantı için `{{ .ConfirmationURL }}` ifadesini silme.

## 5. Uygulamayı çalıştır

```bash
cd ~/Desktop/swapwell/swapwell
npm run dev
```

Tarayıcıda: `http://localhost:3000/login`

## 6. Yeni akış

1. `/login` → **Hesabın yok mu? Kayıt ol**
2. Email adresini yaz → **Doğrulama bağlantısı gönder**
3. Emaildeki bağlantıya tıkla (spam klasörüne de bak)
4. `/set-password` sayfasında şifreni iki kez gir → **Şifreyi oluştur**
5. `/setup` sayfasında ad soyad, kullanıcı adı, biyografi, kategoriler ve profil fotoğrafı
6. **Devam et** → `/profile`
7. **Çıkış yap** ile oturumu kapat
8. Tekrar giriş: email + şifre

### Şifre sıfırlama

1. `/login` → **Şifremi unuttum**
2. Email adresini yaz → **Sıfırlama bağlantısı gönder**
3. Emaildeki bağlantıya tıkla
4. `/reset-password` sayfasında yeni şifreyi belirle
5. Profil sayfasına yönlendirilir

Giriş yapmış kullanıcılar profil sayfasındaki **Şifre değiştir** bağlantısından da şifresini güncelleyebilir.

## 7. Değişen dosyalar

| Dosya | Görev |
|---|---|
| `app/(auth)/login/page.tsx` | Email + şifre girişi, onay maili tekrar gönderme |
| `app/(auth)/signup/page.tsx` | Email yaz → doğrulama bağlantısı gönder |
| `app/(auth)/forgot-password/page.tsx` | Şifre sıfırlama bağlantısı gönder |
| `app/(auth)/set-password/page.tsx` | Doğrulama sonrası şifre oluşturma |
| `app/(auth)/reset-password/page.tsx` | Şifre sıfırlama / şifre değiştirme |
| `app/(auth)/password-form.tsx` | İki sayfanın ortak şifre formu ve oturum kontrolü |
| `app/(auth)/setup/page.tsx` | Profil bilgileri + fotoğraf yükleme (max 2 MB) |
| `app/profile/page.tsx` | Profil görünümü, düzenleme, şifre değiştirme, çıkış |
| `app/lib/auth-errors.ts` | Türkçe hata mesajları |
| `supabase/schema.sql` | Profil tablosu, RLS, `avatars` bucket'ı |
| `KURULUM.md` | Bu dosya |

## 8. Yayına alma

```bash
cd ~/Desktop/swapwell/swapwell
git add 'app/(auth)' app/profile/page.tsx app/lib/auth-errors.ts supabase/schema.sql KURULUM.md
git commit -m "feat: email verification signup, password set and reset"
git push
```

Vercel `main` branch'ine push edince otomatik deploy eder.

## 9. Sorun giderme

- **Mail hiç gelmiyor**: SMTP kurulmamış olabilir. Supabase'in varsayılan servisi saatte ~2 mail atar. Bölüm 2'yi uygula, spam klasörüne bak.
- **“Email gönderim limiti doldu”**: Aynı sebep. SMTP kur veya bir süre bekle.
- **Bağlantıya tıklayınca hata / yanlış sayfa**: Authentication → URL Configuration'daki Redirect URLs listesinde `http://localhost:3000/**` ve canlı adresin `/**` hâli olmalı.
- **“Bağlantı geçersiz veya süresi dolmuş”**: Link tek kullanımlık ve sürelidir. Kayıt sayfasından yeni link iste.
- **“Email adresin henüz onaylanmadı”**: Kayıt mailindeki bağlantıya tıklanmamış. Giriş ekranındaki **Doğrulama bağlantısını tekrar gönder** butonunu kullan.
- **Fotoğraf yüklenemiyor**: `supabase/schema.sql` çalıştırıldı mı, `avatars` bucket'ı public mi kontrol et. Dosya en fazla 2 MB.
- **Profil kaydedilmiyor**: SQL Editor'de RLS politikalarının oluştuğunu kontrol et.

## Notlar

- Email doğrulaması Supabase tarafından yapılır; kod tarafında ek bir doğrulama gerekmez.
- Şifre sıfırlama bağlantısı da tek kullanımlıktır ve belirli bir süre sonra geçersiz olur.
- Telefon numarası artık giriş için kullanılmıyor; profil sayfasında email adresi gösterilir.
