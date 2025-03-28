import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  HelpCircle,
  Code,
  Home,
  Database,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
  activePage?: string;
}

const Sidebar = ({
  userName = "John Doe",
  userEmail = "john.doe@example.com",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
  onLogout = () => {},
  activePage = "chat",
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isServiceNowOpen, setIsServiceNowOpen] = React.useState(false);

  // Check if current path is related to ServiceNow
  React.useEffect(() => {
    if (
      location.pathname.includes("/servicenow") ||
      location.pathname.includes("/settings/servicenow")
    ) {
      setIsServiceNowOpen(true);
    }
  }, [location.pathname]);

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
    // Demo page removed as per user request
  ];

  return (
    <div className="w-[280px] h-full flex flex-col bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      {/* User profile section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userEmail}
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
                location.pathname === item.path ||
                  (item.path !== "/chat" &&
                    location.pathname.startsWith(item.path))
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700",
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}

        {/* ServiceNow Section */}
        <Collapsible
          open={isServiceNowOpen}
          onOpenChange={setIsServiceNowOpen}
          className="mt-4"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between",
                location.pathname.includes("/servicenow") ||
                  location.pathname.includes("/settings/servicenow")
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700",
              )}
            >
              <span className="flex items-center">
                <Database size={20} className="mr-3" />
                ServiceNow
              </span>
              {isServiceNowOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1 mt-1">
            {servicenowItems.map((item) => (
              <Link to={item.path} key={item.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.path
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Button>
              </Link>
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
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={onLogout}
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out of your account</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Sidebar;
