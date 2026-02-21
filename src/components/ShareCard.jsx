import React, { useCallback, useState } from "react";
import envelopeImg from "../assets/Envelope4.jpg";
import stampImg from "../assets/waxstamp1.png";
import "./ShareCard.css";

function ShareCard({ score, onClose }) {
  const [sharing, setSharing] = useState(false);

  const siteUrl = window.location.origin;
  const bondLabel = score >= 80 ? "an incredible" : score >= 70 ? "a really strong" : "a great";
  const shareText = `My Destiny Quotient is ${score}%! It means there is a ${score}% probability my destined partner will match my dreams (according to Indian Astrology).\n Check yours now: ${siteUrl}`;

  // Generate share image on canvas (only when sharing)
  const generateImage = useCallback(() => {
    return new Promise((resolve) => {
      const envelope = new Image();
      envelope.crossOrigin = "anonymous";
      envelope.src = envelopeImg;

      const stamp = new Image();
      stamp.crossOrigin = "anonymous";
      stamp.src = stampImg;

      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded < 2) return;

        const canvas = document.createElement("canvas");
        const w = envelope.naturalWidth;
        const h = envelope.naturalHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        // Envelope
        ctx.drawImage(envelope, 0, 0, w, h);

        // Stamp (circular, top right)
        const stampSize = w * 0.15;
        const stampX = w * 0.78;
        const stampY = h * 0.04;
        ctx.save();
        ctx.beginPath();
        ctx.arc(stampX + stampSize / 2, stampY + stampSize / 2, stampSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(stamp, stampX, stampY, stampSize, stampSize);
        ctx.restore();

        // "Dear Reader,"
        ctx.textAlign = "left";
        ctx.font = `italic ${w * 0.055}px "Clicker Script", Georgia, serif`;
        ctx.fillStyle = "#6b4a3a";
        ctx.fillText("Dear Reader,", w * 0.12, h * 0.18);

        // "Your Destiny Quotient is"
        ctx.textAlign = "center";
        ctx.font = `${w * 0.045}px "Clicker Script", Georgia, serif`;
        ctx.fillStyle = "#6b4a3a";
        ctx.fillText("Your Destiny Quotient is", w * 0.5, h * 0.38);

        // Score
        ctx.font = `800 ${w * 0.11}px "Clicker Script", Georgia, serif`;
        ctx.fillStyle = "#1a1a1a";
        ctx.fillText(`${score}%`, w * 0.5, h * 0.52);

        // Bottom text
        ctx.font = `italic ${w * 0.025}px Georgia, serif`;
        ctx.fillStyle = "#000000";
        const bottomText = `*According to Indian Vedic Astrology, your destined life partner will be ${score}% aligned with your wishes and aspirations.`;
        const words = bottomText.split(" ");
        let line = "";
        const lines = [];
        const maxWidth = w * 0.7;
        for (const word of words) {
          const test = line + word + " ";
          if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line.trim());
            line = word + " ";
          } else {
            line = test;
          }
        }
        lines.push(line.trim());
        const lineH = w * 0.032;
        const startY = h * 0.92 - ((lines.length - 1) * lineH) / 2;
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], w * 0.5, startY + i * lineH);
        }

        canvas.toBlob((blob) => resolve(blob), "image/png");
      };

      envelope.onload = onLoad;
      stamp.onload = onLoad;
    });
  }, [score]);

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);

    try {
      const blob = await generateImage();
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
  }, [shareText, siteUrl, sharing, generateImage]);

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-container" onClick={(e) => e.stopPropagation()}>
        {/* Visual card (CSS-based, exactly as designed) */}
        <div className="share-card-canvas">
          <img src={envelopeImg} alt="" className="sc-envelope-img" />
          <img src={stampImg} alt="" className="sc-stamp" />
          <div className="sc-dear">Dear Reader,</div>
          <div className="sc-dq-text">Your Destiny Quotient is</div>
          <div className="sc-score">{score}%</div>
          <div className="sc-bottom-text">
            *According to Indian Vedic Astrology, your destined life partner will be {score}% aligned with your wishes and aspirations.
          </div>
        </div>

        <div className="share-actions">
          <button className="share-btn" onClick={handleShare} disabled={sharing}>
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
