import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User } from "lucide-react";
import railwaysLogo from "@/assets/railways-logo.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  const isBookTicketsRoute = location.pathname === "/book-tickets";
  const isLiveStatusRoute = location.pathname === "/live-status";
  const isTransparentRoute = isHome || isAuthRoute || isBookTicketsRoute || isLiveStatusRoute;

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/?panel=live", label: "Live" },
    { href: "/?panel=pantry", label: "Pantry" },
    { href: "/?panel=view-station", label: "View Station" },
    { href: "/train-search", label: "Enquiries" },
  ];

  const isActive = (path: string) => {
    if (path.startsWith("/?panel=")) {
      const targetPanel = path.replace("/?panel=", "");
      return location.pathname === "/" && location.search.includes(`panel=${targetPanel}`);
    }
    return location.pathname === path;
  };

  return (
    <nav className={`${isTransparentRoute ? "fixed top-0 left-0 w-full" : "sticky top-0"} z-50 text-white ${isTransparentRoute ? "bg-transparent" : "bg-gradient-to-r from-primary to-railway-orange shadow-md"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={railwaysLogo} alt="Indian Railways" className="h-8 w-8 rounded-full" />
            <span className="text-xl font-bold">
              Indian Railways
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-black/35 ${isActive(item.href) ? "bg-black/45" : ""}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-white text-primary hover:bg-white/90 shadow-sm">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <img src={railwaysLogo} alt="Indian Railways" className="h-6 w-6 rounded-full" />
                  <span>Indian Railways</span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-2">
                {navItems.map((item) => {
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className="w-full justify-start"
                      >
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
                <div className="pt-4 border-t space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-railway-orange hover:bg-railway-orange/90">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;