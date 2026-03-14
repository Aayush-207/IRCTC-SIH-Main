import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Train, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login Successful",
        description: "Welcome back to Indian Railways!",
      });
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.phone || !signupData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account Created Successfully",
        description: "Welcome to Indian Railways! Please login to continue.",
      });
    }, 1500);
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{
        backgroundImage: "url('https://t4.ftcdn.net/jpg/06/21/68/41/360_F_621684156_GHCg1koda7y1FKwCZ1WsuwIxk27Sezuh.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md">
        <div className={`text-center ${isSignup ? "mb-4" : "mb-6"}`}>
          <div className={`inline-flex items-center justify-center ${isSignup ? "w-14 h-14 mb-3" : "w-16 h-16 mb-4"} bg-white/20 backdrop-blur-sm rounded-xl border border-white/30`}>
            <Train className={`${isSignup ? "h-7 w-7" : "h-8 w-8"} text-white`} />
          </div>
          <h1 className={`${isSignup ? "text-3xl" : "text-4xl"} font-bold text-white mb-1`}>Indian Railways</h1>
          <p className={`${isSignup ? "text-sm" : "text-base"} text-white/90`}>Your gateway to seamless train travel</p>
        </div>

        <motion.div
          layout
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
        >
          <Card className="bg-white/82 backdrop-blur-md shadow-2xl border border-white/35 overflow-hidden">
            <CardContent className={isSignup ? "p-6" : "p-7"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isSignup ? "signup" : "login"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  layout
                >
                  {isSignup ? (
                    <>
                      <div className="text-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Create Account</h2>
                        <p className="text-sm text-gray-600">Join us for seamless train travel experience</p>
                      </div>

                      <form onSubmit={handleSignup} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-sm font-semibold text-gray-900">First Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="First name"
                                value={signupData.firstName}
                                onChange={(e) => setSignupData((prev) => ({ ...prev, firstName: e.target.value }))}
                                className="pl-10 h-10 bg-white/62 border-white/55 placeholder:text-gray-500 focus:border-primary/70 focus:ring-primary/30"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-sm font-semibold text-gray-900">Last Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Last name"
                                value={signupData.lastName}
                                onChange={(e) => setSignupData((prev) => ({ ...prev, lastName: e.target.value }))}
                                className="pl-10 h-10 bg-white/62 border-white/55 placeholder:text-gray-500 focus:border-primary/70 focus:ring-primary/30"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="signupEmail" className="text-sm font-semibold text-gray-900">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="signupEmail"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              value={signupData.email}
                              onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                              className="pl-10 h-10 bg-white/62 border-white/55 placeholder:text-gray-500 focus:border-primary/70 focus:ring-primary/30"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-sm font-semibold text-gray-900">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="Enter your phone number"
                              value={signupData.phone}
                              onChange={(e) => setSignupData((prev) => ({ ...prev, phone: e.target.value }))}
                              className="pl-10 h-10 bg-white/62 border-white/55 placeholder:text-gray-500 focus:border-primary/70 focus:ring-primary/30"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="signupPassword" className="text-sm font-semibold text-gray-900">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="signupPassword"
                              name="password"
                              type="password"
                              placeholder="Create a password"
                              value={signupData.password}
                              onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                              className="pl-10 h-10 bg-white/62 border-white/55 placeholder:text-gray-500 focus:border-primary/70 focus:ring-primary/30"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-10 bg-primary/95 hover:bg-primary text-white font-semibold rounded-lg transition-all duration-300 shadow-xl ring-1 ring-white/40"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                              <span>Creating account...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Sign up</span>
                              <ArrowRight className="h-5 w-5" />
                            </div>
                          )}
                        </Button>

                        <div className="text-center pt-0.5">
                          <p className="text-sm text-gray-700">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
                              Sign in
                            </Link>
                          </p>
                        </div>
                      </form>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-5">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
                        <p className="text-sm text-gray-600">Enter your credentials to access your account</p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4.5">
                        <div className="space-y-1.5">
                          <Label htmlFor="loginEmail" className="text-sm font-semibold text-gray-900">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="loginEmail"
                              type="email"
                              placeholder="Enter your email"
                              value={loginData.email}
                              onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                              className="pl-10 h-11 bg-white/62 border-white/55 placeholder:text-gray-500 focus:border-primary/70 focus:ring-primary/30"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="loginPassword" className="text-sm font-semibold text-gray-900">Password</Label>
                            <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium">
                              Forgot password?
                            </Link>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="loginPassword"
                              type="password"
                              placeholder="Enter your password"
                              value={loginData.password}
                              onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                              className="pl-10 h-11 bg-white/62 border-white/55 placeholder:text-gray-500 focus:border-primary/70 focus:ring-primary/30"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="mt-5 w-full h-11 bg-primary/95 hover:bg-primary text-white font-semibold rounded-lg transition-all duration-300 shadow-xl ring-1 ring-white/40"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                              <span>Signing in...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Sign in</span>
                              <ArrowRight className="h-5 w-5" />
                            </div>
                          )}
                        </Button>

                        <div className="text-center pt-0.5">
                          <p className="text-sm text-gray-700">
                            Don&apos;t have an account?{" "}
                            <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold">
                              Sign up
                            </Link>
                          </p>
                        </div>
                      </form>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <div className={`text-center ${isSignup ? "mt-4" : "mt-6"}`}>
          <p className="text-white/80 text-sm">Secure • Fast • Reliable</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
