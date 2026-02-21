import React, { useCallback, useRef, useState } from "react";
import html2canvas from "html2canvas";
import envelopeImg from "../assets/Envelope4.jpg";
import stampImg from "../assets/waxstamp1.png";
import "./ShareCard.css";

function ShareCard({ score, onClose }) {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const siteUrl = window.location.origin;
  const bondLabel = score >= 80 ? "an incredible" : score >= 70 ? "a really strong" : "a great";
  const shareText = `My Destiny Quotient is ${score}%! The stars say we have ${bondLabel} cosmic bond. Check yours: ${siteUrl}`;

  const handleShare = useCallback(async () => {
    if (!cardRef.current || sharing) return;
    setSharing(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
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
        <div className="share-card-canvas" ref={cardRef}>
          <img src={envelopeImg} alt="" className="sc-envelope-img" />

          <img src={stampImg} alt="" className="sc-stamp" />

          {/* Text on the white letter */}
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
