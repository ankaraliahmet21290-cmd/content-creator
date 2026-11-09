# 🎬 Klaket Studio – Kullanım Kılavuzu

**Klaket Studio**, modern yapay zekâ teknolojilerini (Gemini 2.5/3.6 Flash, Flux AI Görsel Motoru ve 24kHz Gemini Studio TTS) 24 adımlı endüstriyel film üretim standartlarıyla birleştiren profesyonel bir **Video ve Film Üretim Platformu**dur.

Bu kılavuz, uygulamanın kurulumundan başlayarak sinema filmi, belgesel, YouTube videosu ve ticari reklam filmlerinin adım adım nasıl üretileceğini açıklar.

---

## 📌 İçindekiler
1. [Hızlı Başlangıç & Kurulum](#1-hızlı-başlangıç--kurulum)
2. [Arayüz Genel Bakış](#2-arayüz-genel-bakış)
3. [Adım Adım Video Üretimi](#3-adım-adım-video-üretimi)
   - [Yöntem A: Storyboard (Sahne Tasarım) Masası ile Kontrollü Üretim (Önerilen)](#yöntem-a-storyboard-sahne-tasarım-masası-ile-kontrollü-üretim-önerilen)
   - [Yöntem B: Hızlı Doğrudan Render](#yöntem-b-hızlı-doğrudan-render)
4. [Öne Çıkan Gelişmiş Özellikler](#4-öne-çıkan-gelişmiş-özellikler)
   - [🎭 3. & 8. Adım: Tutarlı Karakter Tasarımı (Consistent Character)](#-3--8-adım-tutarlı-karakter-tasarımı-consistent-character)
   - [🎵 14. Adım: Fon Müziği Seçimi ve Akıllı Ducking (Müzik Kısma)](#-14-adım-fon-müziği-seçimi-ve-akıllı-ducking-müzik-kısma)
   - [🎙️ 12. Adım: Çift Seslendirme & Çoklu Oyuncu Kadrosu](#️-12-adım-çift-seslendirme--çoklu-oyuncu-kadrosu)
5. [Storyboard Masasında Sahne Düzenleme](#5-storyboard-masasında-sahne-düzenleme)
6. [Canlı Önizleme (Player) ve 1080p Video İndirme](#6-canlı-önizleme-player-ve-1080p-video-indirme)
7. [Hazır İlham Şablonları](#7-hazır-ilham-şablonları)
8. [Sıkça Sorulan Sorular & Sorun Giderme](#8-sıkça-sorulan-sorular--sorun-giderme)

---

## 1. Hızlı Başlangıç & Kurulum

### Gereksinimler
- **Node.js** (v18.0 veya üzeri)
- **Google Gemini API Anahtarı** (Ücretsiz almak için: [Google AI Studio](https://aistudio.google.com/))

### Adım 1: Proje Bağımlılıklarını Kurun
Terminal veya PowerShell üzerinde proje dizinine gidin:
```bash
cd c:\development\dev\imp\new\content-creator
npm install
```

### Adım 2: Gemini API Anahtarınızı Ekleyin
Proje kök dizininde yer alan `.env.local` dosyasını açın (yoksa oluşturun) ve anahtarınızı ekleyin:
```env
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere...
```
*(Not: Dilerseniz API anahtarını uygulama açıldıktan sonra sağ üstteki **⚙️ Sağlayıcı Ayarları** butonuna tıklayarak tarayıcı üzerinden de girebilirsiniz).*

### Adım 3: Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Terminalde belirtilen yerel adresi tarayıcınızda açın:
👉 **`http://localhost:3000`** *(veya port meşgulse `http://localhost:3001`)*

---

## 2. Arayüz Genel Bakış

Uygulama 3 temel panelden oluşur:
1. **Sol Panel (Brief & Yapım Masası):** Film fikri, türü, hazır senaryo metni, tutarlı karakter seçimi, seslendirme ve fon müziği ayarlarının yapıldığı form.
2. **Orta Panel (Sahne / Oynatıcı / Storyboard):**
   - **Storyboard Masası:** Yapay zekanın yazdığı sahnelerin görsel, replik ve sürelerinin tek tek düzenlendiği alan.
   - **Sinematik Video Oynatıcı:** Canlı Ken Burns kamera hareketleri, altyazılar, geçiş sesleri ve fon müziği ile videoyu izleyebileceğiniz oynatıcı.
3. **Sağ Panel (Geçmiş & Kalite Kontrol - QC):** Daha önce üretilen videolar, QC kontrol listesi ve render logları.

---

## 3. Adım Adım Video Üretimi

### Yöntem A: Storyboard (Sahne Tasarım) Masası ile Kontrollü Üretim (Önerilen)

En yüksek kalitede film ve reklam üretmek için önerilen akış şudur:

1. **Yapım Türünü Seçin:**
   - **🎬 Sinema Filmi & Fragman:** 21:9 Cinemascope Hollywood geniş ekran formatı.
   - **🎙️ Sinematik Belgesel:** 16:9 BBC Earth / National Geographic araştırma formatı.
   - **🔴 YouTube Videosu:** 16:9 ilk 5 saniye kancalı retention formatı.
   - **📢 Ticari Reklam & Tanıtım:** 16:9 veya 9:16 yüksek dönüşümlü reklam formatı.
   - **📱 Shorts & Reels:** 9:16 dikey mobil video.
2. **Başlık ve Konuyu Girin:**
   - Örneğin: *"2088: Son Şafak"* veya *"Lüks Rezidans Tanıtımı"*.
3. **Senaryo veya Yönetmen Talimatını Yazın:**
   - Kendi yazdığınız sahne sahne diyalogları doğrudan bu alana yapıştırabilirsiniz. *(Yapay zekâ verdiğiniz diyalogları ve sahne sırasını birebir korur).*
   - Ya da sadece konuyu özetleyip senaryoyu yapay zekanın yazmasını sağlayabilirsiniz.
4. **Karakter ve Müzik Ayarlarını Belirleyin:**
   - İhtiyaca göre **Tutarlı Karakter** ve **Fon Müziği** seçin.
5. **🎨 "1. Sahneleri Tasarla (Storyboard Modu)" Butonuna Tıklayın:**
   - Gemini senaryoyu sahnelerine ayırır, her sahneye süre, replik ve görsel yönerge yazar.
   - Karşınıza **Storyboard Sahne Tasarım Masası** açılır.
6. **Sahneleri İnceleyin ve Düzenleyin:**
   - İstediğiniz sahnenin görselini **"🤖 AI ile Üret"** butonuyla oluşturun veya kütüphaneden seçin.
   - Replikleri veya alt yazıları dilediğiniz gibi güncelleyin.
7. **🚀 "Montajı Onayla ve 1080p Render Et" Butonuna Tıklayın:**
   - Sistem stüdyo kalitesindeki seslendirmeleri bağlar, çift kanallı müzik miksajını yapar ve videoyu hazır hale getirir.

---

### Yöntem B: Hızlı Doğrudan Render
Vaktiniz kısıtlıysa ve doğrudan video çıktısı almak istiyorsanız:
- Formu doldurduktan sonra doğrudan alttaki **"⚡ Hızlı Üret (Doğrudan Render Et)"** butonuna tıklayın.
- Sistem senaryo yazımı, görsel sentezi, seslendirme ve montaj adımlarını tek seferde tamamlar ve oynatıcıda videoyu başlatır.

---

## 4. Öne Çıkan Gelişmiş Özellikler

### 🎭 3. & 8. Adım: Tutarlı Karakter Tasarımı (Consistent Character)
Sahneler arasında karakterin yüzünün veya kıyafetinin değişmesini engellemek için geliştirilmiştir:
- Formdaki **"🎭 3. & 8. Adım: Tutarlı Karakter Tasarımı"** kutucuğunu işaretleyin.
- **Hızlı Şablonlar:**
  - *Dedektif Kaan* (Siberpunk / Polisiye)
  - *Dr. Aylin Demir* (Baş Bilim İnsanı)
  - *Mert Aksoy* (Genç Girişimci)
  - *Selim Usta* (Bilge Rehber)
  - *Leyla Kaya* (Gizemli Ajan)
- İsterseniz kendi özel karakterinizin adını, yaşını, fiziksel özelliklerini (saç, göz, sakal) ve kostümünü yazabilirsiniz.
- **Sonuç:** Yapay zekâ, tüm sahnelerde bu karakterin görünümünü latent tohum (seed) düzeyinde sabit tutar.

---

### 🎵 14. Adım: Fon Müziği Seçimi ve Akıllı Ducking (Müzik Kısma)
Videolarınızda profesyonel sinema ve televizyon ses kurgusu uygulanır:
- **Müzik Seçenekleri:**
  - 🎬 **Epik Sinema & Orkestral Fragman:** Dramatik yaylılar, derin gerilim ve sub-bass vuruşları.
  - 🎧 **Modern Upbeat & Lo-Fi Beats:** YouTube, belgesel ve vloglar için sürükleyici ritim.
  - 💼 **Dinamik Satış & Kurumsal Fon:** Enerjik reklam, ürün tanıtımı ve lansmanlar.
  - 🔇 **Müziksiz:** Sadece diyalog ve saf konuşma sesi.
- **Akıllı Ducking Teknolojisi:**
  - Karakter konuştuğu anda arka plan müziği otomatik olarak **%12 seviyesine** çekilir.
  - Cümle bittiğinde veya sahne geçişinde müzik tekrar **%28 seviyesine** yükselerek atmosferi canlı tutar.

---

### 🎙️ 12. Adım: Çift Seslendirme & Çoklu Oyuncu Kadrosu
- **Sinema Modu:** Sahnelerde hem kadın hem erkek karakterler diyalog kurabilir. Gemini diyaloğa göre uygun kadın (*Kore*) veya erkek (*Puck*) stüdyo sesini sahneye otomatik atar.
- **Reklam & YouTube Modu:** Dilediğiniz zaman tek tıkla Tok Erkek Sesi (*Puck*) veya Doğal Kadın Anlatıcı Sesi (*Kore*) arasında geçiş yapabilirsiniz.

---

### 👄 13. Adım: Dudak Senkronizasyonu (Lip-Sync AI) & Konuşan Karakterler
- **Sesle Uyumlu Dudak Hareketi:** Karakter fotoğrafları, Gemini 24kHz stüdyo seslendirmesinin ses dalga boyuna (amplitude / viseme) göre dinamik olarak ağız, çene ve kafa salınımı hareketlerine kavuşur.
- **Nasıl Kullanılır?**
  1. Sol panelden **"👄 13. Adım: Dudak Senkronizasyonunu Aç"** kutucuğunu işaretleyin veya doğrudan **Storyboard Masası**'na geçin.
  2. Sahne kartındaki **"👄 Dudak"** butonuna tıklayın (veya üst bardaki **"👄 Tümünü Dudak Senkronla"** ile toplu üretin).
  3. Sistem saniyeler içinde ses ile dudakları eşleştirerek konuşan bir video klibi (`.webm`/`.mp4`) oluşturur.
  4. Video oynatıcıda karakterin dudakları sesle birebir senkronize oynar ve **"⬇ 1080p Video İndir"** butonuna bastığınızda final videoya entegre edilir.
- **SadTalker / LivePortrait Desteği:** İsteğe bağlı olarak `/api/lipsync` üzerinden bulut AI modelleriyle de çalışabilir; API anahtarı yoksa yerel kesintisiz ses analizör motoru otomatik devreye girer.

---

## 5. Storyboard Masasında Sahne Düzenleme

Storyboard masası açıldığında yapabileceğiniz işlemler:
- **Görsel Değiştirme:**
  - `🤖 AI ile Üret`: Sahnenin kamera yönergesinden Flux AI ile sıfırdan fotogerçekçi film karesi üretir.
  - `🖼️ Arşivden Seç`: 100+ seçkin sinematik fotoğraf arasından seçim yapmanızı sağlar.
  - `Tüm Kareleri AI ile Üret`: Tek tıkla tüm sahnelerin görsellerini sırayla yapay zekaya ürettirir.
- **Replik ve Alt Yazı:** Kartın üzerindeki metin kutusuna tıklayarak karakterin konuşmasını doğrudan düzenleyebilirsiniz.
- **Süre Ayarı:** Sahnenin kaç saniye ekranda kalacağını (sn) değiştirebilirsiniz.
- **Sahne Sıralaması:** `⬅` ve `➡` butonlarıyla sahnelerin sırasını değiştirebilir veya `➕ Yeni Sahne Ekle` butonuyla araya sahne ekleyebilirsiniz.

---

## 6. Canlı Önizleme (Player) ve 1080p Video İndirme

Video hazır olduğunda orta ekranda gelişmiş sinematik oynatıcı açılır:
- **Oynat / Duraklat:** Boşluk (Space) tuşu veya `▶ Oynat` butonu ile çalışır.
- **Ses Kontrolleri:**
  - `🎙️ TTS Açık/Kapalı`: Konuşma sesini açıp kapatır.
  - `🎵 Müzik Açık/Kapalı`: Fon müziğini açıp kapatır.
- **1080p Video İndirme:**
  - Oynatıcının sağ üst köşesindeki **"⬇ 1080p Video İndir"** butonuna tıklayın.
  - Tarayıcınız sahneleri, altyazıları, Ken Burns zoom efektlerini, Gemini seslendirmesini ve arka plan müziğini birleştirerek yüksek kaliteli bir `.webm` / `.mp4` video dosyası indirir.
- **JSON Projesi İndirme:**
  - **"📄 Senaryo & JSON İndir"** butonuyla tüm sahne metinlerini, promptları ve zaman çizelgesini dışa aktarabilirsiniz.

---

## 7. Hazır İlham Şablonları

Formun üst kısmında yer alan hazır butonlarla tek tıkla örnek projeler yükleyebilirsiniz:
1. **🎬 Sinema: 2088 Son Şafak** *(Siberpunk Dedektif Kaan fragmanı - 21:9 Cinemascope)*
2. **🎙️ Belgesel: Piramitlerin Gizemi** *(Gize Platosu arkeoloji belgeseli - 16:9)*
3. **🌊 Belgesel: Okyanusun Derinlikleri** *(Mariana Çukuru doğa belgeseli)*
4. **🔴 YouTube: Yapay Zekâ Devrimi** *(Retention odaklı YouTube tech videosu)*
5. **🍿 Kısa Film: Zamanın Ötesi** *(Bağımsız gizem & gerilim filmi)*
6. **🏢 Gayrimenkul / Lüks Emlak** *(Korkmaz Gayrimenkul lüks rezidans tanıtımı - 9:16 Reels)*
7. **🚀 SaaS & Yazılım Reklamı** *(Dinamik satış fon müzikli kurumsal yazılım reklamı)*
8. **☕ Kafe & Restoran Lansmanı** *(Artisan soğuk demleme kahve tanıtımı)*

---

## 8. Sıkça Sorulan Sorular & Sorun Giderme

#### S1: "GEMINI_API_KEY tanımlı değil" uyarısı alıyorum, ne yapmalıyım?
* Proje kök dizinindeki `.env.local` dosyasına geçerli anahtarınızı ekleyin veya uygulamanın sağ üstündeki **"⚙️ Sağlayıcı Ayarları"** butonuna basarak API anahtarınızı yapıştırıp kaydedin.

#### S2: Yapay zekâ görsel üretirken zaman aşımına uğrarsa ne olur?
* Uygulama akıllı bir fallback (yedek) mekanizmasına sahiptir. Eğer harici görsel üretim servisi kotaya takılırsa veya ağ yavaşsa, stüdyonun yerel yüksek çözünürlüklü HD sinema ve belgesel arşivinden sahneye en uygun kare otomatik olarak eşleştirilir; üretim asla yarıda kalmaz.

#### S3: Kendi hazırladığım senaryoyu nasıl kullanabilirim?
* Sol paneldeki **"✨ Film Hikâyesi, Hazır Senaryo Metni"** kutusuna senaryonuzu veya diyaloglarınızı doğrudan yapıştırın. Gemini verdiğiniz diyalogları ve karakter isimlerini birebir sahne repliklerine dönüştürür.

#### S4: Arka plan müziğini tamamen kapatabilir miyim?
* Evet, formdaki **"🎵 14. Adım: Sinematik Fon Müziği"** bölümünden **"🔇 Müziksiz"** seçeneğini seçebilir veya oynatıcı üzerindeki **"🎵 Müzik"** butonuna basarak fon müziğini sessize alabilirsiniz.

---

🎬 *İyi üretimler! Klaket Studio ile hayalinizdeki filmleri ve reklamları dakikalar içinde gerçeğe dönüştürün.*
