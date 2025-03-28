import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  History,
  Settings,
  LogOut,
  Database,
  ChevronDown,
  ChevronRight,
  Home,
  ChevronLeft,
  ChevronRightSquare,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CollapsibleSidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
  activePage?: string;
}

const CollapsibleSidebar = ({
  userName = "John Doe",
  userEmail = "john.doe@example.com",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
  onLogout = () => {},
  activePage = "chat",
}: CollapsibleSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isServiceNowOpen, setIsServiceNowOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if current path is related to ServiceNow
  useEffect(() => {
    if (
      location.pathname.includes("/servicenow") ||
      location.pathname.includes("/settings/servicenow")
    ) {
      setIsServiceNowOpen(true);
    }
  }, [location.pathname]);

  // Save sidebar state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
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
      path: "/chat/history",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      path: "/chat/settings",
    },
  ];

  const servicenowItems = [
    {
      id: "servicenow-settings",
      label: "ServiceNow Settings",
      icon: <Settings size={18} />,
      path: "/chat/settings/servicenow",
    },
  ];

  return (
    <div
      className={cn(
        "bg-orange-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out h-screen",
        isCollapsed ? "w-[60px]" : "w-[280px]",
      )}
    >
      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-3 right-[-16px] h-8 w-8 rounded-full bg-white border-2 border-orange-200 shadow-md z-50 flex items-center justify-center"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="text-orange-500" />
        ) : (
          <ChevronLeft size={16} className="text-orange-500" />
        )}
      </Button>

      {/* User profile section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3",
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userEmail}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700",
                  isCollapsed && "justify-center px-2",
                )}
                onClick={() => navigate("/")}
              >
                <span className={isCollapsed ? "" : "mr-3"}>
                  <Home size={20} />
                </span>
                {!isCollapsed && "Home"}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Home</TooltipContent>}
          </Tooltip>
        </TooltipProvider>

        {navItems.map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full",
                    isCollapsed ? "justify-center px-2" : "justify-start",
                    location.pathname === item.path ||
                      (item.path !== "/chat" &&
                        location.pathname.startsWith(item.path))
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <span className={isCollapsed ? "" : "mr-3"}>{item.icon}</span>
                  {!isCollapsed && item.label}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* ServiceNow Section */}
        <Collapsible
          open={!isCollapsed && isServiceNowOpen}
          onOpenChange={!isCollapsed ? setIsServiceNowOpen : undefined}
          className="mt-4"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full",
                      isCollapsed ? "justify-center px-2" : "justify-between",
                      location.pathname.includes("/servicenow") ||
                        location.pathname.includes("/settings/servicenow")
                        ? "bg-gray-200 dark:bg-gray-700"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700",
                    )}
                    onClick={() => {
                      if (isCollapsed) {
                        navigate("/chat/settings/servicenow");
                      }
                    }}
                  >
                    <span
                      className={cn(
                        "flex items-center",
                        isCollapsed ? "" : "mr-3",
                      )}
                    >
                      <Database
                        size={20}
                        className={isCollapsed ? "" : "mr-3"}
                      />
                      {!isCollapsed && "ServiceNow"}
                    </span>
                    {!isCollapsed &&
                      (isServiceNowOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      ))}
                  </Button>
                </CollapsibleTrigger>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">ServiceNow</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <CollapsibleContent className="pl-4 space-y-1 mt-1">
            {servicenowItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700",
                )}
                onClick={() => navigate(item.path)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      {/* Footer with logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
                  isCollapsed ? "justify-center px-2" : "justify-start",
                )}
                onClick={onLogout}
              >
                <LogOut size={20} className={isCollapsed ? "" : "mr-3"} />
                {!isCollapsed && "Sign Out"}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Sign Out</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;
