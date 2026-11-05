import { QCResult, VideoItem } from '@/types';

export function evaluateQC(video: VideoItem): QCResult | null {
  if (!video || !video.scenes || video.scenes.length === 0) return null;
  const scenes = video.scenes;
  const hookScene = scenes[0];
  const lastScene = scenes[scenes.length - 1];

  const isCinema = video.type === 'sinema';
  const isYouTube = video.type === 'youtube';

  // 1. Kanca / Açılış Kontrolü
  let hookPass = false;
  let hookTitle = 'Kanca (Hook) ilk saniyelerde var';
  if (isCinema) {
    hookTitle = 'Sinematik Açılış & Atmosfer sahnesi kuruldu';
    hookPass = Boolean(
      hookScene &&
      (hookScene.role.includes('Açılış') || hookScene.role === 'Kanca' || hookScene.sec <= 6.0)
    );
  } else if (isYouTube) {
    hookTitle = 'YouTube Retention Kancası ilk 5 sn içinde';
    hookPass = Boolean(
      hookScene &&
      (hookScene.role.includes('Kanca') || hookScene.role.includes('Giriş') || hookScene.sec <= 5.0)
    );
  } else {
    hookPass = Boolean(hookScene && hookScene.role === 'Kanca' && hookScene.sec <= 3.5);
  }

  // 2. Kapanış / CTA / Vizyon Çağrısı
  let ctaPass = false;
  let ctaTitle = 'CTA son sahnede net ve anlaşılır';
  const lastTextVo = ((lastScene?.text || '') + ' ' + (lastScene?.vo || '')).toLowerCase();

  if (isCinema) {
    ctaTitle = 'Dramatik Final & Vizyon Müjdesi mevcut';
    const cinemaKeywords = ['sinema', 'vizyon', 'bilet', 'izle', 'fragman', 'yakında', 'film', 'imax', 'salon'];
    const hasCinemaWord = cinemaKeywords.some(k => lastTextVo.includes(k));
    ctaPass = Boolean(
      lastScene &&
      (lastScene.role.includes('Final') || lastScene.role.includes('Vizyon') || lastScene.role === 'Çağrı' || hasCinemaWord)
    );
  } else if (isYouTube) {
    ctaTitle = 'YouTube Abone Ol & Beğen çağrısı yapıldı';
    const ytKeywords = ['abone', 'beğen', 'yorum', 'takip', 'katıl', 'video', 'izle', 'paylaş', 'bildirim'];
    const hasYtWord = ytKeywords.some(k => lastTextVo.includes(k));
    ctaPass = Boolean(
      lastScene &&
      (lastScene.role.includes('Abone') || lastScene.role.includes('Çağrı') || hasYtWord)
    );
  } else {
    const ctaKeywords = ['ara', 'dene', 'al', 'indirin', 'tıklayın', 'katılın', 'fırsat', 'başlayın'];
    const hasKeyword = ctaKeywords.some(k => lastTextVo.includes(k));
    ctaPass = Boolean(lastScene && (lastScene.role === 'Çağrı' || hasKeyword));
  }

  // 3. Altyazı taşması kontrolü (Sinema için 75, YouTube ve Sosyal için 65 karakter)
  const maxLimit = isCinema ? 75 : 65;
  const maxChars = Math.max(...scenes.map(s => s.text.length));
  const subPass = maxChars <= maxLimit;

  // 4. Süre uyumluluğu (Brief süresi ile toplam sahne süresi +- %10-12)
  const totalSec = scenes.reduce((acc, s) => acc + s.sec, 0);
  const durDiff = Math.abs(totalSec - video.dur);
  const durPass = durDiff <= Math.max(3, video.dur * 0.12);

  // 5. Başlık/konu adı kurguda geçiyor mu?
  const prodSnippet = (video.product || '').toLowerCase().slice(0, 5);
  const brandMention =
    prodSnippet.length > 0 &&
    scenes.some(
      s =>
        s.text.toLowerCase().includes(prodSnippet) ||
        s.vo.toLowerCase().includes(prodSnippet) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(prodSnippet))
    );

  const nameTitle = isCinema ? 'Film adı kurguda vurgulandı' : isYouTube ? 'Video konusu kurguda işlendi' : 'Marka/Ürün adı kurguda geçiyor';

  const checks = [
    {
      title: hookTitle,
      pass: hookPass,
      detail: `Süre: ${hookScene?.sec || 0} sn · Rol: ${hookScene?.role || '-'}`
    },
    {
      title: ctaTitle,
      pass: ctaPass,
      detail: `Son sahne rolü: ${lastScene?.role || '-'}`
    },
    {
      title: 'Altyazı ekrandan taşmıyor',
      pass: subPass,
      detail: `En uzun satır: ${maxChars} karakter (Sınır: ${maxLimit})`
    },
    {
      title: 'Süre brief ile uyumlu',
      pass: durPass,
      detail: `Planlanan: ${video.dur}s, Gerçek: ${totalSec.toFixed(1)}s`
    },
    {
      title: nameTitle,
      pass: brandMention,
      detail: `İçerik: "${video.product.slice(0, 22)}..."`
    }
  ];

  const passCount = checks.filter(c => c.pass).length;
  const score = Math.round((passCount / checks.length) * 100);

  return {
    score,
    checks,
    isPerfect: score === 100
  };
}
