import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export type StationRecord = {
  stnName: string;
  stnCode: string;
  stnCity?: string;
};

type StationSelectProps = {
  label: string;
  placeholder?: string;
  valueCode: string;
  onChangeCode: (code: string) => void;
};

export default function StationSelect({ label, placeholder, valueCode, onChangeCode }: StationSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState<StationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch stations from API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/Backend/stations.json');
        const data = await response.json();
        
        const raw = (Array.isArray(data?.stations) ? data.stations : data) as any[];
        const parsed = raw.map((s: any) => ({
          stnName: s.stnName || s.name || s.station_name || "",
          stnCode: s.stnCode || s.code || s.station_code || "",
          stnCity: s.stnCity || s.city || s.district || "",
        })).filter((s: StationRecord) => s.stnCode && s.stnName);
        
        setStations(parsed);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch stations:", error);
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // When query is empty, return first 15 stations
      return stations.slice(0, 15);
    }
    // Filter stations based on query
    return stations.filter((s) =>
      s.stnName.toLowerCase().includes(q) ||
      s.stnCode.toLowerCase().includes(q) ||
      (s.stnCity || "").toLowerCase().includes(q)
    ).slice(0, 15);
  }, [query, stations]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.("[data-station-select-root]")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Reset query when valueCode changes (e.g., from swap button)
  useEffect(() => {
    const matchingStation = stations.find(s => s.stnCode === valueCode);
    if (matchingStation && query !== `${matchingStation.stnName} (${matchingStation.stnCode})`) {
      setQuery(valueCode ? `${matchingStation.stnName} (${matchingStation.stnCode})` : "");
    }
  }, [valueCode, stations]);

  return (
    <div data-station-select-root>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          placeholder={loading ? "Loading stations..." : (placeholder || "Type station name or code")}
          value={query || valueCode}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={loading}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-cyan-600 border-t-transparent rounded-full"></div>
          </div>
        )}
        {open && suggestions.length > 0 && !loading && (
          <Card className="absolute z-20 w-full mt-1 max-h-72 overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 shadow-2xl backdrop-blur-md">
            <div className="p-3 text-xs font-semibold text-cyan-300 bg-black/20 border-b border-cyan-500/20">
              {`📍 Available Stations - ${suggestions.length} result(s)`}
            </div>
            <div>
              {suggestions.map((s) => (
                <button
                  key={s.stnCode + s.stnName}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-cyan-600/20 border-b border-slate-700/50 text-white transition-all duration-200 hover:border-cyan-500/30 group"
                  onClick={() => {
                    onChangeCode(s.stnCode);
                    setQuery(`${s.stnName} (${s.stnCode})`);
                    setOpen(false);
                  }}
                >
                  <div className="font-semibold text-white group-hover:text-cyan-200">{s.stnName}</div>
                  <div className="text-xs text-cyan-300/70 group-hover:text-cyan-200">{s.stnCode}{s.stnCity ? ` • ${s.stnCity}` : ''}</div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
