'use client';

import React from 'react';

interface KlaketLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

export function KlaketLogo({
  size = 46,
  className = '',
  showText = false,
  animated = true
}: KlaketLogoProps) {
  return (
    <div
      className={`klaket-brand-logo-wrap ${animated ? 'interactive' : ''} ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}
    >
      <div
        className="klaket-logo-mark"
        style={{
          width: size,
          height: size,
          position: 'relative',
          flexShrink: 0
        }}
      >
        <svg
          viewBox="0 0 128 128"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Klaket AI Logo"
          role="img"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Koyu Sinema Degrade */}
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c101d" />
              <stop offset="50%" stopColor="#181335" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Neon Border */}
            <linearGradient id="logoBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>

            {/* Klaket Alt Gövdesi */}
            <linearGradient id="logoBoardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#222938" />
              <stop offset="100%" stopColor="#111622" />
            </linearGradient>

            {/* Neon Şerit Degrade */}
            <linearGradient id="logoStripeNeon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Beyaz Şerit */}
            <linearGradient id="logoStripeWhite" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Lens AI Parıltısı */}
            <radialGradient id="logoLensGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>

            {/* Play Buton Degrade */}
            <linearGradient id="logoPlayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Halka Degrade */}
            <linearGradient id="logoRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="35%" stopColor="#8b5cf6" />
              <stop offset="70%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <filter id="logoGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <clipPath id="logoStickClip">
              <rect x="0" y="0" width="80" height="15" rx="3.5" />
            </clipPath>
          </defs>

          {/* Dış Kalkan / Squircle */}
          <rect
            className="klaket-squircle"
            x="5"
            y="5"
            width="118"
            height="118"
            rx="28"
            fill="url(#logoBgGrad)"
            stroke="url(#logoBorderGrad)"
            strokeWidth="2.4"
          />

          {/* Glass Highlight */}
          <path
            d="M 16 34 Q 64 16 112 34"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* AI Lens Glow Arka Plan */}
          <circle cx="64" cy="80" r="34" fill="url(#logoLensGlow)" />

          {/* Klaket Alt Gövde */}
          <g className="klaket-board-body">
            <rect
              x="22"
              y="47"
              width="84"
              height="57"
              rx="8"
              fill="url(#logoBoardGrad)"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
            />
            {/* Slate lines */}
            <line x1="26" y1="58" x2="102" y2="58" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="56" y1="58" x2="56" y2="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="84" y1="58" x2="84" y2="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x="30" y="55" fill="rgba(255,255,255,0.35)" fontFamily="monospace" fontSize="5" fontWeight="bold" letterSpacing="1">SCENE</text>
            <text x="60" y="55" fill="rgba(255,255,255,0.35)" fontFamily="monospace" fontSize="5" fontWeight="bold" letterSpacing="1">TAKE</text>
            <text x="88" y="55" fill="#38bdf8" fontFamily="monospace" fontSize="5" fontWeight="bold" letterSpacing="1">AI</text>
          </g>

          {/* Klaket Üst Kol (Animasyonlu Kol) */}
          <g className="klaket-arm">
            <rect
              x="24"
              y="29"
              width="80"
              height="15"
              rx="3.5"
              fill="#0f172a"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1"
            />
            <g transform="translate(24, 29)" clipPath="url(#logoStickClip)">
              <rect x="0" y="0" width="80" height="15" fill="#111827" />
              <polygon points="0,0 12,0 3,15 -9,15" fill="url(#logoStripeNeon)" />
              <polygon points="16,0 28,0 19,15 7,15" fill="url(#logoStripeWhite)" />
              <polygon points="32,0 44,0 35,15 23,15" fill="url(#logoStripeNeon)" />
              <polygon points="48,0 60,0 51,15 39,15" fill="url(#logoStripeWhite)" />
              <polygon points="64,0 76,0 67,15 55,15" fill="url(#logoStripeNeon)" />
              <polygon points="80,0 92,0 83,15 71,15" fill="url(#logoStripeWhite)" />
            </g>
            <line x1="26" y1="30" x2="102" y2="30" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
          </g>

          {/* Klaket Orta Sabit Çizgi */}
          <g className="klaket-mid-band">
            <rect
              x="22"
              y="44"
              width="84"
              height="10"
              rx="2"
              fill="#0f172a"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.8"
            />
            <g transform="translate(22, 44)" clipPath="url(#logoStickClip)">
              <rect x="0" y="0" width="84" height="10" fill="#111827" />
              <polygon points="0,0 8,0 0,10 -8,10" fill="url(#logoStripeWhite)" />
              <polygon points="14,0 22,0 14,10 6,10" fill="url(#logoStripeNeon)" />
              <polygon points="28,0 36,0 28,10 20,10" fill="url(#logoStripeWhite)" />
              <polygon points="42,0 50,0 42,10 34,10" fill="url(#logoStripeNeon)" />
              <polygon points="56,0 64,0 56,10 48,10" fill="url(#logoStripeWhite)" />
              <polygon points="70,0 78,0 70,10 62,10" fill="url(#logoStripeNeon)" />
              <polygon points="84,0 92,0 84,10 76,10" fill="url(#logoStripeWhite)" />
            </g>
          </g>

          {/* Menteşe Pimi */}
          <circle cx="27" cy="46" r="4.5" fill="#334155" stroke="#94a3b8" strokeWidth="1.2" />
          <circle cx="27" cy="46" r="2.2" fill="#e2e8f0" />
          <circle cx="26" cy="45" r="0.8" fill="#ffffff" />

          {/* AI Sinema Lensi ve Play */}
          <g className="klaket-lens" transform="translate(64, 80)">
            <circle cx="0" cy="0" r="18.5" fill="none" stroke="url(#logoRingGrad)" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="15" fill="#090d16" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            
            {/* Diyafram detayları */}
            <path d="M -11 -7 L 2 -13" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
            <path d="M 9 -10 L 14 0" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />
            <path d="M 12 6 L 2 13" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" />
            <path d="M -5 13 L -13 4" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
            <path d="M -14 -1 L -7 -11" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />

            {/* Lens Cam Parıltısı */}
            <path d="M -10 -9 A 14 14 0 0 1 10 -9 A 12 12 0 0 0 -10 -9 Z" fill="rgba(255, 255, 255, 0.28)" />

            {/* Play Sembolü */}
            <path
              d="M -4 -7.5 C -4 -8.5 -2.8 -9.1 -2 -8.5 L 8.5 -2 C 9.3 -1.5 9.3 -0.5 8.5 0 L -2 6.5 C -2.8 7.1 -4 6.5 -4 5.5 Z"
              fill="url(#logoPlayGrad)"
            />
          </g>

          {/* AI Kıvılcımları */}
          <g className="klaket-sparkle-1" transform="translate(93, 38)">
            <path d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z" fill="#38bdf8" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
          </g>

          <g className="klaket-sparkle-2" transform="translate(32, 92)">
            <path d="M 0 -5 Q 0 0 5 0 Q 0 0 0 5 Q 0 0 -5 0 Q 0 0 0 -5 Z" fill="#ec4899" />
            <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
          </g>

          <circle cx="82" cy="69" r="1.5" fill="#a78bfa" />
        </svg>
      </div>

      {showText && (
        <div className="klaket-brand-typography">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-bricolage, sans-serif)',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 30%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1
              }}
            >
              KLAKET
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '2px 6px',
                borderRadius: 5,
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                color: '#ffffff',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)'
              }}
            >
              AI STUDIO
            </span>
          </div>
          <span
            style={{
              fontSize: 11.5,
              color: 'var(--mute)',
              display: 'block',
              marginTop: 2,
              fontWeight: 500
            }}
          >
            SOP Uyumlu Otomatik Video Üretim Platformu
          </span>
        </div>
      )}
    </div>
  );
}
