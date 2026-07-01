import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Wrench, Eye, EyeOff, Gamepad2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
              <Wrench className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">GamingTech.pk</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Professional Gaming & Electronics Repair Management
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gamingtech.pk"
                  defaultValue="admin@gamingtech.pk"
                  required
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    defaultValue="password123"
                    required
                    className="bg-card pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Quick Access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button">
                Super Admin
              </Button>
              <Button variant="outline" type="button">
                Technician
              </Button>
              <Button variant="outline" type="button">
                Receptionist
              </Button>
              <Button variant="outline" type="button">
                Manager
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Need help? Contact{" "}
            <a href="mailto:support@gamingtech.pk" className="text-primary hover:underline">
              support@gamingtech.pk
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A] items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <Gamepad2 className="h-32 w-32 text-white" />
          </div>
          <div className="absolute bottom-20 right-20">
            <Wrench className="h-40 w-40 text-white" />
          </div>
          <div className="absolute top-1/2 left-1/3">
            <Gamepad2 className="h-24 w-24 text-white" />
          </div>
        </div>

        <div className="relative z-10 max-w-lg text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">
            Enterprise-Grade Repair Management
          </h2>
          <p className="text-lg text-gray-300">
            Streamline your gaming and electronics repair business with our comprehensive platform
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-gray-300">Repairs/Month</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-sm text-gray-300">Customer Satisfaction</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-sm text-gray-300">Active Customers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-sm text-gray-300">Branches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
