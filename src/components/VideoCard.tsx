'use client';

import { VideoItem } from '@/types';

interface VideoCardProps {
  video: VideoItem;
  onPreview: (video: VideoItem) => void;
  onReProduce: (video: VideoItem) => void;
  onOpenLogs: (video: VideoItem) => void;
  onDelete: (id: string) => void;
}

export function VideoCard({
  video,
  onPreview,
  onReProduce,
  onOpenLogs,
  onDelete
}: VideoCardProps) {
  const isReady = video.status === 'Hazır';
  const isFailed = video.status === 'Başarısız';
  const isStoryboard = video.stage === 'storyboard';

  return (
    <article className="v-card">
      {video.scenes && video.scenes[0]?.imageUrl && (
        <div
          style={{
            height: 95,
            borderRadius: 8,
            marginBottom: 12,
            backgroundImage: `url("${video.scenes[0].imageUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid var(--line)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)'
          }}
        />
      )}
      <h3>{video.title}</h3>
      <div className="v-meta">
        <span className={`badge-mode ${video.mode === 'sinema' ? 'cinema' : video.mode === 'youtube' ? 'youtube' : video.mode === 'classic' ? 'classic' : 'ai'}`}>
          {video.mode === 'sinema' ? '🎬 Sinema' : video.mode === 'youtube' ? '🔴 YouTube' : video.mode === 'classic' ? '⚡ Klasik' : '📢 AI Reklam'}
        </span>
        <span>📱 {video.platform}</span>
        <span>📐 {video.ratio}</span>
        <span>⏱️ {video.dur} sn</span>
      </div>

      <div className="v-progress-bar">
        <i style={{ width: `${video.progress}%` }} />
      </div>

      <div className={`v-status ${isReady ? 'ready' : isFailed ? 'failed' : isStoryboard ? 'storyboard' : 'processing'}`}>
        {isReady ? '✓ ' : isFailed ? '✕ ' : isStoryboard ? '🎨 ' : '⏳ '}
        {video.status}
      </div>

      <div className="v-meta">{video.created}</div>

      <div className="v-acts">
        {isStoryboard && (
          <button
            type="button"
            className="btn sm primary"
            onClick={() => onPreview(video)}
            style={{ background: 'var(--acc)', color: '#fff' }}
          >
            🎨 Sahneleri Tasarla
          </button>
        )}
        {isReady && (
          <button
            type="button"
            className="btn sm primary"
            onClick={() => onPreview(video)}
          >
            🎬 Önizle
          </button>
        )}
        <button
          type="button"
          className="btn sm"
          onClick={() => onReProduce(video)}
        >
          🔄 Yeniden Üret
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={() => onOpenLogs(video)}
        >
          📋 Log
        </button>
        <button
          type="button"
          className="btn sm danger"
          onClick={() => onDelete(video.id)}
        >
          🗑️ Sil
        </button>
      </div>
    </article>
  );
}
