import { QCResult, VideoItem } from '@/types';

export function evaluateQC(video: VideoItem): QCResult | null {
  if (!video || !video.scenes || video.scenes.length === 0) return null;
  const scenes = video.scenes;
  const hookScene = scenes[0];
  const lastScene = scenes[scenes.length - 1];

  // 1. Kanca ilk 3-3.5 sn'de var mı? (SOP Bölüm 6 Kuralı)
  const hookPass = Boolean(hookScene && hookScene.role === 'Kanca' && hookScene.sec <= 3.5);

  // 2. CTA net ve son sahnede mi?
  const ctaKeywords = ['ara', 'dene', 'al', 'indirin', 'tıklayın', 'katılın', 'fırsat', 'başlayın'];
  const hasKeyword = ctaKeywords.some(k => (lastScene?.text || '').toLowerCase().includes(k) || (lastScene?.vo || '').toLowerCase().includes(k));
  const ctaPass = Boolean(lastScene && (lastScene.role === 'Çağrı' || hasKeyword));

  // 3. Altyazı taşması kontrolü (max 65 karakter)
  const maxChars = Math.max(...scenes.map(s => s.text.length));
  const subPass = maxChars <= 65;

  // 4. Süre uyumluluğu (Brief süresi ile toplam sahne süresi +- %10)
  const totalSec = scenes.reduce((acc, s) => acc + s.sec, 0);
  const durDiff = Math.abs(totalSec - video.dur);
  const durPass = durDiff <= Math.max(2, video.dur * 0.1);

  // 5. Marka/ürün adı doğru geçiyor mu?
  const prodSnippet = (video.product || '').toLowerCase().slice(0, 5);
  const brandMention = prodSnippet.length > 0 && scenes.some(
    s => s.text.toLowerCase().includes(prodSnippet) || s.vo.toLowerCase().includes(prodSnippet)
  );

  const checks = [
    {
      title: 'Kanca (Hook) ilk saniyelerde var',
      pass: hookPass,
      detail: `Kanca süresi: ${hookScene?.sec || 0} sn`
    },
    {
      title: 'CTA son sahnede net ve anlaşılır',
      pass: ctaPass,
      detail: `Son sahne rolü: ${lastScene?.role || '-'}`
    },
    {
      title: 'Altyazı ekrandan taşmıyor',
      pass: subPass,
      detail: `En uzun satır: ${maxChars} karakter`
    },
    {
      title: 'Süre brief ile uyumlu (±%10)',
      pass: durPass,
      detail: `Planlanan: ${video.dur}s, Gerçek: ${totalSec.toFixed(1)}s`
    },
    {
      title: 'Marka/Ürün adı kurguda geçiyor',
      pass: brandMention,
      detail: `İçerik: "${video.product.slice(0, 18)}..."`
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
