import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import stationsData from "../../Backend/stations.json";

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
  
  // Directly load and parse stations from the imported JSON
  const stations: StationRecord[] = useMemo(() => {
    const raw = (Array.isArray((stationsData as any)?.stations) ? (stationsData as any).stations : stationsData) as any[];
    return raw.map((s: any) => ({
      stnName: s.stnName || s.name || s.station_name || "",
      stnCode: s.stnCode || s.code || s.station_code || "",
      stnCity: s.stnCity || s.city || s.district || "",
    })).filter((s: StationRecord) => s.stnCode && s.stnName);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return stations.slice(0, 10);
    }
    
    // Prioritize stations that start with the query
    const exactMatches: StationRecord[] = [];
    const startsWithMatches: StationRecord[] = [];
    const includesMatches: StationRecord[] = [];

    for (const s of stations) {
      const name = s.stnName.toLowerCase();
      const code = s.stnCode.toLowerCase();
      
      if (code === q || name === q) {
        exactMatches.push(s);
      } else if (name.startsWith(q) || code.startsWith(q)) {
        startsWithMatches.push(s);
      } else if (name.includes(q) || code.includes(q) || (s.stnCity && s.stnCity.toLowerCase().includes(q))) {
        includesMatches.push(s);
      }

      // Break early if we have enough results (performance optimization)
      if (exactMatches.length + startsWithMatches.length + includesMatches.length > 30) {
        break;
      }
    }

    return [...exactMatches, ...startsWithMatches, ...includesMatches].slice(0, 8);
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

  useEffect(() => {
    const matchingStation = stations.find(s => s.stnCode === valueCode);
    if (matchingStation && query !== `${matchingStation.stnName} (${matchingStation.stnCode})`) {
      setQuery(valueCode ? `${matchingStation.stnName} (${matchingStation.stnCode})` : "");
    }
  }, [valueCode, stations]);

  return (
    <div data-station-select-root className="relative">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          placeholder={placeholder || "Type station name or code"}
          value={query || valueCode}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onClick={() => setOpen(!open)}
          className="bg-white/95 text-slate-900 border-white/40 focus:border-cyan-500 shadow-sm placeholder:text-slate-400 font-medium cursor-pointer"
        />
        {open && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-2 overflow-y-auto max-h-60 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-xl custom-scrollbar">
            <div className="py-1">
              {suggestions.map((s) => (
                <button
                  key={s.stnCode + s.stnName}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-slate-100/80 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0 group"
                  onClick={() => {
                    onChangeCode(s.stnCode);
                    setQuery(`${s.stnName} (${s.stnCode})`);
                    setOpen(false);
                  }}
                >
                  <div className="bg-slate-100 p-2 rounded-full group-hover:bg-cyan-100 group-hover:text-cyan-700 text-slate-400 transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-700 text-sm">{s.stnName}</div>
                    <div className="text-xs font-semibold text-slate-500">{s.stnCode}{s.stnCity ? ` • ${s.stnCity}` : ''}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
