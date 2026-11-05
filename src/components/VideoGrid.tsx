'use client';

import { VideoItem } from '@/types';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: VideoItem[];
  onPreview: (video: VideoItem) => void;
  onReProduce: (video: VideoItem) => void;
  onOpenLogs: (video: VideoItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function VideoGrid({
  videos,
  onPreview,
  onReProduce,
  onOpenLogs,
  onDelete,
  onClearAll
}: VideoGridProps) {
  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 20 }}>Üretilen Videolar ({videos.length})</h2>
        {videos.length > 0 && (
          <button
            type="button"
            className="btn sm danger"
            onClick={onClearAll}
          >
            Tümünü Temizle
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <div
          style={{
            border: '2px dashed var(--line)',
            borderRadius: 16,
            padding: '52px 24px',
            textAlign: 'center',
            color: 'var(--mute)',
            background: 'var(--card)'
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
          <h3 style={{ color: 'var(--ink)', marginBottom: 8, fontSize: 18 }}>
            Henüz Video Üretilmedi
          </h3>
          <p style={{ margin: 0, fontSize: 13.5, maxWidth: 450, marginLeft: 'auto', marginRight: 'auto' }}>
            Sol taraftaki brief formunu doldurarak veya yukarıdaki hazır şablonlardan birini seçerek ilk videonuzu üretin.
          </p>
        </div>
      ) : (
        <div className="v-grid">
          {videos.map(v => (
            <VideoCard
              key={v.id}
              video={v}
              onPreview={onPreview}
              onReProduce={onReProduce}
              onOpenLogs={onOpenLogs}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
