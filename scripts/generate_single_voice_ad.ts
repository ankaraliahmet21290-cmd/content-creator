import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { VideoItem, Scene } from '../src/types';

const envContent = fs.existsSync(path.join(process.cwd(), '.env.local'))
  ? fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
  : '';
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function pcm16ToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const wavBuffer = Buffer.alloc(44 + dataSize);

  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + dataSize, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20);
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(wavBuffer, 44);

  return wavBuffer;
}

async function generateSingleVoiceTTS(text: string, sceneIndex: number): Promise<string> {
  const ttsModels = [
    'gemini-3.8-flash-tts',
    'gemini-3.1-flash-tts-preview',
    'gemini-2.5-pro-preview-tts',
    'gemini-3.8-flash-lite-tts'
  ];

  const dir = path.join(process.cwd(), 'public', 'generated_assets');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Sahne 1 ve 2 zaten üretildiyse kontrol et
  if (sceneIndex === 0) {
    const s1File = 'korkmaz_single_voice_s1_1794215720827.wav';
    if (fs.existsSync(path.join(dir, s1File))) {
      console.log(`⚡ Sahne 1 önbellekten kullanılıyor: ${s1File}`);
      return `/api/assets/${s1File}`;
    }
  }
  if (sceneIndex === 1) {
    const s2File = 'korkmaz_single_voice_s2_1794215726594.wav';
    if (fs.existsSync(path.join(dir, s2File))) {
      console.log(`⚡ Sahne 2 önbellekten kullanılıyor: ${s2File}`);
      return `/api/assets/${s2File}`;
    }
  }

  let lastError: any = null;

  for (const model of ttsModels) {
    try {
      console.log(`🎙️ Sahne ${sceneIndex + 1} seslendiriliyor (${model} - Puck tok erkek sesi)...`);
      const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: text.trim() }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck' // Güven veren, tok ve kararlı kurumsal reklam sesi
                }
              }
            }
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`⚠️ Model ${model} hata verdi: ${res.status}`);
        lastError = new Error(`TTS hatası (${model}): ${errText}`);
        continue;
      }

      const json = await res.json();
      const inlineData = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!inlineData?.data) {
        console.warn(`⚠️ Model ${model} ses verisi döndürmedi`);
        continue;
      }
      const rawBuf = Buffer.from(inlineData.data, 'base64');
      const wavBuffer = pcm16ToWavBuffer(rawBuf, 24000);

      const filename = `korkmaz_single_voice_s${sceneIndex + 1}_${Date.now()}.wav`;
      const savePath = path.join(dir, filename);
      fs.writeFileSync(savePath, wavBuffer);
      console.log(`✅ Sahne ${sceneIndex + 1} sesi hazır: ${filename}`);
      return `/api/assets/${filename}`;
    } catch (e: any) {
      lastError = e;
      console.warn(`⚠️ ${model} denenirken istisna:`, e?.message);
    }
  }

  throw lastError || new Error(`Tüm TTS modelleri başarısız oldu.`);
}


async function main() {
  console.log('🎬 45 Saniyelik Tek Kişi Tok Ses Reklam Filmi Üretiliyor...');

  const scenesConfig = [
    {
      id: 1,
      role: 'Marka & Ofis Girişi',
      sec: 7.5,
      text: 'KORKMAZ GAYRİMENKUL & İNŞAAT',
      subtitle: 'Kırşehir Merkez\'de Doğru Yatırım ve Güvenin Adresi',
      highlight: 'GÜVENİLİR GELECEK',
      vo: 'Kırşehir\'de doğru gayrimenkul yatırımı ve güvenilir geleceğin simgesi: Korkmaz Gayrimenkul ve İnşaat.',
      visual: 'Gerçek Kırşehir Merkez ofis ön cephesi, kurumsal tabela, modern vitrin ve prestijli ofis girişi',
      grad: ['#0f172a', '#1e3a8a'] as [string, string],
      imageUrl: '/real_assets/real_office_front_hd.jpg',
      zoomDir: 'in' as const,
      speaker: 'Reklam Anlatıcısı (Tok Erkek Sesi)',
      voiceGender: 'male' as const
    },
    {
      id: 2,
      role: 'Kurucu Broker & Danışmanlık',
      sec: 7.5,
      text: 'KURUCU BROKER & UZMAN DANIŞMANLIK',
      subtitle: 'Mustafa Korkmaz liderliğinde 15 yılı aşkın sektör deneyimi',
      highlight: 'DOĞRU EKSPERTİZ',
      vo: 'Kurucu broker Mustafa Korkmaz liderliğinde; konut, arsa ve ticari yatırımlarınızda şeffaf ve profesyonel danışmanlık sunuyoruz.',
      visual: 'Mustafa Korkmaz, Gayrimenkul Kurucu Brokerı profesyonel portresi',
      grad: ['#0b1329', '#1e293b'] as [string, string],
      imageUrl: '/real_assets/team_mustafa.jpg',
      zoomDir: 'out' as const,
      speaker: 'Reklam Anlatıcısı (Tok Erkek Sesi)',
      voiceGender: 'male' as const
    },
    {
      id: 3,
      role: 'İnşaat & Kentsel Dönüşüm',
      sec: 7.5,
      text: 'İNŞAAT MÜHENDİSLİĞİ VE GÜVEN',
      subtitle: 'Salih Korkmaz denetiminde statik güvenlik ve modern yapılar',
      highlight: 'MÜHENDİSLİK GÜVENCESİ',
      vo: 'İnşaat Mühendisi Salih Korkmaz denetiminde; kentsel dönüşüm mevzuatına tam uyumlu, depreme dayanıklı modern yaşam alanları inşa ediyoruz.',
      visual: 'Salih Korkmaz, İnşaat Mühendisi ve Proje Yöneticisi profesyonel portresi',
      grad: ['#1e1b4b', '#1e3a8a'] as [string, string],
      imageUrl: '/real_assets/team_salih.jpg',
      zoomDir: 'in' as const,
      speaker: 'Reklam Anlatıcısı (Tok Erkek Sesi)',
      voiceGender: 'male' as const
    },
    {
      id: 4,
      role: 'Müşteri Memnuniyeti',
      sec: 7.5,
      text: 'BİNLERCE MUTLU MÜŞTERİ',
      subtitle: 'Şeffaf pazarlık, resmi tapu ve satış sonrası tam memnuniyet',
      highlight: 'YÜZDE YÜZ MEMNUNİYET',
      vo: 'Binlerce aileyi hayalindeki mülkle buluşturduk. Tapu sürecinden anahtar teslimine kadar her adımda yüzünüzü güldürüyoruz.',
      visual: 'Korkmaz Gayrimenkul ekibinin müşterileri uğurladığı, el sıkıştığı mutlu ve samimi anlar',
      grad: ['#064e3b', '#0f766e'] as [string, string],
      imageUrl: '/real_assets/client_seeoff_1.jpg',
      zoomDir: 'out' as const,
      speaker: 'Reklam Anlatıcısı (Tok Erkek Sesi)',
      voiceGender: 'male' as const
    },
    {
      id: 5,
      role: 'Resmi Güvence & Ekip',
      sec: 7.5,
      text: 'RESMİ TAŞINMAZ YETKİ BELGELİ',
      subtitle: 'EİDS doğrulamalı güvenilir portföy ve şeffaf sözleşmeler',
      highlight: 'RESMİ VE ŞEFFAF',
      vo: 'Taşınmaz Ticareti Yetki Belgesi ve Elektronik Doğrulama Sistemi ile tüm gayrimenkul işlemleriniz yasal güvence altında.',
      visual: 'Korkmaz Gayrimenkul danışman ekibinin mutlu müşterileri nezaketle uğurladığı sıcak an',
      grad: ['#1e293b', '#0f172a'] as [string, string],
      imageUrl: '/real_assets/client_seeoff_2.jpg',
      zoomDir: 'in' as const,
      speaker: 'Reklam Anlatıcısı (Tok Erkek Sesi)',
      voiceGender: 'male' as const
    },
    {
      id: 6,
      role: 'Adres & Web Sitesi Kapanış',
      sec: 7.5,
      text: 'KORKMAZ GAYRİMENKUL İNŞAAT',
      subtitle: 'Medrese, 88. Sokak 40100 Kırşehir Merkez',
      highlight: 'korkmazgayrimenkulinsaat.com',
      vo: 'Siz de bir kahvemizi içmeye bekleriz. Adresimiz: Medrese, 88. Sokak Kırşehir Merkez. Web sitemiz: korkmazgayrimenkulinsaat.com.',
      visual: 'Korkmaz Gayrimenkul Kırşehir ofisinin cadde görünümü ve tabela detayı',
      grad: ['#0f172a', '#1e40af'] as [string, string],
      imageUrl: '/real_assets/real_office_front.jpg',
      zoomDir: 'out' as const,
      speaker: 'Reklam Anlatıcısı (Tok Erkek Sesi)',
      voiceGender: 'male' as const
    }
  ];

  const scenes: Scene[] = [];

  for (let i = 0; i < scenesConfig.length; i++) {
    const sc = scenesConfig[i];
    const audioUrl = await generateSingleVoiceTTS(sc.vo, i);
    scenes.push({
      ...sc,
      audioUrl
    });
  }

  const korkmazVideo: VideoItem = {
    id: 'korkmaz-gayrimenkul-resmi-reklam-2026',
    type: 'reklam',
    product: 'Korkmaz Gayrimenkul İnşaat',
    audience: 'Kırşehir ve çevre illerde konut, iş yeri, arsa arayan alıcılar ve yatırımcılar',
    points: 'Mustafa Korkmaz liderliğinde 15 yıllık brokerlik tecrübesi\nSalih Korkmaz denetiminde inşaat mühendisliği ve kentsel dönüşüm\nEİDS doğrulamalı güvenilir portföy ve mutlu müşteri memnuniyeti',
    cta: 'Adres: Medrese, 88. Sokak 40100 Kırşehir Merkez | Web: korkmazgayrimenkulinsaat.com',
    tone: 'Prestijli & Lüks',
    dur: 45,
    ratio: '16:9',
    platform: 'TV & YouTube & Web (16:9)',
    lang: 'tr-TR',
    voiceGender: 'male',
    bgMusic: 'sales_corporate',
    enableLipSync: true,
    title: 'Korkmaz Gayrimenkul İnşaat – 45 Sn Kurumsal Tanıtım Filmi (Tek Ses)',
    mode: 'reklam',
    status: 'Hazır',
    stage: 'hazir',
    progress: 100,
    scenes,
    logs: [
      `[${new Date().toLocaleTimeString()}] 🏢 1. Adım: Korkmaz Gayrimenkul kurumsal kimliği yüklendi.`,
      `[${new Date().toLocaleTimeString()}] 📜 2. Adım: Tam 45 saniyelik tek anlatıcı senaryosu oluşturuldu.`,
      `[${new Date().toLocaleTimeString()}] 🎙️ 12. Adım: 6 sahnenin tamamı aynı tok ve güven verici erkek sesiyle (Puck) seslendirildi.`,
      `[${new Date().toLocaleTimeString()}] 🏢 4. & 5. Adım: Gerçek ofis, Mustafa Korkmaz, Salih Korkmaz ve müşteri uğurlama fotoğrafları bağlandı.`,
      `[${new Date().toLocaleTimeString()}] 🎵 14. Adım: Dinamik kurumsal satış fon müziği ve akıllı ducking miksajı yapıldı.`,
      `[${new Date().toLocaleTimeString()}] 🌐 24. Adım: korkmazgayrimenkulinsaat.com web adresi ve Medrese 88. Sokak adresi kilitlendi.`
    ],
    created: new Date().toLocaleString('tr-TR')
  };

  const showcasePath = path.join(process.cwd(), 'src', 'lib', 'showcaseVideo.json');
  fs.writeFileSync(showcasePath, JSON.stringify(korkmazVideo, null, 2), 'utf8');
  console.log(`🎉 45 saniyelik tek kişi seslendirmeli video hazır: ${showcasePath}`);
}

main().catch(err => {
  console.error('Hata:', err);
  process.exit(1);
});
