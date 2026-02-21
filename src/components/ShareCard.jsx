import React, { useCallback, useRef, useState, useEffect } from "react";
import envelopeImg from "../assets/Envelope4.jpg";
import stampImg from "../assets/waxstamp1.png";
import "./ShareCard.css";

function ShareCard({ score, onClose }) {
  const canvasRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const envelopeRef = useRef(null);
  const stampRef = useRef(null);

  const siteUrl = window.location.origin;
  const bondLabel = score >= 80 ? "an incredible" : score >= 70 ? "a really strong" : "a great";
  const shareText = `My Destiny Quotient is ${score}%! The stars say we have ${bondLabel} cosmic bond. Check yours: ${siteUrl}`;

  // Preload images and draw canvas
  useEffect(() => {
    const envelope = new Image();
    envelope.crossOrigin = "anonymous";
    envelope.src = envelopeImg;

    const stamp = new Image();
    stamp.crossOrigin = "anonymous";
    stamp.src = stampImg;

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 2) {
        envelopeRef.current = envelope;
        stampRef.current = stamp;
        drawCard();
        setImageReady(true);
      }
    };

    envelope.onload = onLoad;
    stamp.onload = onLoad;

    function drawCard() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const w = envelope.naturalWidth;
      const h = envelope.naturalHeight;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");

      // Draw envelope
      ctx.drawImage(envelope, 0, 0, w, h);

      // Draw stamp (top right, ~15% size)
      const stampSize = w * 0.15;
      const stampX = w * 0.78;
      const stampY = h * 0.04;
      // Draw circular clip for stamp
      ctx.save();
      ctx.beginPath();
      ctx.arc(stampX + stampSize / 2, stampY + stampSize / 2, stampSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(stamp, stampX, stampY, stampSize, stampSize);
      ctx.restore();

      // Text settings
      ctx.textAlign = "left";

      // "Dear Reader," - top left of letter
      ctx.font = `italic ${w * 0.055}px "Clicker Script", Georgia, serif`;
      ctx.fillStyle = "#6b4a3a";
      ctx.fillText("Dear Reader,", w * 0.18, h * 0.18);

      // "Your Destiny Quotient is" - centered
      ctx.textAlign = "center";
      ctx.font = `${w * 0.045}px "Clicker Script", Georgia, serif`;
      ctx.fillStyle = "#6b4a3a";
      ctx.fillText("Your Destiny Quotient is", w * 0.5, h * 0.38);

      // Score - big centered
      ctx.font = `800 ${w * 0.11}px "Clicker Script", Georgia, serif`;
      ctx.fillStyle = "#1a1a1a";
      ctx.fillText(`${score}%`, w * 0.5, h * 0.52);

      // Bottom text
      ctx.font = `italic ${w * 0.025}px Georgia, serif`;
      ctx.fillStyle = "#000000";
      const bottomText = `*According to Indian Vedic Astrology, your destined life partner will be ${score}% aligned with your wishes and aspirations.`;
      wrapText(ctx, bottomText, w * 0.5, h * 0.92, w * 0.7, w * 0.032);
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = text.split(" ");
      let line = "";
      const lines = [];

      for (const word of words) {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth && line) {
          lines.push(line.trim());
          line = word + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      // Center vertically
      const startY = y - ((lines.length - 1) * lineHeight) / 2;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, startY + i * lineHeight);
      }
    }
  }, [score]);

  const handleShare = useCallback(async () => {
    if (!canvasRef.current || sharing) return;
    setSharing(true);

    try {
      const blob = await new Promise((resolve) =>
        canvasRef.current.toBlob(resolve, "image/png")
      );

      const file = new File([blob], "destiny-quotient.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "The One for You",
          text: shareText,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({ title: "The One for You", text: shareText, url: siteUrl });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard!");
      }
    } catch (e) {
      if (e.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard!");
      } catch {
        // Do nothing
      }
    } finally {
      setSharing(false);
    }
  }, [shareText, siteUrl, sharing]);

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-container" onClick={(e) => e.stopPropagation()}>
        {/* Canvas-rendered card (used for both display and sharing) */}
        <canvas ref={canvasRef} className="sc-canvas" />

        <div className="share-actions">
          <button className="share-btn" onClick={handleShare} disabled={sharing || !imageReady}>
            {sharing ? "Preparing..." : "Share"}
          </button>
          <button className="share-dismiss" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareCard;
