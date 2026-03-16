import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import viewstationBg from "@/assets/viewstation.jpg";

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
  const streetViewRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const streetViewInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null);

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

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="color: #000; font-weight: bold; padding: 5px;">${stationCoords.fullName}</div>`
      });

      const marker = new google.maps.Marker({
        position: { lat: stationCoords.lat, lng: stationCoords.lng },
        map: map,
        title: stationCoords.fullName,
        icon: "http://maps.google.com/mapfiles/ms/icons/cyan-dot.png"
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      infoWindow.open(map, marker);

      mapInstanceRef.current = map;
    } else if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      map.setCenter({ lat: stationCoords.lat, lng: stationCoords.lng });
    }
  }, [stationCoords]);

  // Initialize Street View
  useEffect(() => {
    if (streetViewRef.current && !streetViewInstanceRef.current) {
      const streetView = new google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: stationCoords.lat, lng: stationCoords.lng },
        pov: { heading: 120, pitch: 0 },
        zoom: 1,
        addressControl: true,
        linksControl: true,
        panControl: true,
        enableCloseButton: false
      });
      streetViewInstanceRef.current = streetView;
    } else if (streetViewInstanceRef.current) {
      streetViewInstanceRef.current.setPosition({ lat: stationCoords.lat, lng: stationCoords.lng });
    }
  }, [stationCoords]);

  const glassCardClass = "border border-white/20 bg-white/10 backdrop-blur-md text-white";

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Fixed Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(${viewstationBg})` }}
      />
      {/* Fixed Back Button - Top Left */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-20 flex items-center gap-0 py-3 pl-3 pr-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-300 overflow-hidden w-12 hover:w-auto group" 
        title="Back to Home"
      >
        <ArrowLeft className="h-5 w-5 flex-shrink-0" />
        <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap text-sm font-medium transition-opacity duration-300 ml-2">Back to Home</span>
      </button>
      {/* Overlay - only on background, not on content */}
      <div className="absolute inset-0 -z-10 bg-black/30 pointer-events-none" />

      {/* Scrollable Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="container mx-auto px-4 max-w-5xl pt-12 pb-10">

          {/* Header - with top padding for fixed button */}
          <div className="text-center mb-12 mt-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-2">
              View Station
            </h1>
            <p className="text-2xl md:text-3xl text-cyan-300 font-semibold">
              {stationCoords.fullName}
            </p>
          </div>

          {/* Station Details Text */}
          <div className="mb-6 px-4 text-center">
            <p className="text-white/70 text-base mb-2">
              <span className="font-semibold text-cyan-300">Location:</span> {stationCoords.fullName}
            </p>
            <p className="text-white/70 text-base mb-2">
              <span className="font-semibold text-cyan-300">Latitude:</span> {stationCoords.lat.toFixed(4)}°
            </p>
            <p className="text-white/70 text-base">
              <span className="font-semibold text-cyan-300">Longitude:</span> {stationCoords.lng.toFixed(4)}°
            </p>
          </div>

          {/* Map Card */}
          <Card className={glassCardClass + " mb-8"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-300" />
                <span>Station Location Map</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                className="w-full rounded-lg bg-gradient-to-br from-white/5 to-white/10 overflow-hidden"
                style={{ minHeight: "500px" }}
              />
            </CardContent>
          </Card>

          {/* Street View Card */}
          <Card className="border border-white/20 bg-white/10 text-white mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-300" />
                <span>Street View</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={streetViewRef}
                className="w-full rounded-lg overflow-hidden"
                style={{ minHeight: "500px" }}
              />
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="text-center text-white/60 text-sm">
            <p>Map powered by Google Maps • Coordinates in decimal format (WGS84)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStation;
