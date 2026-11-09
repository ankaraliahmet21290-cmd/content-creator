import { getScenePhoto } from './assets';

export interface WebImageResult {
  url: string;
  width: number;
  height: number;
  title: string;
}

/**
 * Wikimedia Commons API üzerinden telifsiz, gerçek fotoğrafları arar.
 * Herhangi bir API anahtarı gerektirmez, 100+ milyon gerçek CC/kamu malı fotoğraf içerir.
 */
export async function searchWikimediaCommons(query: string, limit = 8): Promise<WebImageResult[]> {
  if (!query || !query.trim()) return [];

  // Arama terimini optimize et
  const cleanQ = query
    .replace(/[\[\](),.:"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanQ) return [];

  const words = cleanQ.split(' ').filter(w => w.length > 2);
  const searchTerms = [cleanQ];
  if (words.length > 2) {
    searchTerms.push(words.slice(0, 3).join(' '));
  }

  for (const term of searchTerms) {
    try {
      const url =
        'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
        encodeURIComponent(term + ' filetype:bitmap') +
        `&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime&format=json&gsrlimit=${Math.max(limit, 8)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'KlaketStudio/1.0 (https://klaket.studio; video-creator@klaket.studio)'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      const pages = data.query?.pages || {};
      interface WikiPageItem {
        title?: string;
        imageinfo?: Array<{
          url?: string;
          width?: number;
          height?: number;
        }>;
      }
      const results: WebImageResult[] = Object.values(pages as Record<string, WikiPageItem>)
        .map(p => {
          const info = p.imageinfo?.[0];
          return {
            url: (info?.url as string) || '',
            width: (info?.width as number) || 1280,
            height: (info?.height as number) || 720,
            title: ((p.title as string) || '')
              .replace(/^File:/i, '')
              .replace(/\.[^.]+$/, '')
              .replace(/[_-]/g, ' ')
          };
        })
        .filter(
          x =>
            x.url &&
            !x.url.endsWith('.svg') &&
            !x.url.endsWith('.tif') &&
            !x.url.endsWith('.webp') &&
            !x.url.endsWith('.ogg') &&
            !x.url.endsWith('.pdf') &&
            x.width >= 400
        );

      if (results.length > 0) {
        return results.slice(0, limit);
      }
    } catch {
      // Bir sonraki terimi dene
    }
  }

  return [];
}

/**
 * Arama terimlerini akıllıca optimize eder, futbol takımı kısaltmalarını açar (gs -> Galatasaray),
 * Türkçe konuşma dili eylemlerini ("göster", "özetini anlat", "shorts") temizler.
 */
export function normalizeTopicQuery(rawQuery: string): { cleanQuery: string; candidateQueries: string[] } {
  let q = rawQuery || '';
  // Takım kısaltmalarını ve yaygın yazım hatalarını genişlet
  q = q
    .replace(/(?:^|\W)gs(?:\W|$)/gi, ' Galatasaray ')
    .replace(/(?:^|\W)fb(?:\W|$)/gi, ' Fenerbahce ')
    .replace(/(?:^|\W)bjk(?:\W|$)/gi, ' Besiktas ')
    .replace(/(?:^|\W)ts(?:\W|$)/gi, ' Trabzonspor ')
    .replace(/stutgart/gi, 'Stuttgart')
    .replace(/(?:^|\W)barca(?:\W|$)/gi, ' Barcelona ')
    .replace(/(?:^|\W)real(?:\W|$)/gi, ' Real Madrid ');

  q = q.replace(/[-_]/g, ' ');

  // Türkçe sohbet/eylem kelimelerini temizle
  const conversationalStopwords = [
    'da', 'de', 'ile', 've', 'için', 'göster', 'göstersin', 'gösterme', 'anlat', 'yap',
    'oluştur', 'hazırla', 'özeti', 'özetini', 'maçı', 'maçını', 'maç', 'gollerini', 'golleri',
    'gol', 'videosu', 'videoları', 'shorts', 'reels', 'tiktok', 'nasıl', 'nedir', 'hakkında'
  ];

  const words = q.split(/\s+/).filter(w => !conversationalStopwords.includes(w.toLowerCase()) && w.length > 1);
  const cleanQuery = words.join(' ');

  const isSports = /maç|futbol|gol|galatasaray|fenerbahce|besiktas|trabzonspor|stuttgart|stutgart|derbi|stadyum|soccer|football/i.test(rawQuery);

  const candidateQueries: string[] = [];
  if (cleanQuery) candidateQueries.push(cleanQuery);

  if (isSports) {
    if (cleanQuery.includes('Galatasaray')) candidateQueries.push('Galatasaray football');
    if (cleanQuery.includes('Stuttgart')) candidateQueries.push('VfB Stuttgart');
    if (cleanQuery.includes('Fenerbahce')) candidateQueries.push('Fenerbahce football');
    if (cleanQuery.includes('Besiktas')) candidateQueries.push('Besiktas football');
    candidateQueries.push('football soccer match goal stadium');
    candidateQueries.push('football match');
  }

  return { cleanQuery, candidateQueries };
}

/**
 * Sahne için internetten (Wikimedia Commons) en uygun gerçek fotoğrafı bulur.
 * AI kamera jargonlarını temizler, konu başlığı ve anahtar kelimelerle arama yapar.
 */
export async function fetchWebImageForScene(
  visualPrompt: string,
  productTitle: string,
  role: string,
  sceneIndex: number,
  briefType: string = 'sinema'
): Promise<string> {
  // AI kamera jargonlarını temizle
  const cleanedPrompt = (visualPrompt || '')
    .replace(/award-winning|cinematic|35mm film still|shot on|arri alexa|panavision|anamorphic primes|dramatic cinematic lighting|color graded in davinci resolve|8k resolution|photorealistic|hyperdetailed|volumetric rim lighting|subtle film grain|movie scene|hasselblad|national geographic|bbc earth|natural sunlight|organic textures|studio lighting|crisp focus|vibrant colors|b-roll/gi, ' ')
    .replace(/[,\.:\"\'\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleanedPrompt.split(' ').filter(w => w.length > 2);
  const promptKeywords = words.slice(0, 3).join(' ');

  const { candidateQueries: topicCandidates, cleanQuery } = normalizeTopicQuery(productTitle);

  // Arama adayları sıralaması:
  const candidateQueries = [
    ...topicCandidates,
    promptKeywords,
    cleanQuery ? `${cleanQuery} ${role}` : '',
    productTitle,
    role
  ].filter(Boolean);

  for (const q of candidateQueries) {
    const results = await searchWikimediaCommons(q, 6);
    if (results.length > 0) {
      const selected = results[sceneIndex % results.length];
      if (selected?.url) {
        return selected.url;
      }
    }
  }

  // İnternetten bulunamazsa yüksek kaliteli tematik havuza geç
  return getScenePhoto(briefType, role, visualPrompt, sceneIndex, productTitle);
}

