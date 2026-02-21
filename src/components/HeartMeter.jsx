import React, { useEffect, useState, useRef, useCallback } from "react";
import "./HeartMeter.css";

function HeartMeter({ score, previousScore, onInfoClick }) {
  const [displayScore, setDisplayScore] = useState(previousScore || 20);
  const [beating, setBeating] = useState(false);
  const [particles, setParticles] = useState([]);
  const [scoreDelta, setScoreDelta] = useState(0);
  const animFrameRef = useRef(null);

  // Animate score number incrementally
  useEffect(() => {
    const start = displayScore;
    const end = score;
    if (start === end) return;

    setScoreDelta(end - start);
    const duration = 1500;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayScore(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Clear delta after animation
        setTimeout(() => setScoreDelta(0), 1000);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  // Beat animation on any score change
  useEffect(() => {
    if (score !== (previousScore || 20)) {
      setBeating(true);
      const timer = setTimeout(() => setBeating(false), 900);
      return () => clearTimeout(timer);
    }
  }, [score, previousScore]);

  // Golden particles when score > 85
  const spawnParticles = useCallback(() => {
    if (score <= 85) {
      setParticles([]);
      return;
    }
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 60,
      delay: Math.random() * 2.5,
      size: 4 + Math.random() * 5,
    }));
    setParticles(newParticles);
  }, [score]);

  useEffect(() => {
    spawnParticles();
  }, [spawnParticles]);

  // Non-linear fill — 20% score shows ~35% fill so the heart looks meaningfully filled early
  const fillPercent = Math.min(100, displayScore * 0.6 + 23);
  const glowing = displayScore > 75;

  return (
    <div className="heart-meter">
      <div className={`heart-container ${beating ? "beating" : ""} ${glowing ? "glowing" : ""}`}>
        <svg viewBox="0 0 200 200" className="heart-svg">
          <defs>
            <clipPath id="heartClip">
              <path d="M100 180 C60 140, 0 100, 0 60 C0 20, 40 0, 70 0 C85 0, 95 10, 100 20 C105 10, 115 0, 130 0 C160 0, 200 20, 200 60 C200 100, 140 140, 100 180Z" />
            </clipPath>
            <linearGradient id="fillGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="40%" stopColor="#e85368" />
              <stop offset="100%" stopColor="#f48da0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background heart (unfilled) */}
          <path
            d="M100 180 C60 140, 0 100, 0 60 C0 20, 40 0, 70 0 C85 0, 95 10, 100 20 C105 10, 115 0, 130 0 C160 0, 200 20, 200 60 C200 100, 140 140, 100 180Z"
            fill="#f5f0f0"
            stroke="#e8d0d0"
            strokeWidth="2"
          />

          {/* Fill rect clipped to heart shape */}
          <g clipPath="url(#heartClip)">
            <rect
              x="0"
              y={200 - (fillPercent / 100) * 200}
              width="200"
              height={(fillPercent / 100) * 200}
              fill="url(#fillGradient)"
              className="heart-fill"
            />
          </g>

          {/* Outline on top for definition */}
          <path
            d="M100 180 C60 140, 0 100, 0 60 C0 20, 40 0, 70 0 C85 0, 95 10, 100 20 C105 10, 115 0, 130 0 C160 0, 200 20, 200 60 C200 100, 140 140, 100 180Z"
            fill="none"
            stroke={glowing ? "#e85368" : "#e0d0d0"}
            strokeWidth="2.5"
            filter={glowing ? "url(#glow)" : undefined}
          />
        </svg>

        {/* Score delta badge */}
        {scoreDelta !== 0 && (
          <div className={`score-delta ${scoreDelta > 0 ? "positive" : "negative"}`}>
            {scoreDelta > 0 ? "+" : ""}{scoreDelta}
          </div>
        )}

        {/* Golden particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="score-row">
        <div className="score-display">
          <span className="score-number">{displayScore}</span>
          <span className="score-percent">%</span>
        </div>
        {onInfoClick && (
          <button className="score-info-btn" onClick={onInfoClick} aria-label="Info">
            i
          </button>
        )}
      </div>
      <div className="score-label">Destiny Quotient</div>
    </div>
  );
}

export default HeartMeter;
