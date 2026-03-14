import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Train, Clock, MapPin, AlertTriangle, CheckCircle, Circle } from "lucide-react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useSearchParams } from "react-router-dom";
import liveBg from "@/assets/live.jpg";

type ApiStation = {
  trainname?: string;
  source?: string;
  dest?: string;
  station?: string;
  code?: string;
  arr?: string;
  dep?: string;
  platform?: string;
  delay?: string;
  distance?: string | number;
  current?: string | boolean;
  status?: string;
};

type TimelineStation = {
  name: string;
  code: string;
  arrivalTime: string;
  departureTime: string;
  platform: string;
  status: "current" | "departed" | "upcoming";
  delay: string;
  distance: string | number;
};

type TrainStatusView = {
  trainName: string;
  trainNumber: string;
  date: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  delay: string;
  currentStation: string;
  currentStationTime: string;
  nextStation: string;
  nextStationTime: string;
  distanceCovered: number;
  totalDistance: number;
  avgSpeed: string;
  stations: TimelineStation[];
};

const TODAY = new Date().toISOString().slice(0, 10);

const isValidJourneyDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const MapComponent = ({ stations }: { stations: TimelineStation[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !stations.length) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    let isCancelled = false;
    const geocoder = new google.maps.Geocoder();

    const geocodeStation = (stationName: string) =>
      new Promise<google.maps.LatLngLiteral | null>((resolve) => {
        geocoder.geocode({ address: `${stationName}, India` }, (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const location = results[0].geometry.location;
            resolve({ lat: location.lat(), lng: location.lng() });
            return;
          }
          resolve(null);
        });
      });

    const drawRoute = async () => {
      const routePath: google.maps.LatLngLiteral[] = [];

      for (const station of stations) {
        const point = await geocodeStation(station.name);
        if (!point || isCancelled) continue;
        routePath.push(point);

        const markerColor = station.status === "current"
          ? "#2563eb"
          : station.status === "departed"
            ? "#16a34a"
            : "#6b7280";

        new google.maps.Marker({
          map,
          position: point,
          title: station.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
      }

      if (isCancelled || routePath.length === 0) return;

      if (routePath.length > 1) {
        const polyline = new google.maps.Polyline({
          path: routePath,
          geodesic: true,
          strokeColor: "#2563eb",
          strokeOpacity: 0.95,
          strokeWeight: 4,
        });
        polyline.setMap(map);
      }

      const bounds = new google.maps.LatLngBounds();
      routePath.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds);
    };

    void drawRoute();

    return () => {
      isCancelled = true;
    };
  }, [stations]);

  return <div ref={mapRef} className="w-full h-96 rounded-xl ring-1 ring-white/25 shadow-sm" />;
};

const LiveStatus = () => {
  const [searchParams] = useSearchParams();
  const [trainQuery, setTrainQuery] = useState("");
  const [journeyDate, setJourneyDate] = useState<string>(TODAY);
  const [trainStatus, setTrainStatus] = useState<TrainStatusView | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const fetchTrainStatus = useCallback(async (query: string, date: string) => {
    setError(null);
    setIsSearching(true);

    try {
      const response = await fetch("https://easy-rail.onrender.com/fetch-train-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainNumber: query, dates: date }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch train status");
      }
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No live status found for this train/date");
      }

      const stations = data as ApiStation[];
      const currentIndex = stations.findIndex((station) => station.current === "true" || station.current === true);
      const first = stations[0] || {};
      const last = stations[stations.length - 1] || {};

      const parseDistance = (value: string | number | undefined) => {
        if (typeof value === "number") return Number.isFinite(value) ? value : null;
        if (typeof value === "string") {
          const numeric = Number(value.replace(/[^0-9.]/g, ""));
          return Number.isFinite(numeric) ? numeric : null;
        }
        return null;
      };

      const lastDistance = parseDistance(last.distance);
      const currentDistance = currentIndex >= 0 ? parseDistance(stations[currentIndex]?.distance) : 0;
      const distanceCovered = currentDistance ?? (currentIndex >= 0 ? (currentIndex + 1) * 10 : 0);
      const totalDistance = lastDistance ?? Math.max(stations.length * 10, distanceCovered);

      const mapped: TrainStatusView = {
        trainName: first.trainname || `Train ${query}`,
        trainNumber: query,
        date,
        source: first.source || "-",
        destination: last.dest || "-",
        departureTime: first.dep || "-",
        arrivalTime: last.arr || "-",
        status: currentIndex >= 0 ? "Running" : "Scheduled",
        delay: (currentIndex >= 0 ? stations[currentIndex]?.delay : undefined) || "On Time",
        currentStation: (currentIndex >= 0 ? stations[currentIndex]?.station : undefined) || first.station || "-",
        currentStationTime: (currentIndex >= 0 ? (stations[currentIndex]?.arr || stations[currentIndex]?.dep) : undefined) || "-",
        nextStation: (currentIndex >= 0 ? stations[currentIndex + 1]?.station : undefined) || (currentIndex === -1 ? first.station : "-") || "-",
        nextStationTime: (currentIndex >= 0 ? stations[currentIndex + 1]?.arr : undefined) || (currentIndex === -1 ? first.arr : "-") || "-",
        distanceCovered,
        totalDistance,
        avgSpeed: "-",
        stations: stations.map((station, index) => ({
          name: station.station || "-",
          code: station.code || "",
          arrivalTime: station.arr || "-",
          departureTime: station.dep || "-",
          platform: station.platform || "-",
          status: station.current === "true" || station.current === true
            ? "current"
            : index < (currentIndex === -1 ? 0 : currentIndex)
              ? "departed"
              : "upcoming",
          delay: station.delay || "On Time",
          distance: station.distance || "-",
        })),
      };

      setTrainStatus(mapped);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
      setTrainStatus(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchParamsKey = searchParams.toString();

  useEffect(() => {
    const trainFromUrl = searchParams.get("trainNumber")?.trim() || "";
    const dateFromUrl = searchParams.get("date") || TODAY;

    if (!trainFromUrl) return;
    if (!/^[0-9]{5}$/.test(trainFromUrl)) {
      setError("Enter a valid 5-digit train number");
      return;
    }

    const normalizedDate = isValidJourneyDate(dateFromUrl) ? dateFromUrl : TODAY;
    setTrainQuery(trainFromUrl);
    setJourneyDate(normalizedDate);
    void fetchTrainStatus(trainFromUrl, normalizedDate);
  }, [fetchTrainStatus, searchParamsKey, searchParams]);

  const getStationIcon = (status: string) => {
    switch (status) {
      case "departed":
        return <CheckCircle className="h-5 w-5 text-emerald-300" />;
      case "current":
        return <Train className="h-5 w-5 text-sky-300 animate-pulse" />;
      case "upcoming":
        return <Circle className="h-5 w-5 text-white/65" />;
      default:
        return <Circle className="h-5 w-5 text-white/65" />;
    }
  };

  const getDelayColor = (delay: string) => {
    if (delay === "On Time") return "text-emerald-200 border-emerald-200/50";
    if (delay.includes("min")) {
      const minutes = parseInt(delay, 10);
      if (minutes <= 15) return "text-amber-200 border-amber-200/50";
      return "text-red-200 border-red-200/50";
    }
    return "text-white/75 border-white/25";
  };

  const progressPercentage = trainStatus
    ? (trainStatus.distanceCovered / (trainStatus.totalDistance || 1)) * 100
    : 0;

  const renderMap = (status: Status) => {
    if (status === Status.LOADING) {
      return (
        <div className="w-full h-96 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/25">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm text-white/75">Loading map...</p>
          </div>
        </div>
      );
    }

    if (status === Status.FAILURE) {
      return (
        <div className="w-full h-96 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/25">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-white/75 mx-auto mb-2" />
            <p className="text-sm text-white/75">Map unavailable</p>
          </div>
        </div>
      );
    }

    return <MapComponent stations={trainStatus?.stations || []} />;
  };

  const glassCardClass = "border border-white/20 bg-white/10 backdrop-blur-xl text-white shadow-2xl";

  return (
    <div className="relative h-screen overflow-hidden">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${liveBg})` }}
      />
      <div className="absolute inset-0 -z-10 bg-black/60" />

      <div className="relative z-10 h-full overflow-y-auto">
        <div className="container mx-auto px-4 max-w-6xl pt-24 pb-10">
        <Card className={`${glassCardClass} mb-6`}>
          <CardHeader className="pb-2 border-b border-white/15">
            <CardTitle className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <Clock className="h-6 w-6 text-white" />
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Live Train Status</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 md:grid-cols-2 text-sm md:text-base">
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                <span className="font-semibold text-white/80">Train Number - </span>
                <span className="font-bold text-white">{trainQuery || "-"}</span>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                <span className="font-semibold text-white/80">Date - </span>
                <span className="font-bold text-white">{journeyDate || "-"}</span>
              </div>
            </div>

            {isSearching && <p className="mt-3 text-sm text-white/80">Loading live status...</p>}
            {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
          </CardContent>
        </Card>

        {trainStatus && (
          <div className="space-y-6">
            <Card className={glassCardClass}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Train className="h-5 w-5 text-white" />
                    <span className="font-semibold text-lg">{trainStatus.trainName}</span>
                    <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/20">{trainStatus.trainNumber}</Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className={trainStatus.status === "Running" ? "border-emerald-300 text-emerald-200" : "border-white/30 text-white/80"}
                  >
                    {trainStatus.status}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-white/75" />
                    <span className="text-sm">
                      <span className="font-medium">{trainStatus.source}</span> -&gt; <span className="font-medium">{trainStatus.destination}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-white/75" />
                    <span className="text-sm">{trainStatus.date}</span>
                  </div>
                </div>

                {trainStatus.delay !== "On Time" && (
                  <div className="bg-amber-400/15 border border-amber-300/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-200" />
                      <span className="text-amber-100 font-medium">Running Late by {trainStatus.delay}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Journey Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-white/75">
                    <span>{trainStatus.distanceCovered} km</span>
                    <span>{trainStatus.totalDistance} km</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/15">
                  <div>
                    <Label className="text-xs text-white/70">CURRENT STATION</Label>
                    <p className="font-medium">{trainStatus.currentStation}</p>
                    <p className="text-sm text-white/75">{trainStatus.currentStationTime}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-white/70">NEXT STATION</Label>
                    <p className="font-medium">{trainStatus.nextStation}</p>
                    <p className="text-sm text-white/75">{trainStatus.nextStationTime}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-white/70">AVERAGE SPEED</Label>
                    <p className="font-medium text-white">{trainStatus.avgSpeed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={glassCardClass}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-white" />
                  <span>Route Map</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mapsApiKey ? (
                  <Wrapper apiKey={mapsApiKey} render={renderMap} />
                ) : (
                  <div className="w-full h-96 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/25">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-white/75 mx-auto mb-2" />
                      <p className="text-sm text-white/75">Google Maps API key not configured</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={glassCardClass}>
              <CardHeader>
                <CardTitle>Station Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainStatus.stations.map((station: TimelineStation, index: number) => (
                    <div key={index} className="relative">
                      {index < trainStatus.stations.length - 1 && (
                        <div
                          className={`absolute left-2.5 top-8 w-0.5 h-12 ${station.status === "departed" ? "bg-emerald-300" : "bg-white/20"}`}
                        />
                      )}
                      <div className="flex items-start space-x-4">
                        {getStationIcon(station.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{station.name}</h4>
                              <p className="text-sm text-white/75">
                                Platform {station.platform} - {station.code}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-mono">
                                  {station.arrivalTime}
                                  {station.departureTime && station.departureTime !== station.arrivalTime && ` - ${station.departureTime}`}
                                </span>
                                <Badge variant="outline" className={`text-xs ${getDelayColor(station.delay)}`}>
                                  {station.delay}
                                </Badge>
                              </div>
                              <p className="text-xs text-white/70">{station.distance} km</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!trainStatus && !isSearching && !error && (
          <Card className={glassCardClass}>
            <CardContent className="py-10 text-center">
              <Clock className="h-12 w-12 text-white/70 mx-auto mb-4" />
              <p className="text-white/85">Live status will appear here once train details are available.</p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default LiveStatus;
