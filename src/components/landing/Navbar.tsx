import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { Menu, X, Home, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onLogin?: () => void;
  onSignUp?: () => void;
}

const Navbar = ({ onLogin = () => {}, onSignUp = () => {} }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Documentation", href: "#documentation" },
  ];

  return (
    <nav className="w-full h-20 px-4 md:px-8 lg:px-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between overflow-x-hidden">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">
              AX
            </span>
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">
            AgentX AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Authentication Buttons */}
        <div className="hidden md:flex items-center space-x-2 md:space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <Home size={18} className="mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/chat")}
              >
                <MessageSquare size={18} className="mr-2" />
                Chat
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => navigate("/chat/settings")}
                    >
                      <AvatarImage
                        src={
                          user.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || "user"}`
                        }
                        alt={user.name || "User"}
                      />
                      <AvatarFallback>
                        {(user.name || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Profile Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={onLogin}>
                Log in
              </Button>
              <Button onClick={onSignUp}>Sign up</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{mobileMenuOpen ? "Close menu" : "Open menu"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ease-in-out z-40",
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10 pointer-events-none",
        )}
      >
        <div className="px-4 py-6 space-y-4">
          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Authentication Buttons */}
          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-start"
                  onClick={() => {
                    navigate("/");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Home size={18} className="mr-2" />
                  Home
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-start"
                  onClick={() => {
                    navigate("/chat");
                    setMobileMenuOpen(false);
                  }}
                >
                  <MessageSquare size={18} className="mr-2" />
                  Chat
                </Button>
                <div className="flex items-center space-x-3 mb-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || "user"}`
                      }
                      alt={user.name || "User"}
                    />
                    <AvatarFallback>
                      {(user.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {user.name || "User"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onLogin();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log in
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    onSignUp();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
