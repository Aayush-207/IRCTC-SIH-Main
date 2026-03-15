import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Train, Clock, MapPin } from "lucide-react";
import trainsFile from "../../Backend/trains.json";
import wooxBanner1 from "@/assets/woox-banner-01.jpg";
import wooxBanner2 from "@/assets/woox-banner-02.jpg";
import wooxBanner3 from "@/assets/woox-banner-03.jpg";
import wooxBanner4 from "@/assets/woox-banner-04.jpg";
import "./Home.css";

const SLIDE_DURATION_MS = 4300;
const SLIDE_TRANSITION_MS = 750;

const TrainSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [previousBanner, setPreviousBanner] = useState<number | null>(null);

  const banners = [wooxBanner1, wooxBanner2, wooxBanner3, wooxBanner4];
  const localTrains: any[] = useMemo(() => {
    const raw = Array.isArray((trainsFile as any)) ? (trainsFile as any) : ((trainsFile as any).trains || []);
    return raw;
  }, []);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setError(null);
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
        setError(e?.message || "Unable to fetch train details");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
      return;
    }

    // Non-numeric query: use local file suggestions
    const ql = q.toLowerCase();
    const filtered = localTrains.filter((t: any) =>
      (t.trainName || t.name || "").toLowerCase().includes(ql) ||
      (t.trainno || t.number || "").toString().toLowerCase().includes(ql)
    ).slice(0, 20).map((t: any) => ({
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
    setIsSearching(false);
  };

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
      <div className="woox-banner-inner container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-3 tracking-tight">
            Train Search
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-medium">
            Search by Train Number or Name
          </p>
        </div>

        {/* Search Input Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Input
              placeholder="e.g., 12301 or Rajdhani"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="md:max-w-md bg-white/10 border-white/25 text-white placeholder:text-white/50 backdrop-blur-md rounded-lg h-11 text-lg"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold h-11 px-8 rounded-lg"
            >
              <Search className="h-5 w-5 mr-2" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          {error && (
            <p className="text-center mt-3 text-red-300 text-sm font-semibold">{error}</p>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-5 max-h-96 overflow-y-auto">
            {searchResults.map((train, index) => (
              <Card 
                key={index} 
                className="border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/15 transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="space-y-5">
                    {/* Train Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Train className="h-5 w-5 text-cyan-300" />
                          <h3 className="text-2xl font-extrabold text-white">{train.name}</h3>
                          <Badge className="bg-white/20 text-white border-white/30 font-bold text-sm">
                            {train.number}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-white/75">
                          <MapPin className="h-4 w-4" />
                          <span className="text-base font-semibold">{train.route}</span>
                        </div>
                      </div>
                      <Badge className={`backdrop-blur-md border text-sm font-bold ${
                        train.type === 'Superfast' ? 'bg-orange-600/30 border-orange-400/50 text-orange-100' :
                        train.type === 'Duronto' ? 'bg-blue-600/30 border-blue-400/50 text-blue-100' :
                        'bg-white/20 border-white/30 text-white'
                      }`}>
                        {train.type}
                      </Badge>
                    </div>

                    {/* Train Details Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Departure & Arrival */}
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

                      {/* Running Days */}
                      <div className="space-y-2">
                        <p className="text-xs text-white/60 font-semibold uppercase">Running Days</p>
                        <div className="flex flex-wrap gap-1">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                            <Badge
                              key={day}
                              className={`text-xs font-semibold backdrop-blur-md border ${
                                train.runningDays?.includes(day) 
                                  ? 'bg-white/20 border-white/40 text-white' 
                                  : 'bg-white/5 border-white/10 text-white/40'
                              }`}
                            >
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Book Button */}
                      <div className="flex items-end">
                        <Button 
                          onClick={() => navigate(`/book-tickets?trainNumber=${train.number}&trainName=${encodeURIComponent(train.name)}&route=${encodeURIComponent(train.route)}`)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold h-11 rounded-lg"
                        >
                          Book Tickets
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty States */}
        {searchQuery && searchResults.length === 0 && !isSearching && !error && (
          <div className="text-center py-12">
            <Train className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 text-lg font-semibold">No trains found for "{searchQuery}"</p>
            <p className="text-white/60 text-sm mt-2">Try searching with train number or a different name</p>
          </div>
        )}

        {!searchQuery && searchResults.length === 0 && !error && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 text-lg font-semibold">Enter train number or name to search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainSearch;