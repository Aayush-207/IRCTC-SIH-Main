import { useState, useEffect, useCallback } from "react";
import wooxBanner1 from "@/assets/woox-banner-01.jpg";
import wooxBanner2 from "@/assets/woox-banner-02.jpg";
import wooxBanner3 from "@/assets/woox-banner-03.jpg";
import wooxBanner4 from "@/assets/woox-banner-04.jpg";
import "./Home.css";
import ChatbotUI from "@/components/ChatbotUI";

const SLIDE_DURATION_MS = 4300;
const SLIDE_TRANSITION_MS = 750;

const AskDisha = () => {
  const [activeBanner, setActiveBanner] = useState(0);
  const [previousBanner, setPreviousBanner] = useState<number | null>(null);

  const banners = [wooxBanner1, wooxBanner2, wooxBanner3, wooxBanner4];

  const changeBanner = useCallback((nextIndex: number) => {
    if (nextIndex === activeBanner) return;
    setPreviousBanner(activeBanner);
    setActiveBanner(nextIndex);
  }, [activeBanner]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      changeBanner((activeBanner + 1) % banners.length);
    }, SLIDE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [activeBanner, banners.length, changeBanner]);

  useEffect(() => {
    if (previousBanner === null) return;
    const cleanupTimer = window.setTimeout(() => {
      setPreviousBanner(null);
    }, SLIDE_TRANSITION_MS + 30);
    return () => window.clearTimeout(cleanupTimer);
  }, [previousBanner]);

  return (
    <div className="woox-hero-section">
      {/* Banner Carousel */}
      {banners.map((banner, index) => (
        <div
          key={banner}
          className={`woox-banner ${activeBanner === index ? 'active' : ''} ${previousBanner === index ? 'exiting' : ''}`}
          style={{ backgroundImage: `url(${banner})` }}
        >
          <div className="woox-banner-overlay" />
        </div>
      ))}

      {/* Content */}
      <div className="woox-banner-inner flex items-center justify-center pointer-events-none" style={{ minHeight: '100vh' }}>
        <div className="w-full max-w-4xl mx-4 h-[80vh] pointer-events-auto rounded-xl overflow-hidden shadow-2xl">
          <ChatbotUI isFullScreen={true} />
        </div>
      </div>
    </div>
  );
};

export default AskDisha;