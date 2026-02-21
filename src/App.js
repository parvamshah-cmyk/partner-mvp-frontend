import React, { useState, useCallback, useEffect, useRef } from "react";
import HeartMeter from "./components/HeartMeter";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";
import StepIndicator from "./components/StepIndicator";
import ShareCard from "./components/ShareCard";
import { startSession, sendMessage } from "./services/api";
import "./App.css";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(20);
  const [previousScore, setPreviousScore] = useState(20);
  const [stepInfo, setStepInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [scoreUpdating, setScoreUpdating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [chatReady, setChatReady] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [messageQueue, setMessageQueue] = useState([]);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const queueCallbackRef = useRef(null);
  const videoRef = useRef(null);
  const playIconTimer = useRef(null);

  // Drip messages one by one with typing delay
  useEffect(() => {
    if (messageQueue.length === 0) return;

    setLoading(true); // show typing indicator

    const delay = 1800 + Math.random() * 1200; // 1.8–3s per message
    const timer = setTimeout(() => {
      const [next, ...rest] = messageQueue;
      setMessages((prev) => [...prev, next]);
      setMessageQueue(rest);

      if (rest.length === 0) {
        setLoading(false);
        if (queueCallbackRef.current) {
          queueCallbackRef.current();
          queueCallbackRef.current = null;
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [messageQueue]);

  // Start dripping messages with optional callback when done
  const dripMessages = useCallback((msgs, onComplete) => {
    queueCallbackRef.current = onComplete || null;
    setMessageQueue(msgs);
  }, []);

  // 5 second countdown before chat unlocks
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      if (countdown === 1) {
        setChatReady(true);
        dripMessages(pendingMessages);
      }
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, pendingMessages, dripMessages]);

  const handleStart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await startSession();
      setSessionId(data.sessionId);
      setScore(data.score);
      setPreviousScore(data.score);
      setStepInfo(data.stepInfo);
      setPendingMessages([
        { type: "bot", text: "Hey, I am Atri. I am here to reveal details about your future partner. I have been trained using classic Vedic Astrology texts." },
        { type: "bot", text: "I need your birth details (for eg 15 March, 1998, Jaipur) to create your birth chart." },
      ]);
      setStarted(true);
      setCountdown(5);
    } catch (err) {
      console.error(err);
      setMessages([{ type: "system", text: "Failed to connect. Please try again." }]);
      setLoading(false);
    }
  }, []);

  const handleSend = useCallback(
    async (text) => {
      if (!sessionId || loading || complete) return;

      setMessages((prev) => [...prev, { type: "user", text }]);
      setLoading(true);

      try {
        const data = await sendMessage(sessionId, text);
        const hasScoreChange = data.newScore !== undefined && data.newScore !== score;

        // Build the bot messages array
        const botMessages = [];
        if (data.commentary) botMessages.push({ type: "bot", text: data.commentary });
        if (data.prediction) botMessages.push({ type: "bot", text: data.prediction });
        if (data.predictionDetail) botMessages.push({ type: "bot", text: data.predictionDetail });
        if (data.nextQuestion) botMessages.push({ type: "bot", text: data.nextQuestion });

        // What to do after all messages are dripped
        const onDripComplete = () => {
          if (data.complete && !data.nextQuestion) {
            setStepInfo(null);
            setComplete(true);
            setTimeout(() => setShowPopup(true), 5000);
          }
        };

        // Update score + step info
        setPreviousScore(score);
        if (data.newScore !== undefined) setScore(data.newScore);
        if (data.stepInfo) setStepInfo(data.stepInfo);

        if (hasScoreChange) {
          // Score animation first, then drip messages
          setScoreUpdating(true);
          setTimeout(() => {
            setScoreUpdating(false);
            dripMessages(botMessages, onDripComplete);
          }, 2200);
        } else {
          // Drip messages immediately
          dripMessages(botMessages, onDripComplete);
        }
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          { type: "system", text: "Something went wrong. Please try again." },
        ]);
        setLoading(false);
      }
    },
    [sessionId, loading, complete, score, dripMessages]
  );

  // Welcome screen
  if (!started) {
    return (
      <div className="app">
        <div className="start-screen">
          <img className="heart-gif" src={require("./assets/e0f44460bdb364dd215d8c4a8cafada0.gif")} alt="Heart animation" />
          <h1 className="start-title">The One for You </h1>
          <p className="start-subtitle">A promise of the stars</p>

          <div
            className="video-wrap"
            onClick={() => {
              if (!videoRef.current) return;
              if (videoRef.current.paused) {
                videoRef.current.play();
                setPaused(false);
              } else {
                videoRef.current.pause();
                setPaused(true);
              }
              setShowPlayIcon(true);
              clearTimeout(playIconTimer.current);
              playIconTimer.current = setTimeout(() => setShowPlayIcon(false), 800);
            }}
          >
            <video
              className="start-video"
              ref={videoRef}
              autoPlay
              loop
              muted={muted}
              playsInline
            >
              <source src={require("./assets/S_AA_Final.mp4")} type="video/mp4" />
            </video>

            {/* Play/Pause flash icon (reel-style) */}
            {showPlayIcon && (
              <div className="play-flash">
                {paused ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                )}
              </div>
            )}

            {/* IG-style speaker icon */}
            <button
              className="mute-btn"
              onClick={(e) => {
                e.stopPropagation();
                const next = !muted;
                setMuted(next);
                if (videoRef.current) videoRef.current.muted = next;
              }}
            >
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
          </div>

          <button className="start-button" onClick={handleStart} disabled={loading}>
            {loading ? "Starting..." : "Yes, Let's Go!"}
          </button>
        </div>
      </div>
    );
  }

  // Main chat screen
  return (
    <div className="app">
      <div className={`app-container ${scoreUpdating ? "score-updating" : ""}`}>
        {!complete && (
          <div className="top-section">
            <HeartMeter score={score} previousScore={previousScore} onInfoClick={() => setShowInfoSheet(true)} />
            <StepIndicator stepInfo={stepInfo} />
          </div>
        )}

        {/* Ending summary when complete */}
        {complete && (
          <div className="end-summary">
            <div className="end-label">Your Destiny Quotient</div>
            <div className="end-score">{score}%</div>
            <div className="end-verdict">
              {score >= 80
                ? "Your destiny says your partner would be almost exactly what you're imagining. The stars are strongly in your favor."
                : score >= 65
                  ? "Your destiny says your partner would be very similar to what you're imagining. The stars see a promising connection."
                  : score >= 55
                    ? "Your destiny says your partner would share many qualities you're looking for. The stars are watching over you."
                    : "Your destiny has its own plan — trust the stars, the right one is closer than you think."}
            </div>
            <button className="end-share-btn" onClick={() => setShowPopup(true)}>
              Share Result
            </button>
          </div>
        )}

        <ChatArea messages={messages} typing={!chatReady || loading} countdown={!chatReady ? countdown : 0} />

        {!complete && (
          <ChatInput onSend={handleSend} disabled={!chatReady || loading || complete || scoreUpdating} />
        )}
      </div>

      {/* Score spotlight overlay */}
      {scoreUpdating && <div className="score-spotlight-overlay" />}

      {/* Info bottom sheet */}
      {showInfoSheet && (
        <div className="sheet-overlay" onClick={() => setShowInfoSheet(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 className="sheet-title">How we calculate your score</h3>
            <p className="sheet-text">
              This compatibility score reflects nakshatra-based harmony across 8 classical dimensions — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi.
            </p>
            <p className="sheet-disclaimer">
              It should be used as a guidance tool and not a final verdict.
            </p>
            <button className="sheet-close" onClick={() => setShowInfoSheet(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Share card overlay */}
      {showPopup && (
        <ShareCard score={score} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default App;
