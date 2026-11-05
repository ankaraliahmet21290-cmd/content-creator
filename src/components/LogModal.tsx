'use client';

import { VideoItem } from '@/types';

interface LogModalProps {
  video: VideoItem;
  onClose: () => void;
}

export function LogModal({ video, onClose }: LogModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h3>Üretim İşlem Kaydı ({video.product})</h3>
          <button type="button" className="btn sm" onClick={onClose}>✕</button>
        </div>
        <div className="log-box">
          {(video.logs || []).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="btn sm primary" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
