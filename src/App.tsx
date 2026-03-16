import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import BookTickets from "./pages/BookTickets";
import TrainSearch from "./pages/TrainSearch";
import PantryCart from "./pages/PantryCart";
import PNRStatus from "./pages/PNRStatus";
import LiveStatus from "./pages/LiveStatus";
import AtStation from "./pages/AtStation";
import AskDisha from "./pages/AskDisha";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AskDishaFab from "./components/AskDishaFab";
import ViewStation from "./pages/ViewStation";

const queryClient = new QueryClient();

const ROUTE_ORDER = [
  "/",
  "/book-tickets",
  "/pantry-cart",
  "/train-search",
  "/live-status",
  "/pnr-status",
  "/at-station",
  "/ask-disha",
  "/view-station",
  "/login",
  "/signup",
];

const AnimatedRoutes = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  const hideNavbar = location.pathname === "/view-station" || location.pathname === "/live-status";
  const previousPathRef = useRef(location.pathname);
  const directionRef = useRef(1);

  if (previousPathRef.current !== location.pathname) {
    const previousIndex = ROUTE_ORDER.indexOf(previousPathRef.current);
    const nextIndex = ROUTE_ORDER.indexOf(location.pathname);

    if (previousIndex !== -1 && nextIndex !== -1) {
      directionRef.current = nextIndex >= previousIndex ? 1 : -1;
    }

    previousPathRef.current = location.pathname;
  }

  const direction = directionRef.current;

  const initial = prefersReducedMotion || isAuthRoute ? { opacity: 1, x: 0 } : { opacity: 0, x: direction === 1 ? -72 : 72 };
  const animate = { opacity: 1, x: 0 };
  const exit = prefersReducedMotion || isAuthRoute ? { opacity: 1, x: 0 } : { opacity: 0, x: direction === 1 ? 72 : -72 };
  const routeTransitionKey = isAuthRoute ? "auth" : location.pathname;

  return (
    <>
      {!hideNavbar && <Navigation />}
      <main className="route-transition-viewport">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={routeTransitionKey}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="route-transition-shell"
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/book-tickets" element={<BookTickets />} />
              <Route path="/pantry-cart" element={<PantryCart />} />
              <Route path="/train-search" element={<TrainSearch />} />
              <Route path="/live-status" element={<LiveStatus />} />
              <Route path="/pnr-status" element={<PNRStatus />} />
              <Route path="/at-station" element={<AtStation />} />
              <Route path="/ask-disha" element={<AskDisha />} />
              <Route path="/view-station" element={<ViewStation />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
};

const AppRoutes = () => (
  <BrowserRouter>
    <AnimatedRoutes />
    <AskDishaFab />
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
