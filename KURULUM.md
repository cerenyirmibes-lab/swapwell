# SwapWell Kurulum ve Telefonla Üyelik (SMS'siz / Ücretsiz)

Proje klasörü:

```bash
cd ~/Desktop/swapwell/swapwell
```

Bu sürümde üyelik **telefon numarası + şifre** ile yapılır. SMS gönderilmez, Twilio gerekmez, ek ücret yoktur.

Nasıl çalışıyor? Supabase'in email alanı arka planda `905xxxxxxxxx@phone.example.com` şeklinde doldurulur. `example.com` hiçbir zaman gerçek bir posta kutusuna teslim edilmez ve IANA tarafından bu amaçla ayrılmıştır. Kullanıcı sadece telefon numarasını ve şifresini görür.

## 1. Supabase'de email onayını kapat (tek zorunlu ayar)

1. https://supabase.com/dashboard → projeni aç
2. **Authentication** → **Providers** (bazı sürümlerde **Sign In / Providers**) → **Email**
3. **Confirm email** seçeneğini **KAPAT**
4. **Save**

Neden? Email onayı açıkken Supabase kayıt sonrası onay maili göndermeye çalışır, bu da hem 2/saat limitine takılır hem de oturum açılmaz. Kapattığında kayıt anında giriş yapılır.

> Bu ayar ücretsizdir ve SMS ile ilgisi yoktur.

### Daha önce email onayı açıkken test kaydı yaptıysan

**Authentication** → **Users** listesinde onaylanmamış (`unconfirmed`) kullanıcılar birikir. Bunları **Delete** ile sil. Aksi halde aynı numarayla kayıt olurken “zaten hesap var” uyarısı alırsın.

## 2. Profil ve fotoğraf için SQL

1. Supabase Dashboard → **SQL Editor** → **New query**
2. `supabase/schema.sql` dosyasının tamamını kopyala, yapıştır
3. **Run**

Bu SQL:

- `profiles` tablosunu ve eksik kolonlarını oluşturur
- Profil okuma/yazma için RLS izinlerini ekler
- `avatars` isimli public storage bucket'ını oluşturur
- Kullanıcıların sadece kendi profil fotoğrafını yüklemesini sağlar

> `avatars` bucket'ı olmadığı için profil fotoğrafı yükleme çalışmıyordu. Bu adım onu düzeltir.

## 3. Uygulamayı çalıştır

```bash
cd ~/Desktop/swapwell/swapwell
npm run dev
```

Tarayıcıda aç:

```text
http://localhost:3000/login
```

## 4. Yeni üyelik akışı

1. `/login` sayfasında **Telefon** sekmesi seçili gelir.
2. **Hesabın yok mu? Telefonla kayıt ol** butonuna bas.
3. Telefon numarasını `5xx xxx xx xx` formatında gir.
4. En az 6 karakterli bir şifre belirle.
5. **Hesabı oluştur** → doğrudan `/setup` sayfasına gider.
6. Ad soyad, kullanıcı adı, biyografi, sunduğu/istediği kategoriler ve profil fotoğrafını yükle.
7. **Devam et** → `/profile` sayfasına gider.
8. **Çıkış yap** butonu ile oturum kapatılır.

Tekrar giriş: aynı telefon numarası + şifre.

Email ile kayıt olmuş eski kullanıcılar **E-posta** sekmesinden giriş yapmaya devam eder.

## 5. Değişen dosyalar

| Dosya | Değişiklik |
|---|---|
| `app/(auth)/login/page.tsx` | Telefon + şifre ile kayıt/giriş, email ile giriş, Türkçe hata mesajları, profil varsa `/profile` yoksa `/setup` yönlendirmesi |
| `app/(auth)/setup/page.tsx` | Profil bilgileri + fotoğraf yükleme, max 2 MB, telefon gösterimi, mevcut profili önceden doldurma |
| `app/profile/page.tsx` | Profil fotoğrafı, telefon numarası, **Profili düzenle** ve **Çıkış yap** |
| `app/lib/phone.ts` | Telefon normalize etme, telefon → email eşleme, telefon biçimlendirme |
| `supabase/schema.sql` | Profil tablosu, RLS politikaları, `avatars` bucket'ı ve storage izinleri |
| `KURULUM.md` | Bu dosya |

## 6. Yayına alma

```bash
cd ~/Desktop/swapwell/swapwell
git add 'app/(auth)/login/page.tsx' 'app/(auth)/setup/page.tsx' app/profile/page.tsx app/lib/phone.ts supabase/schema.sql KURULUM.md
git commit -m "feat: phone auth without sms, profile setup and avatar upload"
git push
```

Vercel `main` branch'ine push edince otomatik deploy eder. Yeni environment variable gerekmiyor.

## 7. Sorun giderme

- **“Supabase email gönderim limiti doldu”**: Authentication → Providers → Email → **Confirm email** hâlâ açık. Kapat ve tekrar dene.
- **“Bu hesap henüz onaylanmamış”**: Eski test kaydı. Authentication → Users → kullanıcıyı sil, tekrar kayıt ol.
- **“Bu telefon numarası ile zaten bir hesap var”**: Numara kayıtlı. Şifreni girip giriş yap. Şifreyi hatırlamıyorsan Authentication → Users'tan kullanıcıyı silip yeniden kayıt ol.
- **“Failed to fetch”**: Tarayıcı Supabase'e ulaşamıyor. Reklam engelleyici, VPN, DNS veya ağ engeli olabilir. Gizli sekme, farklı ağ ve eklentiler kapalı şekilde dene.
- **Fotoğraf yüklenemiyor**: `supabase/schema.sql` çalıştırıldı mı ve `avatars` bucket'ı public mi kontrol et. Dosya en fazla 2 MB olmalı.
- **Profil kaydedilmiyor**: SQL Editor'de RLS politikalarının oluştuğunu kontrol et.

## Notlar / sınırlamalar

- Telefon numarası **doğrulanmaz** (SMS gitmediği için). Numaranın gerçekten kullanıcıya ait olduğunu kanıtlamaz; sadece giriş kimliği olarak kullanılır.
- Şifre sıfırlama akışı yoktur (SMS/email olmadan kod gönderilemez). Şifresini unutan kullanıcıyı panelden silip yeniden kayıt ettirebilirsin.
- İleride SMS doğrulaması eklemek istersen Supabase Phone + Twilio kurulumu gerekir; kod tarafında `verifyOtp` akışını tekrar eklemek yeterli olur.
