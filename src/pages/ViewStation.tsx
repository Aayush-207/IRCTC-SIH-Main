import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Station coordinates mapping (major Indian railway stations)
const STATION_COORDINATES: Record<string, { lat: number; lng: number; fullName: string }> = {
  "DADAR": { lat: 19.0183, lng: 72.8423, fullName: "Dadar Railway Station, Mumbai" },
  "VICTORIA TERMINUS": { lat: 18.9641, lng: 72.8345, fullName: "Victoria Terminus Station, Mumbai" },
  "HOWRAH JN": { lat: 22.5958, lng: 88.2624, fullName: "Howrah Junction, Kolkata" },
  "NEW DELHI": { lat: 28.5431, lng: 77.1025, fullName: "New Delhi Railway Station" },
  "CENTRAL": { lat: 18.9676, lng: 72.8194, fullName: "Central Railway Station, Mumbai" },
  "BORIVALI": { lat: 19.2183, lng: 72.8091, fullName: "Borivali Railway Station, Mumbai" },
  "VIRAR": { lat: 19.4649, lng: 72.7858, fullName: "Virar Railway Station, Mumbai" },
  "CHURCHGATE": { lat: 18.9568, lng: 72.8237, fullName: "Churchgate Railway Station, Mumbai" },
  "BANDRA": { lat: 19.0596, lng: 72.8295, fullName: "Bandra Railway Station, Mumbai" },
  "THANE": { lat: 19.2183, lng: 72.9789, fullName: "Thane Railway Station, Mumbai" },
  "PUNE JN": { lat: 18.5272, lng: 73.85, fullName: "Pune Junction Railway Station" },
  "BANGALORE": { lat: 12.972, lng: 77.5936, fullName: "Bangalore City Railway Station" },
  "HYDERABAD": { lat: 17.3703, lng: 78.4734, fullName: "Hyderabad Deccan Railway Station" },
  "KOLKATA": { lat: 22.5593, lng: 88.3391, fullName: "Kolkata Railway Station" },
  "INDORE JN": { lat: 22.7196, lng: 75.8615, fullName: "Indore Junction Railway Station" },
  "BHOPAL JN": { lat: 23.1825, lng: 77.4625, fullName: "Bhopal Junction Railway Station" },
  "DELHI": { lat: 28.6431, lng: 77.3025, fullName: "Delhi Railway Station" },
  "NAGPUR": { lat: 21.1458, lng: 79.0882, fullName: "Nagpur Railway Station" },
  "LUCKNOW": { lat: 26.8406, lng: 80.9267, fullName: "Lucknow Junction Railway Station" },
  "JAIPUR": { lat: 26.8124, lng: 75.8431, fullName: "Jaipur Junction Railway Station" },
};

const ViewStation = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const stationQuery = params.get("station") || "DADAR";
  const stationKey = Object.keys(STATION_COORDINATES).find(
    k => k.toLowerCase() === stationQuery.trim().toUpperCase()
  );
  const stationCoords = stationKey ? STATION_COORDINATES[stationKey] : STATION_COORDINATES["DADAR"];

  // Initialize Google Map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: stationCoords.lat, lng: stationCoords.lng },
        styles: [
          { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
          { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#22b3c1" }, { lightness: 10 }] },
          { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#22b3c1" }, { lightness: 20 }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#22b3c1" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1929" }] }
        ]
      });

      new google.maps.Marker({
        position: { lat: stationCoords.lat, lng: stationCoords.lng },
        map: map,
        title: stationCoords.fullName,
        icon: "http://maps.google.com/mapfiles/ms/icons/cyan-dot.png"
      });

      mapInstanceRef.current = map;
    } else if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      map.setCenter({ lat: stationCoords.lat, lng: stationCoords.lng });
    }
  }, [stationCoords]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(34, 179, 193, 0.15) 100%)`, backgroundColor: "#0f172a" }}>
      <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-white">IRCTC Railways</h1>
          <div className="w-32"></div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">View Station</h1>
          <p className="text-xl md:text-2xl text-cyan-300 font-semibold">{stationCoords.fullName}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-xl p-8 mb-8 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Station Details
              </h2>
              <p className="text-white/80 text-base mb-3"><span className="font-semibold text-white">Name:</span> {stationCoords.fullName}</p>
              <p className="text-white/80 text-base mb-3"><span className="font-semibold text-white">Latitude:</span> {stationCoords.lat.toFixed(4)}°</p>
              <p className="text-white/80 text-base"><span className="font-semibold text-white">Longitude:</span> {stationCoords.lng.toFixed(4)}°</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Quick Info</h2>
              <p className="text-white/70 text-sm mb-4">This station is displayed on an interactive Google Map below. You can zoom in/out, drag to explore the surrounding areas, and see the exact location of the railway station.</p>
              <p className="text-white/70 text-sm">The marker indicates the precise station location for reference.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-xl overflow-hidden shadow-2xl mb-8">
          <div ref={mapRef} className="w-full bg-gradient-to-br from-white/5 to-white/10" style={{ minHeight: "450px" }} />
        </div>

        <div className="text-center">
          <p className="text-white/60 text-sm">Map powered by Google Maps • Coordinates in decimal format (WGS84)</p>
        </div>
      </div>
    </div>
  );
};

export default ViewStation;
