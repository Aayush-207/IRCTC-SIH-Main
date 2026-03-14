import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import wooxBanner1 from "@/assets/woox-banner-01.jpg";
import wooxBanner2 from "@/assets/woox-banner-02.jpg";
import wooxBanner3 from "@/assets/woox-banner-03.jpg";
import wooxBanner4 from "@/assets/woox-banner-04.jpg";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import StationSelect from "@/components/StationSelect";
import "./Home.css";

const SLIDE_DURATION_MS = 4300;
const SLIDE_TRANSITION_MS = 750;

const Home = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();

  const initialFrom = params.get("from") || "";
  const initialTo = params.get("to") || "";
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, []);
  const toInputDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState<string>(toInputDate(today));
  const [activeBanner, setActiveBanner] = useState(0);
  const [previousBanner, setPreviousBanner] = useState<number | null>(null);
  const [animationSeed, setAnimationSeed] = useState(0);

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

  useEffect(() => {
    setAnimationSeed((prev) => prev + 1);
  }, [activeBanner]);

  const setTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDate(toInputDate(d));
  };

  const toDisplayDate = (value: string) => {
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}-${month}-${year}`;
  };

  const handleSearch = () => {
    if (!from || !to || !date) {
      toast({
        title: "Missing Information",
        description: "Please enter From, To and Date of Journey",
        variant: "destructive",
      });
      return;
    }
    navigate(`/book-tickets?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
  };

  const handleBannerSelect = (index: number) => {
    changeBanner(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-100">
      {/* Woox-style First Section */}
      <section className="woox-hero-section">
        {banners.map((banner, index) => (
          <div
            key={banner}
            className={`woox-banner ${activeBanner === index ? "active" : ""} ${previousBanner === index ? "exiting" : ""}`}
            style={{ backgroundImage: `url(${banner})` }}
          >
            <div className="woox-banner-overlay" />
          </div>
        ))}

        <div className="woox-banner-inner container mx-auto px-4">
          <div className="woox-main-caption">
            <h2>Book Train Tickets</h2>
            <h1>Made Simple</h1>
            <p>Fast, reliable, and secure train booking experience across India</p>
          </div>

          <div className="woox-more-info-wrap">
            <div className="woox-more-info">
              <div className="woox-booking-grid">
                <div>
                  <span className="woox-field-label">From</span>
                  <div className="woox-field-wrap">
                    <StationSelect
                      label=""
                      placeholder="Type name or code"
                      valueCode={from}
                      onChangeCode={setFrom}
                    />
                  </div>
                </div>

                <div>
                  <span className="woox-field-label">To</span>
                  <div className="woox-field-wrap">
                    <StationSelect
                      label=""
                      placeholder="Type name or code"
                      valueCode={to}
                      onChangeCode={setTo}
                    />
                  </div>
                </div>

                <div>
                  <span className="woox-field-label">Date of Journey</span>
                  <div className="woox-date-row">
                    <button className="woox-date-pill" onClick={setTomorrow} type="button">
                      Tomorrow
                    </button>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="woox-date-input"
                    />
                  </div>
                  <p className="woox-date-text">{toDisplayDate(date)}</p>
                </div>

                <div className="woox-search-wrap">
                  <Button onClick={handleSearch} className="woox-search-button" type="button">
                    <Search className="h-5 w-5 mr-2" />
                    Search Trains
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="woox-controls" aria-label="Hero slides" style={{ ["--slide-duration" as string]: `${SLIDE_DURATION_MS}ms` }}>
          {banners.map((_, index) => (
            <button
              key={`control-${index}`}
              type="button"
              className={`woox-control ${activeBanner === index ? "active" : ""}`}
              onClick={() => handleBannerSelect(index)}
            >
              <span className="woox-progress-track">
                {activeBanner === index ? (
                  <span key={`fill-${index}-${animationSeed}`} className="woox-progress-fill" />
                ) : null}
              </span>
              <span className="woox-control-number">{index + 1}</span>
            </button>
          ))}
        </nav>
      </section>
    </div>
  );
};

export default Home;