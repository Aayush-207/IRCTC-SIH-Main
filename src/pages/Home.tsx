import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock3, Search, Trash2, MapPin, Clock, Train } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import wooxBanner1 from "@/assets/woox-banner-01.jpg";
import wooxBanner2 from "@/assets/woox-banner-02.jpg";
import wooxBanner3 from "@/assets/woox-banner-03.jpg";
import wooxBanner4 from "@/assets/woox-banner-04.jpg";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import StationSelect from "@/components/StationSelect";
import trainsFile from "../../Backend/trains.json";
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

  const localTrains: any[] = useMemo(() => {
    const raw = Array.isArray((trainsFile as any)) ? (trainsFile as any) : ((trainsFile as any).trains || []);
    return raw;
  }, []);
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

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // Search by train number (numeric) or by train name
    const ql = q.toLowerCase();
    const filtered = localTrains.filter((t: any) =>
      (t.trainName || t.name || "").toLowerCase().includes(ql) ||
      (t.trainno || t.number || "").toString().toLowerCase().includes(ql)
    ).slice(0, 10).map((t: any) => ({
      name: t.trainName || t.name || '-',
      number: t.trainno || t.number || '-',
      route: `${t.fromName || t.source || '-'} - ${t.toName || t.dest || '-'}`,
      runningDays: [],
      departureTime: t.fromTime || t.depart || '-',
      arrivalTime: t.toTime || t.arrive || '-',
      duration: t.travelTime || '-',
      type: t.type || 'Train'
    }));
    setSearchResults(filtered);
    setSearchError(null);
  }, [searchQuery, localTrains]);

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
              <div className={`live-panel-shell ${activePanel === "bookings" ? "bookings-panel-shell" : ""} ${activePanel === "enquiries" ? "enquiries-panel-shell" : ""}`}>
                <h3 className="live-panel-title">
                  {activePanel === "live" && "Live Train Status"}
                  {activePanel === "bookings" && "My Bookings"}
                  {activePanel === "view-station" && "View Station"}
                </h3>

                <div className={`${activePanel !== "enquiries" ? "live-panel-box" : ""} ${activePanel === "bookings" ? "bookings-panel-box" : ""}`}>
                  {activePanel === "live" && (
                    <>
                      {/* Header Section */}
                      <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
                          Live Status
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 font-medium">
                          Track Your Train in Real-Time
                        </p>
                      </div>

                      {/* Search Input Section */}
                      <div className="mb-12">
                        <div className="flex flex-col md:flex-row gap-3 justify-center">
                          <Input
                            type="text"
                            value={liveTrainNumber}
                            onChange={(e) => setLiveTrainNumber(e.target.value.replace(/\D/g, "").slice(0, 5))}
                            placeholder="e.g. 12301"
                            className="md:max-w-md bg-white/10 border-white/25 text-white placeholder:text-white/50 backdrop-blur-md rounded-lg h-11 text-lg"
                          />
                          <Input
                            type="date"
                            value={liveDate}
                            onChange={(e) => setLiveDate(e.target.value)}
                            className="md:max-w-md bg-white/10 border-white/25 text-white backdrop-blur-md rounded-lg h-11 text-lg"
                          />
                          <Button type="button" onClick={openFullLiveStatus} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold h-11 px-8 rounded-lg">
                            <Search className="h-5 w-5 mr-2" />
                            Track
                          </Button>
                        </div>
                        {liveError && (
                          <p className="text-center mt-3 text-red-300 text-sm font-semibold">{liveError}</p>
                        )}
                      </div>
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
                      {/* Header Section */}
                      <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
                          View Station
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 font-medium">
                          Check Arrivals & Departures
                        </p>
                      </div>

                      {/* Search Input Section */}
                      <div className="mb-12">
                        <div className="flex flex-col md:flex-row gap-3 justify-center">
                          <Input
                            type="text"
                            value={stationQuery}
                            onChange={(e) => setStationQuery(e.target.value)}
                            placeholder="e.g. Dadar"
                            className="md:max-w-md bg-white/10 border-white/25 text-white placeholder:text-white/50 backdrop-blur-md rounded-lg h-11 text-lg"
                          />
                          <Button type="button" onClick={openViewStation} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold h-11 px-8 rounded-lg">
                            <Search className="h-5 w-5 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {activePanel === "enquiries" && (
                    <>
                      {/* Header Section */}
                      <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
                          Train Enquiries
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 font-medium">
                          Search by Train Number or Name
                        </p>
                      </div>

                      {/* Search Input Section */}
                      <div className="mb-12">
                        <div className="flex flex-col md:flex-row gap-3 justify-center">
                          <Input
                            placeholder="e.g. 12301 or Rajdhani"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:flex-1 bg-white/10 border-white/25 text-white placeholder:text-white/50 backdrop-blur-md rounded-lg h-11 text-lg"
                          />
                        </div>
                        {searchError && (
                          <p className="text-center mt-3 text-red-300 text-sm font-semibold">{searchError}</p>
                        )}
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                          {searchResults.map((train, index) => (
                            <div key={index} className="border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/15 transition-all duration-300 rounded-lg p-5">
                              {/* Train Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Train className="h-5 w-5 text-cyan-300" />
                                    <h3 className="text-xl font-extrabold text-white">{train.name}</h3>
                                    <span className="bg-white/20 text-white border-white/30 border text-white font-bold text-xs px-2 py-1 rounded">
                                      {train.number}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-white/75">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-semibold">{train.route}</span>
                                  </div>
                                </div>
                                <span className={`backdrop-blur-md border text-xs font-bold px-3 py-1 rounded whitespace-nowrap ml-4 ${
                                  train.type === 'Superfast' ? 'bg-orange-600/30 border-orange-400/50 text-orange-100' :
                                  train.type === 'Duronto' ? 'bg-blue-600/30 border-blue-400/50 text-blue-100' :
                                  'bg-white/20 border-white/30 text-white'
                                }`}>
                                  {train.type}
                                </span>
                              </div>

                              {/* Train Details */}
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="space-y-2">
                                  <p className="text-xs text-white/60 font-semibold uppercase">Departure - Arrival</p>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-cyan-300" />
                                    <span className="text-lg font-bold text-white">{train.departureTime}</span>
                                    <span className="text-white/60">-</span>
                                    <span className="text-lg font-bold text-white">{train.arrivalTime}</span>
                                  </div>
                                  <p className="text-xs text-white/70">Duration: <span className="font-semibold">{train.duration}</span></p>
                                </div>

                                {/* Book Button */}
                                <Button 
                                  onClick={() => navigate(`/book-tickets?trainNumber=${train.number}&trainName=${encodeURIComponent(train.name)}&route=${encodeURIComponent(train.route)}`)}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 py-2 h-auto rounded-lg whitespace-nowrap"
                                >
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty States */}
                      {searchQuery && searchResults.length === 0 && !isSearching && !searchError && (
                        <div className="text-center py-12">
                          <Train className="h-16 w-16 text-white/40 mx-auto mb-4" />
                          <p className="text-white/80 text-lg font-semibold">No trains found for "{searchQuery}"</p>
                          <p className="text-white/60 text-sm mt-2">Try searching with train number or a different name</p>
                        </div>
                      )}

                      {!searchQuery && searchResults.length === 0 && !searchError && (
                        <div className="text-center py-12">
                          <Search className="h-16 w-16 text-white/40 mx-auto mb-4" />
                          <p className="text-white/80 text-lg font-semibold">Enter train number or name to search</p>
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