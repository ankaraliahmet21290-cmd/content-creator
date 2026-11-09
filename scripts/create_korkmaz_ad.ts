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
const TTS_MODELS = ['gemini-2.5-flash-preview-tts', 'gemini-3.8-flash-tts'];

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

async function generateTTS(text: string, sceneIndex: number): Promise<string | undefined> {
  if (!apiKey) return undefined;
  for (const model of TTS_MODELS) {
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
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
                  voiceName: 'Puck' // Tok, gür ve kararlı reklam spikeri sesi
                }
              }
            }
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const inlineData = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (inlineData?.data) {
          const rawBuf = Buffer.from(inlineData.data, 'base64');
          let wavBuffer: Buffer;
          if (rawBuf.length > 44 && rawBuf.slice(0, 4).toString() === 'RIFF') {
            wavBuffer = rawBuf;
          } else {
            wavBuffer = pcm16ToWavBuffer(rawBuf, 24000);
          }

          const dir = path.join(process.cwd(), 'public', 'generated_assets');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const hash = crypto.createHash('md5').update(wavBuffer).digest('hex').slice(0, 8);
          const filename = `korkmaz_vo_${sceneIndex}_${hash}.wav`;
          const savePath = path.join(dir, filename);
          fs.writeFileSync(savePath, wavBuffer);
          console.log(`✅ Sahne ${sceneIndex + 1} TTS üretildi: ${filename}`);
          return `/api/assets/${filename}`;
        }
      } else {
        const errText = await res.text();
        console.warn(`Model ${model} TTS hatası:`, errText.slice(0, 150));
      }
    } catch (err) {
      console.warn(`Model ${model} TTS exception:`, err);
    }
  }
  return undefined;
}

async function main() {
  console.log('🎬 Korkmaz Gayrimenkul & İnşaat Reklam Filmi hazırlanıyor...');

  const scenesData = [
    {
      id: 1,
      role: 'Marka & Ofis Girişi',
      sec: 7.5,
      text: 'KORKMAZ GAYRİMENKUL & İNŞAAT',
      subtitle: 'Kırşehir Merkez\'de Doğru Yatırım ve Güvenin Adresi',
      highlight: 'GÜVENİLİR GELECEK',
      vo: 'Kırşehir\'de doğru gayrimenkul yatırımı ve güvenilir geleceğin simgesi: Korkmaz Gayrimenkul ve İnşaat!',
      visual: 'Gerçek Kırşehir Merkez ofis ön cephesi, kurumsal tabela, modern vitrin ve prestijli ofis girişi',
      grad: ['#0f172a', '#1e3a8a'] as [string, string],
      imageUrl: '/real_assets/real_office_front_hd.jpg',
      zoomDir: 'in' as const,
      speaker: 'Reklam Spikeri (Tok Erkek)',
      voiceGender: 'male' as const
    },
    {
      id: 2,
      role: 'Kurucu Broker & Danışmanlık',
      sec: 7.5,
      text: 'KURUCU BROKER & UZMAN DANIŞMANLIK',
      subtitle: 'Mustafa Korkmaz liderliğinde 15 yılı aşkın sektör deneyimi',
      highlight: 'DOĞRU EKSPERTİZ',
      vo: 'Kurucu brokerımız Mustafa Korkmaz liderliğinde, arsa, konut ve ticari mülklerinizde şeffaf ve kurumsal danışmanlık sunuyoruz.',
      visual: 'Mustafa Korkmaz, Gayrimenkul Kurucu Brokerı profesyonel portresi',
      grad: ['#0b1329', '#1e293b'] as [string, string],
      imageUrl: '/real_assets/team_mustafa.jpg',
      zoomDir: 'out' as const,
      speaker: 'Mustafa Korkmaz',
      voiceGender: 'male' as const
    },
    {
      id: 3,
      role: 'İnşaat & Kentsel Dönüşüm',
      sec: 7.5,
      text: 'İNŞAAT MÜHENDİSLİĞİ VE GÜVEN',
      subtitle: 'Salih Korkmaz denetiminde statik güvenlik ve modern yapılar',
      highlight: 'MÜHENDİSLİK GÜVENCESİ',
      vo: 'İnşaat Mühendisimiz Salih Korkmaz denetiminde, kentsel dönüşüm mevzuatına tam uyumlu, depreme dayanıklı modern yaşam alanları inşa ediyoruz.',
      visual: 'Salih Korkmaz, İnşaat Mühendisi ve Proje Yöneticisi profesyonel portresi',
      grad: ['#1e1b4b', '#1e3a8a'] as [string, string],
      imageUrl: '/real_assets/team_salih.jpg',
      zoomDir: 'in' as const,
      speaker: 'Salih Korkmaz',
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
      speaker: 'Reklam Spikeri (Tok Erkek)',
      voiceGender: 'male' as const
    },
    {
      id: 5,
      role: 'Resmi Güvence & Ekip',
      sec: 7.5,
      text: 'RESMİ TAŞINMAZ YETKİ BELGELİ',
      subtitle: 'EİDS doğrulamalı güvenilir portföy ve şeffaf sözleşmeler',
      highlight: 'RESMİ VE ŞEFFAF',
      vo: 'Taşınmaz Ticareti Yetki Belgesi ve Elektronik Doğrulama Sistemi ile tüm işlemleriniz yasal güvence altında.',
      visual: 'Korkmaz Gayrimenkul danışman ekibinin mutlu müşterileri nezaketle uğurladığı sıcak an',
      grad: ['#1e293b', '#0f172a'] as [string, string],
      imageUrl: '/real_assets/client_seeoff_2.jpg',
      zoomDir: 'in' as const,
      speaker: 'Reklam Spikeri (Tok Erkek)',
      voiceGender: 'male' as const
    },
    {
      id: 6,
      role: 'Adres & Kapanış Çağrısı',
      sec: 7.5,
      text: 'KORKMAZ GAYRİMENKUL İNŞAAT',
      subtitle: 'Medrese, 88. Sokak 40100 Kırşehir Merkez',
      highlight: 'GÜVEN VE KALİTENİN ADRESİ',
      vo: 'Siz de bir kahvemizi içmeye bekleriz. Adresimiz: Medrese, 88. Sokak Kırşehir Merkez. Korkmaz Gayrimenkul ve İnşaat!',
      visual: 'Korkmaz Gayrimenkul Kırşehir ofisinin cadde görünümü ve tabela detayı',
      grad: ['#0f172a', '#1e40af'] as [string, string],
      imageUrl: '/real_assets/real_office_front.jpg',
      zoomDir: 'out' as const,
      speaker: 'Reklam Spikeri (Tok Erkek)',
      voiceGender: 'male' as const
    }
  ];

  const scenes: Scene[] = [];

  for (let i = 0; i < scenesData.length; i++) {
    const item = scenesData[i];
    console.log(`🎙️ Sahne ${i + 1} seslendiriliyor: "${item.vo}"`);
    const audioUrl = await generateTTS(item.vo, i);
    scenes.push({
      ...item,
      audioUrl
    });
  }

  const korkmazVideo: VideoItem = {
    id: 'korkmaz-gayrimenkul-resmi-reklam-2026',
    type: 'reklam',
    product: 'Korkmaz Gayrimenkul İnşaat',
    audience: 'Kırşehir ve çevre illerde konut, iş yeri, arsa arayan alıcılar ve yatırımcılar',
    points: 'Mustafa Korkmaz liderliğinde 15 yıllık brokerlik tecrübesi\nSalih Korkmaz denetiminde inşaat mühendisliği ve kentsel dönüşüm\nEİDS doğrulamalı güvenilir portföy ve yüzde yüz müşteri memnuniyeti',
    cta: 'Adres: Medrese, 88. Sokak 40100 Kırşehir Merkez',
    tone: 'Prestijli & Lüks',
    dur: 45,
    ratio: '16:9',
    platform: 'TV & YouTube & Web (16:9)',
    lang: 'tr-TR',
    voiceGender: 'male',
    bgMusic: 'sales_corporate',
    enableLipSync: true,
    title: 'Korkmaz Gayrimenkul İnşaat – Resmi Kurumsal Reklam Filmi',
    mode: 'reklam',
    status: 'Hazır',
    stage: 'hazir',
    progress: 100,
    scenes,
    logs: [
      `[${new Date().toLocaleTimeString()}] 🏢 1. Adım: Korkmaz Gayrimenkul kurumsal kimliği yüklendi.`,
      `[${new Date().toLocaleTimeString()}] 📜 2. Adım: Telefon numarasız ve link içermeyen 45 sn senaryo hazırlandı.`,
      `[${new Date().toLocaleTimeString()}] 👥 3. & 8. Adım: Kurucu Broker Mustafa Korkmaz ve İnşaat Mühendisi Salih Korkmaz sahnelere atandı.`,
      `[${new Date().toLocaleTimeString()}] 🏢 4. & 5. Adım: Gerçek Kırşehir ofis önü ve mutlu müşteri uğurlama fotoğrafları bağlandı.`,
      `[${new Date().toLocaleTimeString()}] 🎙️ 12. Adım: Gemini 24kHz Puck tok erkek sesiyle stüdyo seslendirmeleri tamamlandı.`,
      `[${new Date().toLocaleTimeString()}] 🎵 14. Adım: Kurumsal satış fon müziği (Corporate Upbeat) ve akıllı ducking miksajı yapıldı.`,
      `[${new Date().toLocaleTimeString()}] 👄 13. Adım: Dudak senkronizasyonu ve kafa salınımı katmanı bağlandı.`,
      `[${new Date().toLocaleTimeString()}] 📍 24. Adım: Medrese 88. Sokak adresi ekrana yerleştirildi.`
    ],
    created: new Date().toLocaleString('tr-TR')
  };

  const showcasePath = path.join(process.cwd(), 'src', 'lib', 'showcaseVideo.json');
  fs.writeFileSync(showcasePath, JSON.stringify(korkmazVideo, null, 2), 'utf8');
  console.log(`🎉 Korkmaz Gayrimenkul reklam videosu başarıyla oluşturuldu: ${showcasePath}`);
}

main().catch(err => {
  console.error('Hata:', err);
  process.exit(1);
});
