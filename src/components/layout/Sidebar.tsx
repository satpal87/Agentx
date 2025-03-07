import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, History, Settings, LogOut, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    {
      id: "chat",
      label: "Chat",
      icon: <MessageSquare size={20} />,
      path: "/chat",
    },
    {
      id: "history",
      label: "History",
      icon: <History size={20} />,
      path: "/history",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  if (!user) return null;

  return (
    <div
      className={cn(
        "w-[280px] h-full flex flex-col bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
        className,
      )}
    >
      {/* User profile section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                user.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
              }
              alt={user.name || "User"}
            />
            <AvatarFallback>{(user.name || "U").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => navigate("/")}
        >
          <span className="mr-3">
            <Home size={20} />
          </span>
          Home
        </Button>

        {navItems.map((item) => (
          <Link to={item.path} key={item.id}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive(item.path)
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700",
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Footer with logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
