import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./BookTickets.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Calendar, Clock, Train, Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StationSelect from "@/components/StationSelect";
import bookingBg from "@/assets/Booking.jpg";

type BookingStep = 'search' | 'trains' | 'seats' | 'passenger' | 'payment';

type SelectedContext = {
  classCode?: string;
};

const COACH_BAY_COUNT = 10;
const SEATS_PER_BAY = 8;
const TOTAL_COACH_SEATS = COACH_BAY_COUNT * SEATS_PER_BAY;
const BACK_BUTTON_CLASS = "bg-white/10 border-white/35 text-white hover:bg-white/20 backdrop-blur-sm";

const BookTickets = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<BookingStep>('search');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    class: '',
    selectedTrain: null as any,
    selectedSeats: [] as string[],
    passengers: [{ name: '', age: '', gender: '' }],
  });
  const [selectedContext, setSelectedContext] = useState<SelectedContext>({});
  const [trains, setTrains] = useState<any[]>([]);
  const [loadingTrains, setLoadingTrains] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Stable booked seats generated once per train/class/date
  const [bookedSeats, setBookedSeats] = useState<Set<string> | null>(null);

  // Seeded PRNG (xorshift32-like) based on string seed
  const seededRandom = (seedString: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedString.length; i++) {
      h ^= seedString.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    let state = h || 1;
    return () => {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      // Convert to [0,1)
      return ((state >>> 0) % 1000000) / 1000000;
    };
  };

  const initializeBookedSeats = (totalSeats: number) => {
    const trainNo = formData.selectedTrain?.number || formData.selectedTrain?.id || '0';
    const classCode = selectedContext.classCode || 'GEN';
    const seed = `${trainNo}-${classCode}-${formData.date}`;
    const rand = seededRandom(seed);
    const numBooked = Math.floor(totalSeats * 0.25); // 25% booked for visualization
    const chosen = new Set<number>();
    while (chosen.size < numBooked) {
      const seatIndex = Math.floor(rand() * totalSeats) + 1; // 1..totalSeats
      chosen.add(seatIndex);
    }
    const asIds = new Set<string>(Array.from(chosen).map((n) => `S${n}`));
    setBookedSeats(asIds);
  };

  useEffect(() => {
    // Initialize booked seats when entering seats view or when dependencies change
    if (step === 'seats') {
      if (!bookedSeats) {
        initializeBookedSeats(TOTAL_COACH_SEATS);
      }
    } else if (bookedSeats) {
      // Reset when leaving seats to avoid leaking previous state for a new selection
      setBookedSeats(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, formData.selectedTrain, selectedContext.classCode, formData.date]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from') || '';
    const to = params.get('to') || '';
    const date = params.get('date') || '';

    if (from || to || date) {
      setFormData((prev) => ({ ...prev, from, to, date }));
      if (from && to && date) {
        setStep('trains');
        fetchTrains(from, to, date);
      }
    }
  }, []);

  const isStationCode = (s: string) => /^[A-Z]{2,4}$/.test(s.trim().toUpperCase());

  const hasAvailabilityFields = (value: any) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    return Boolean(
      value.fare !== undefined ||
      value.availabilityDisplayName !== undefined ||
      value.availability !== undefined ||
      value.prediction !== undefined ||
      value.chance !== undefined ||
      value.probability !== undefined
    );
  };

  const pickAvailabilityPayload = (value: any, journeyDateKey: string, depth = 0): any => {
    if (!value || depth > 4) return null;

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = pickAvailabilityPayload(item, journeyDateKey, depth + 1);
        if (found) return found;
      }
      return null;
    }

    if (typeof value !== "object") return null;

    if (hasAvailabilityFields(value)) return value;

    if (journeyDateKey && value[journeyDateKey]) {
      const byDate = pickAvailabilityPayload(value[journeyDateKey], journeyDateKey, depth + 1);
      if (byDate) return byDate;
    }

    for (const nested of Object.values(value)) {
      const found = pickAvailabilityPayload(nested, journeyDateKey, depth + 1);
      if (found) return found;
    }

    return null;
  };

  const getClassAvailabilityData = (train: any, classType: string, journeyDateKey: string) => {
    const isTatkal = classType.endsWith("_TQ");
    const classKey = classType.replace(/_TQ$/, "");

    const primaryRoot = isTatkal ? train.availabilityCacheTatkal : train.availabilityCache;
    const secondaryRoot = isTatkal ? train.availabilityCache : train.availabilityCacheTatkal;

    const candidates = [
      primaryRoot?.[classType],
      primaryRoot?.[classKey],
      secondaryRoot?.[classType],
      secondaryRoot?.[classKey],
    ];

    for (const candidate of candidates) {
      const parsed = pickAvailabilityPayload(candidate, journeyDateKey);
      if (parsed) return parsed;
    }

    return null;
  };

  const getFareText = (rawFare: any) => {
    if (rawFare === null || rawFare === undefined || rawFare === "") return "N/A";
    const numeric = Number(String(rawFare).replace(/,/g, ""));
    if (Number.isFinite(numeric) && numeric > 0) return `₹${numeric}`;
    return String(rawFare);
  };

  const fetchTrains = async (fromCode: string, toCode: string, dateISO: string) => {
    setLoadingTrains(true);
    setError(null);
    setTrains([]);

    try {
      const date = new Date(dateISO);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const indianFormatDate = `${day}-${month}-${year}`;

      const apiUrl = `https://cttrainsapi.confirmtkt.com/api/v1/trains/search?sourceStationCode=${fromCode}&destinationStationCode=${toCode}&addAvailabilityCache=true&excludeMultiTicketAlternates=false&excludeBoostAlternates=false&sortBy=DEFAULT&dateOfJourney=${indianFormatDate}&enableNearby=true&enableTG=true&tGPlan=CTG-3&showTGPrediction=false&tgColor=DEFAULT&showPredictionGlobal=true`;
      const res = await fetch(apiUrl);
      const json = await res.json();
      const list = json?.data?.trainList || [];

      const mapped = list.map((t: any) => {
        const cacheClasses = Object.keys(t.availabilityCache || {});
        const tatkalClasses = Object.keys(t.availabilityCacheTatkal || {}).map((k) => `${k}_TQ`);
        const allClasses = Array.from(new Set([...(t.avlClassesSorted || []), ...cacheClasses, ...tatkalClasses]));

        const classes = allClasses.map((classType: string) => {
          const data = getClassAvailabilityData(t, classType, indianFormatDate) || {};
          const prediction = data.prediction ?? data.chance ?? data.probability ?? data.confirmationChance ?? "N/A";

          return {
            code: classType,
            fareText: getFareText(data.fare ?? data.ticketFare ?? data.totalFare ?? data.price),
            availability: data.availabilityDisplayName ?? data.availability ?? data.status ?? "N/A",
            prediction: String(prediction),
          };
        });
        return {
          id: t.trainNumber,
          name: t.trainName,
          number: t.trainNumber,
          departure: t.departureTime,
          arrival: t.arrivalTime,
          duration: `${Math.floor((t.duration||0)/60)}h ${(t.duration||0)%60}m`,
          hasPantry: t.hasPantry,
          classes,
          raw: t,
        };
      });

      setTrains(mapped);
    } catch (e: any) {
      setError(e?.message || 'Unable to fetch trains.');
    } finally {
      setLoadingTrains(false);
    }
  };

  const handleSearch = () => {
    if (!formData.from || !formData.to || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const fromCode = formData.from.trim().toUpperCase();
    const toCode = formData.to.trim().toUpperCase();

    if (!isStationCode(fromCode) || !isStationCode(toCode)) {
      toast({
        title: "Invalid station code",
        description: "Please enter valid station codes (e.g., NDLS, BCT)",
        variant: "destructive"
      });
      return;
    }

    setStep('trains');
    fetchTrains(fromCode, toCode, formData.date);
  };

  const handleClassClick = (train: any, classCode: string) => {
    setSelectedContext({ classCode });
    setFormData({ ...formData, selectedTrain: train });
    setStep('seats');
  };

  const renderSearchForm = () => (
    <Card className="booking-glass-card w-full max-w-[1300px] mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Train className="h-5 w-5 text-primary" />
          <span>Book Train Tickets</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 md:px-10 pb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <StationSelect
            label="From Station"
            placeholder="Type name or code (e.g., New Delhi or NDLS)"
            valueCode={formData.from}
            onChangeCode={(code) => setFormData({ ...formData, from: code })}
          />
          <StationSelect
            label="To Station"
            placeholder="Type name or code (e.g., Mumbai Central or BCT)"
            valueCode={formData.to}
            onChangeCode={(code) => setFormData({ ...formData, to: code })}
          />
        </div>

        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setFormData(prev => ({...prev, from: prev.to, to: prev.from}))}>
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Journey Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Class</Label>
            <div className="text-sm text-muted-foreground">All classes will be shown after search</div>
          </div>
        </div>

        <Button onClick={handleSearch} className="w-full bg-gradient-primary">
          Search Trains
        </Button>
      </CardContent>
    </Card>
  );

  const renderTrainList = () => (
    <div className="max-w-6xl mx-auto space-y-6 px-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" className={BACK_BUTTON_CLASS} onClick={() => navigate('/')}>
          ← Back to Home
        </Button>
        <p className="text-muted-foreground">
          {formData.from} → {formData.to} • {formData.date}
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-6">
        {loadingTrains && (
          <Card className="booking-glass-card shadow-card">
            <CardContent className="p-6">Loading trains...</CardContent>
          </Card>
        )}
        {!loadingTrains && trains.length === 0 && !error && (
          <Card className="booking-glass-card shadow-card">
            <CardContent className="p-6">No trains found.</CardContent>
          </Card>
        )}
        {trains.map((train) => (
          <Card key={train.id} className="booking-glass-card shadow-card border-2 hover:shadow-railway hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900">{train.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">#{train.number}</p>
                    {train.hasPantry && (
                      <p className="text-xs mt-2 px-2 py-1 bg-orange-50 text-orange-700 rounded-full inline-block">🍽️ Pantry Available</p>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">{train.departure} - {train.arrival}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{train.duration}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground font-medium">Select a class to continue</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {train.classes.map((cls: any) => (
                    <button
                      key={cls.code}
                      className={`booking-inner-glass w-full border-2 rounded-xl p-4 text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-primary/30 ${
                        (cls.availability || '').toLowerCase().includes('wl') || (cls.availability || '').toLowerCase().includes('not')
                                                     ? 'border-railway-orange hover:bg-railway-orange/10 hover:border-railway-orange hover:ring-railway-orange/30'
                           : 'border-success hover:bg-success/10 hover:border-success hover:ring-success/30'
                      }`}
                      onClick={() => handleClassClick(train, cls.code)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-lg">{cls.code}</div>
                        <div className="text-lg font-semibold text-primary">{cls.fareText}</div>
                      </div>
                      <div className="text-sm mt-2 font-medium">{cls.availability}</div>
                      <div className="text-xs text-muted-foreground mt-1">Chance: {cls.prediction}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSeatSelection = () => (
    <>
    <Card className="booking-glass-card w-full max-w-[1400px] mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Select Seats - {formData.selectedTrain?.name}{selectedContext.classCode ? ` • ${selectedContext.classCode}` : ''}</CardTitle>
          <Button
            variant="outline"
            onClick={() => setStep('trains')}
            className={BACK_BUTTON_CLASS}
          >
            ← Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 md:px-10 pb-8">
          <div className="booking-inner-glass p-1 md:p-2 rounded-xl border border-white/35">
            <div className="coach-orientation-wrap -mt-3">
              <div className="coach-shell-vertical">
                <div className="flex items-center justify-between mb-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="border rounded px-2 py-1 bg-white/20">TOILET</div>
                    <span>COACH ENTRY/EXIT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>COACH ENTRY/EXIT</span>
                    <div className="border rounded px-2 py-1 bg-white/20">TOILET</div>
                  </div>
                </div>
                <div className="coach-layout flex flex-col gap-0 mx-auto max-w-[320px] border border-slate-500 rounded-md p-2 overflow-hidden">
                  {Array.from({ length: COACH_BAY_COUNT }, (_, bayIndex) => {
                    const base = bayIndex * 8;
                    const rightSide = [
                      { n: base + 7, t: 'SL' },
                      { n: base + 8, t: 'SU' },
                    ];
                    const isBooked = (seatId: string) => bookedSeats?.has(seatId) ?? false;
                    const renderSeat = (seat: { n: number; t: string }, options?: { rotate?: boolean }) => {
                      const seatId = `S${seat.n}`;
                      const selected = formData.selectedSeats.includes(seatId);
                      return (
                        <Button
                          key={seatId}
                          variant="ghost"
                          size="sm"
                          className={`seat-btn h-12 w-12 p-0 bg-transparent border-0 shadow-none`}
                          disabled={isBooked(seatId)}
                          onClick={() => {
                            if (selected) {
                              setFormData({
                                ...formData,
                                selectedSeats: formData.selectedSeats.filter((s) => s !== seatId),
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedSeats: [...formData.selectedSeats, seatId],
                              });
                            }
                          }}
                        >
                          <div className={`seat ${options?.rotate ? 'seat--rotated' : ''} ${selected ? 'seat--selected' : ''} ${isBooked(seatId) ? 'seat--booked' : ''}`}>
                            <span className={`seat-number ${selected ? 'seat-number--on-dark' : ''}`}>{seat.n}</span>
                          </div>
                        </Button>
                      );
                    };
                    return (
                      <div key={bayIndex} className="grid grid-cols-[1fr_auto_auto] gap-3 items-stretch">
                        <div className="grid grid-rows-2 gap-8">
                          <div className="grid grid-cols-3 gap-0 items-center justify-center">
                            {renderSeat({ n: base + 1, t: 'LB' }, { rotate: true })}
                            {renderSeat({ n: base + 2, t: 'MB' }, { rotate: true })}
                            {renderSeat({ n: base + 3, t: 'UB' }, { rotate: true })}
                          </div>
                          <div className="grid grid-cols-3 gap-0 items-center justify-center">
                            {renderSeat({ n: base + 4, t: 'LB' })}
                            {renderSeat({ n: base + 5, t: 'MB' })}
                            {renderSeat({ n: base + 6, t: 'UB' })}
                          </div>
                        </div>
                        <div className="bg-border w-12 md:w-16 rounded-none my-0 self-stretch" aria-label="Corridor" />
                        <div className="grid grid-rows-2 gap-8">
                          {renderSeat(rightSide[0], { rotate: true })}
                          {renderSeat(rightSide[1])}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="border rounded px-2 py-1 bg-white/20">TOILET</div>
                    <span>COACH ENTRY/EXIT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>COACH ENTRY/EXIT</span>
                    <div className="border rounded px-2 py-1 bg-white/20">TOILET</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>

    <Card className="booking-glass-card w-full max-w-[1400px] mx-auto mt-6">
      <CardContent className="space-y-6 p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="booking-inner-glass space-y-4 p-5 md:p-6 border border-white/35 rounded-lg">
              <div className="font-semibold">Details</div>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <span>Selected</span>
                  </div>
                  <span className="text-muted-foreground">{formData.selectedSeats.length > 0 ? formData.selectedSeats.join(', ') : '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-slate-400 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-semibold">Selected: {formData.selectedSeats.length} seat(s)</p>
                </div>
              </div>
            </div>

            <div className="booking-inner-glass space-y-4 p-5 md:p-6 border border-white/35 rounded-lg">
              <div className="font-semibold">Passenger Details</div>
              <div className="space-y-3 text-sm">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Enter full name"
                    value={formData.passengers[0]?.name || ''}
                    onChange={(e) => {
                      const newPassengers = [...formData.passengers];
                      newPassengers[0] = { ...newPassengers[0], name: e.target.value };
                      setFormData({ ...formData, passengers: newPassengers });
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      placeholder="Age"
                      value={formData.passengers[0]?.age || ''}
                      onChange={(e) => {
                        const newPassengers = [...formData.passengers];
                        newPassengers[0] = { ...newPassengers[0], age: e.target.value };
                        setFormData({ ...formData, passengers: newPassengers });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={formData.passengers[0]?.gender || ''}
                      onValueChange={(value) => {
                        const newPassengers = [...formData.passengers];
                        newPassengers[0] = { ...newPassengers[0], gender: value };
                        setFormData({ ...formData, passengers: newPassengers });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              const p = formData.passengers[0];
              if (!p?.name || !p?.age || !p?.gender) {
                toast({
                  title: "Missing Passenger Details",
                  description: "Please fill Name, Age and Gender before continuing",
                  variant: "destructive",
                });
                return;
              }
              setStep('payment');
            }}
            className="w-full"
            disabled={formData.selectedSeats.length === 0}
          >
            Continue to Payment
          </Button>
      </CardContent>
    </Card>
    </>
  );

  const renderPassengerDetails = () => (
    <Card className="booking-glass-card max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Passenger Details</span>
          </CardTitle>
          <Button variant="outline" className={BACK_BUTTON_CLASS} onClick={() => setStep('seats')}>
            ← Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.passengers.map((passenger, index) => (
          <div key={index} className="booking-inner-glass p-4 border border-white/35 rounded-lg space-y-4">
            <h4 className="font-semibold">Passenger {index + 1}</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter full name"
                  value={passenger.name}
                  onChange={(e) => {
                    const newPassengers = [...formData.passengers];
                    newPassengers[index].name = e.target.value;
                    setFormData({ ...formData, passengers: newPassengers });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="Age"
                  value={passenger.age}
                  onChange={(e) => {
                    const newPassengers = [...formData.passengers];
                    newPassengers[index].age = e.target.value;
                    setFormData({ ...formData, passengers: newPassengers });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select 
                  value={passenger.gender}
                  onValueChange={(value) => {
                    const newPassengers = [...formData.passengers];
                    newPassengers[index].gender = value;
                    setFormData({ ...formData, passengers: newPassengers });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <Button onClick={() => setStep('payment')} className="w-full">
          Continue to Payment
        </Button>
      </CardContent>
    </Card>
  );

  const renderPayment = () => (
    <Card className="booking-glass-card max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment</span>
          </CardTitle>
          <Button variant="outline" className={BACK_BUTTON_CLASS} onClick={() => setStep('seats')}>
            ← Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="booking-inner-glass p-4 rounded-lg border border-white/35">
          <h4 className="font-semibold mb-4">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Train:</span>
              <span>{formData.selectedTrain?.name} (#{formData.selectedTrain?.number})</span>
            </div>
            <div className="flex justify-between">
              <span>Route:</span>
              <span>{formData.from} → {formData.to}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formData.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Class:</span>
              <span>{selectedContext.classCode || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Seats:</span>
              <span>{formData.selectedSeats.join(', ')}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total Amount:</span>
              <span>₹{(formData.selectedTrain?.price * formData.selectedSeats.length) || 0}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Button className="w-full bg-gradient-primary">
            Pay with UPI
          </Button>
          <Button variant="outline" className="w-full">
            Debit/Credit Card
          </Button>
          <Button variant="outline" className="w-full">
            Net Banking
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="book-tickets-page min-h-screen">
      <div
        className="book-tickets-bg"
        style={{ backgroundImage: `url(${bookingBg})` }}
        aria-hidden="true"
      />
      <div className="book-tickets-overlay" aria-hidden="true" />
      <div className="book-tickets-scroll">
        <div className="book-tickets-content container mx-auto px-4 pt-24 pb-8">
          {step === 'search' && renderSearchForm()}
          {step === 'trains' && renderTrainList()}
          {step === 'seats' && renderSeatSelection()}
          {step === 'passenger' && renderPassengerDetails()}
          {step === 'payment' && renderPayment()}
        </div>
      </div>
    </div>
  );
};

export default BookTickets;