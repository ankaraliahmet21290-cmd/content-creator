'use client';

import { QCResult } from '@/types';

interface QCChecklistProps {
  qc: QCResult | null;
}

export function QCChecklist({ qc }: QCChecklistProps) {
  if (!qc) return null;

  return (
    <div className="qc-card">
      <div className="qc-header">
        <h4>SOP Kalite Kontrolü</h4>
        <span className={`qc-score ${qc.isPerfect ? 'perfect' : 'warning'}`}>
          Skor: %{qc.score}
        </span>
      </div>
      <ul className="qc-list">
        {qc.checks.map((chk, i) => (
          <li key={i}>
            <span>
              {chk.title}
              <span style={{ color: 'var(--mute)', marginLeft: 6, fontSize: 11 }}>
                ({chk.detail})
              </span>
            </span>
            <span className={`qc-status ${chk.pass ? 'pass' : 'warn'}`}>
              {chk.pass ? '✓ Uygun' : '⚠ Düzelt'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
