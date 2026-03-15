import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock3, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import wooxBanner1 from "@/assets/woox-banner-01.jpg";
import wooxBanner2 from "@/assets/woox-banner-02.jpg";
import wooxBanner3 from "@/assets/woox-banner-03.jpg";
import wooxBanner4 from "@/assets/woox-banner-04.jpg";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import StationSelect from "@/components/StationSelect";
import "./Home.css";

const SLIDE_DURATION_MS = 4300;
const SLIDE_TRANSITION_MS = 750;
const PANEL_ORDER: Record<string, number> = {
  "": 0,
  live: 1,
  bookings: 2,
  "view-station": 3,
  enquiries: 4,
};

const Home = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
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
  const [liveTrainNumber, setLiveTrainNumber] = useState("");
  const [liveDate, setLiveDate] = useState<string>(toInputDate(today));
  const [stationQuery, setStationQuery] = useState("Dadar");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [previousBanner, setPreviousBanner] = useState<number | null>(null);
  const [animationSeed, setAnimationSeed] = useState(0);

  const banners = [wooxBanner1, wooxBanner2, wooxBanner3, wooxBanner4];
  const panelParam = params.get("panel");
  const activePanel = panelParam === "live" || panelParam === "bookings" || panelParam === "view-station" || panelParam === "enquiries" ? panelParam : null;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const dummyBooking = {
    bookingId: "IRCTC-9Q2M7K",
    pnr: "6523189745",
    trainNumber: "12301",
    trainName: "Rajdhani Express",
    journeyDate: "2026-03-14",
    from: "HOWRAH JN",
    to: "NEW DELHI",
    coach: "B2",
    seat: "36",
    classType: "3A",
    quota: "GN",
    status: "Confirmed",
  };
  const previousPanelRef = useRef<string | null>(null);
  const previousPanel = previousPanelRef.current;
  const previousPanelOrder = PANEL_ORDER[previousPanel ?? ""] ?? 0;
  const currentPanelOrder = PANEL_ORDER[activePanel ?? ""] ?? 0;
  const panelDirection = currentPanelOrder >= previousPanelOrder ? 1 : -1;
  const isOverlayOpen = activePanel !== null;

  useEffect(() => {
    previousPanelRef.current = activePanel;
  }, [activePanel]);

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

  const openFullLiveStatus = () => {
    const query = liveTrainNumber.trim();
    if (!query) {
      toast({
        title: "Missing Train Number",
        description: "Please enter a 5-digit train number",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{5}$/.test(query)) {
      setLiveError("Enter a valid 5-digit train number");
      return;
    }

    setLiveError(null);
    navigate(`/live-status?trainNumber=${encodeURIComponent(query)}&date=${encodeURIComponent(liveDate)}`);
  };

  const openPantryFromBooking = () => {
    navigate(`/pantry-cart?trainNumber=${encodeURIComponent(dummyBooking.trainNumber)}&seatNumber=${encodeURIComponent(`${dummyBooking.coach}/${dummyBooking.seat}`)}`);
  };

  const openViewStation = () => {
    navigate("/view-station", { state: { station: stationQuery } });
  };

  const handleTrainSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setSearchError(null);
    setIsSearching(true);
    setSearchResults([]);

    if (/^\d{3,5}$/.test(q)) {
      try {
        const res = await fetch(`https://erail.in/rail/getTrains.aspx?TrainNo=${q}&DataSource=0&Language=0&Cache=true`);
        const raw = await res.text();
        const data = raw.split("~~~~~~~~");
        if (data[0] === "~~~~~Please try again after some time." || data[0] === "~~~~~Train not found") {
          throw new Error(data[0].split("~").join(""));
        }
        let data1 = data[0].split("~").filter((el: string) => el !== "");
        if (data1[1]?.length > 6) data1.shift();

        const train = {
          name: data1[2],
          number: data1[1]?.replace("^", ""),
          route: `${data1[3]} - ${data1[5]}`,
          runningDaysBits: data1[14] || "0000000",
          departureTime: (data1[11] || "-").replace(".", ":"),
          arrivalTime: (data1[12] || "-").replace(".", ":"),
          duration: ((data1[13] || "-").replace(".", ":")) + " hrs",
          type: (data[1]?.split("~").filter((el: string) => el !== "")[11]) || 'Train'
        };
        const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
        const runningDays = train.runningDaysBits.split("").map((b: string, i: number) => b === "1" ? weekdays[i] : null).filter(Boolean);

        setSearchResults([{ 
          name: train.name,
          number: train.number,
          route: train.route,
          runningDays,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime,
          duration: train.duration,
          type: train.type,
        }]);
      } catch (e: any) {
        setSearchError(e?.message || "Unable to fetch train details");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
      return;
    }

    setIsSearching(false);
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

        <div className={`woox-banner-inner container mx-auto px-4 ${isOverlayOpen ? "home-content-leaving" : "home-content-entered"}`}>
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

        <AnimatePresence mode="wait" initial={false} custom={panelDirection}>
          {activePanel && (
            <motion.div
              key={activePanel}
              custom={panelDirection}
              className="live-panel-wrap"
              initial={{ opacity: 0, x: panelDirection > 0 ? 130 : -130 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: panelDirection > 0 ? -130 : 130 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`live-panel-shell ${activePanel === "bookings" ? "bookings-panel-shell" : ""}`}>
                <h3 className="live-panel-title">
                  {activePanel === "live" && "Live Train Status"}
                  {activePanel === "bookings" && "My Bookings"}
                  {activePanel === "view-station" && "View Station"}
                </h3>

                <div className={`live-panel-box ${activePanel === "bookings" ? "bookings-panel-box" : ""}`}>
                  {activePanel === "live" && (
                    <>
                      <div className="live-panel-fields">
                        <div className="live-panel-field">
                          <span>Train Number</span>
                          <Input
                            type="text"
                            value={liveTrainNumber}
                            onChange={(e) => setLiveTrainNumber(e.target.value.replace(/\D/g, "").slice(0, 5))}
                            placeholder="e.g. 12301"
                            className="live-panel-input"
                          />
                        </div>
                        <div className="live-panel-field">
                          <span>Journey Date</span>
                          <Input
                            type="date"
                            value={liveDate}
                            onChange={(e) => setLiveDate(e.target.value)}
                            className="live-panel-input"
                          />
                        </div>
                      </div>

                      <Button type="button" className="live-panel-track-btn" onClick={openFullLiveStatus}>
                        <Search className="h-4 w-4 mr-2" />
                        Track Live Status
                      </Button>

                      {liveError && <p className="live-panel-note live-panel-note-error">{liveError}</p>}
                    </>
                  )}

                  {activePanel === "bookings" && (
                    <>
                      <div className="bookings-featured-card">
                        <div className="bookings-featured-head">
                          <span>Upcoming Journey</span>
                          <span className="bookings-status-pill">{dummyBooking.status}</span>
                        </div>

                        <div className="bookings-featured-grid">
                          <div className="bookings-col-left">
                            <p><strong>{dummyBooking.trainName}</strong> ({dummyBooking.trainNumber})</p>
                            <p>{dummyBooking.from} to {dummyBooking.to}</p>
                            <p>Journey Date: {dummyBooking.journeyDate}</p>
                          </div>

                          <div className="bookings-col-center">
                            <p>PNR: {dummyBooking.pnr}</p>
                            <p>Coach/Seat: {dummyBooking.coach}/{dummyBooking.seat}</p>
                            <p>Class: {dummyBooking.classType} • Quota: {dummyBooking.quota}</p>
                            <p>Booking ID: {dummyBooking.bookingId}</p>
                          </div>

                          <div className="bookings-col bookings-col-right">
                            <div className="bookings-info-inline bookings-info-inline-right">
                              <div className="live-panel-info-title"><Clock3 className="h-4 w-4" /> Meal Service</div>
                              <p>Seat delivery available for this booking.</p>
                            </div>

                            <Button type="button" className="bookings-meal-btn" onClick={openPantryFromBooking}>
                              Book Your Meal
                            </Button>
                          </div>
                        </div>
                      </div>

                      <button type="button" className="bookings-trash-side" aria-label="Delete booking">
                        <Trash2 className="h-4 w-4" />
                      </button>


                    </>
                  )}

                  {activePanel === "view-station" && (
                    <>
                      <div className="live-panel-fields one-col">
                        <div className="live-panel-field">
                          <span>Station Name</span>
                          <Input
                            type="text"
                            value={stationQuery}
                            onChange={(e) => setStationQuery(e.target.value)}
                            placeholder="e.g. Dadar"
                            className="live-panel-input"
                          />
                        </div>
                      </div>

                      <Button type="button" className="live-panel-track-btn" onClick={openViewStation}>
                        Open View Station
                      </Button>
                    </>
                  )}

                  {activePanel === "enquiries" && (
                    <>
                      <div className="live-panel-fields one-col">
                        <div className="live-panel-field">
                          <span>Train Number or Name</span>
                          <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTrainSearch()}
                            placeholder="e.g. 12301 or Rajdhani"
                            className="live-panel-input"
                          />
                        </div>
                      </div>

                      <Button type="button" className="live-panel-track-btn" onClick={handleTrainSearch} disabled={isSearching}>
                        <Search className="h-4 w-4 mr-2" />
                        {isSearching ? "Searching..." : "Search Train"}
                      </Button>

                      {searchError && <p className="live-panel-note live-panel-note-error">{searchError}</p>}
                      
                      {searchResults.length > 0 && (
                        <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
                          {searchResults.map((train, index) => (
                            <div key={index} className="live-panel-result-card" style={{ background: "rgba(255,255,255,0.95)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }}>
                              <div style={{ marginBottom: "8px" }}>
                                <strong style={{ fontSize: "16px" }}>{train.name}</strong>
                                <span style={{ marginLeft: "12px", fontSize: "13px", color: "#666" }}>({train.number})</span>
                              </div>
                              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>{train.route}</div>
                              <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                                Time: {train.departureTime} - {train.arrivalTime} | Duration: {train.duration}
                              </div>
                              <div style={{ fontSize: "12px", color: "#999" }}>Type: {train.type}</div>
                              <Button 
                                type="button"
                                style={{ marginTop: "12px", width: "100%" }}
                                onClick={() => navigate(`/book-tickets?trainNumber=${train.number}&trainName=${encodeURIComponent(train.name)}&route=${encodeURIComponent(train.route)}`)}
                              >
                                Book Tickets
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default Home;