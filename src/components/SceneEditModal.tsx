'use client';

import { useState } from 'react';
import { Scene } from '@/types';
import { SOP_ROLES } from '@/lib/constants';

interface SceneEditModalProps {
  scene: Scene;
  onClose: () => void;
  onSave: (updated: Scene) => void;
}

export function SceneEditModal({ scene, onClose, onSave }: SceneEditModalProps) {
  const [data, setData] = useState<Scene>({ ...scene });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h3>Sahne {data.id} Revizyonu ({data.role})</h3>
          <button type="button" className="btn sm" onClick={onClose}>✕</button>
        </div>
        <div>
          <label htmlFor="scene-role-select">Sahne Rolü</label>
          <select
            id="scene-role-select"
            value={data.role}
            onChange={e => setData({ ...data, role: e.target.value })}
          >
            {SOP_ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label htmlFor="scene-text-input">Ekran Metni (Kısa & Çarpıcı Altyazı)</label>
          <input
            id="scene-text-input"
            value={data.text}
            onChange={e => setData({ ...data, text: e.target.value })}
          />

          <label htmlFor="scene-vo-textarea">Seslendirme Metni (TTS Voiceover)</label>
          <textarea
            id="scene-vo-textarea"
            value={data.vo}
            rows={3}
            onChange={e => setData({ ...data, vo: e.target.value })}
          />

          <div className="row">
            <div>
              <label htmlFor="scene-sec-input">Süre (Saniye)</label>
              <input
                id="scene-sec-input"
                type="number"
                step="0.5"
                min="1"
                max="30"
                value={data.sec}
                onChange={e => setData({ ...data, sec: Math.max(0.5, +e.target.value) })}
              />
            </div>
            <div>
              <label htmlFor="scene-visual-input">Görsel / Video Prompt Tarifi</label>
              <input
                id="scene-visual-input"
                value={data.visual}
                onChange={e => setData({ ...data, visual: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button type="button" className="btn" onClick={onClose}>İptal</button>
            <button
              type="button"
              className="btn primary"
              onClick={() => onSave(data)}
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
