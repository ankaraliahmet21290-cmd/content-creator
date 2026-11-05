'use client';

import { Scene } from '@/types';

interface SceneTimelineProps {
  scenes: Scene[];
  currentIndex: number;
  totalDuration: number;
  onSelectScene: (index: number) => void;
  onEditScene: (scene: Scene) => void;
}

export function SceneTimeline({
  scenes,
  currentIndex,
  totalDuration,
  onSelectScene,
  onEditScene
}: SceneTimelineProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontSize: 16 }}>Sahne Planı ve Düzenleme</h3>
        <span className="badge">
          {scenes.length} Sahne · Toplam {totalDuration} sn
        </span>
      </div>
      <ul className="scenes-list" aria-label="Sahne listesi">
        {scenes.map((s, idx) => (
          <li
            key={s.id}
            className="scene-item"
            aria-current={idx === currentIndex}
            onClick={() => onSelectScene(idx)}
            style={{ display: 'grid', gridTemplateColumns: '52px 85px 1fr auto', gap: 12, alignItems: 'center' }}
          >
            <div
              style={{
                width: 52,
                height: 34,
                borderRadius: 6,
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                backgroundImage: s.imageUrl ? `url("${s.imageUrl}")` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid var(--line)',
                flexShrink: 0
              }}
              title={s.role}
            />
            <div className="scene-role">
              <strong>{s.role}</strong>
              <span>{s.sec} sn</span>
            </div>
            <div>
              <div className="scene-text-preview">{s.text}</div>
              <div className="scene-vo-preview">🎙️ {s.vo}</div>
            </div>
            <button
              type="button"
              className="btn sm"
              onClick={e => {
                e.stopPropagation();
                onEditScene(s);
              }}
            >
              ✏️ Düzenle
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
