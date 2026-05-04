import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { 
  BellIcon, LogOutIcon, SettingsIcon, MenuIcon, XIcon, 
  MessageSquareIcon, HomeIcon, HeartIcon 
} from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests, getUnreadNotifications } from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const logout = useLogout();

  // Fetch friend requests for notification badge
  const { data: friendRequestsData } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  // Get unread notifications count
  const { data: unreadData } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: getUnreadNotifications,
    refetchInterval: 30000,
  });

  const incomingRequests = friendRequestsData?.incomingReqs || [];
  const friendRequestCount = incomingRequests.length;
  const notificationCount = unreadData?.friendRequests || friendRequestCount;
  const messageCount = unreadData?.messages || 0;

  // Profile Picture Helper
  const getProfilePic = () => {
    if (!authUser?.profilePic) {
      // Return gender-based placeholder
      if (authUser?.gender === "female") {
        return `https://avatar.iran.liara.run/public/10.png`; // Female placeholder
      }
      return `https://avatar.iran.liara.run/public/1.png`; // Male/default placeholder
    }
    if (authUser.profilePic.startsWith("http")) return authUser.profilePic;
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const cleanPath = authUser.profilePic.startsWith("/uploads") 
      ? authUser.profilePic 
      : `/uploads/${authUser.profilePic.replace(/^\//, "")}`;
    return `${baseURL}${cleanPath}`;
  };

  return (

    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT SECTION: Matchgle Branding */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <HeartIcon className="size-9 text-pink-500 fill-pink-500 animate-pulse" />
              <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 tracking-wider">
                Matchgle
              </span>
            </Link>
          </div>

          {/* RIGHT SECTION: Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Home */}
            <Link to="/" className="btn btn-ghost btn-circle" title="Home">
              <HomeIcon className="h-6 w-6 text-base-content opacity-70" />
            </Link>

            {/* Messages */}
            <Link to="/chat/all" className="relative" title="Messages">
              <button className="btn btn-ghost btn-circle">
                <MessageSquareIcon className="h-6 w-6 text-base-content opacity-70" />
                {messageCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-base-200 shadow-sm">
                    {messageCount > 9 ? "9+" : messageCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Notifications */}
            <Link to="/notifications" className="relative" title="Notifications">
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-base-200 shadow-sm">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Settings */}
            <Link to="/settings" title="Settings">
              <button className="btn btn-ghost btn-circle">
                <SettingsIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            {/* Profile Avatar */}
            <Link to="/edit-profile" title="Profile">
              <div className="relative">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-200 overflow-hidden bg-base-300">
                    <img
                      src={getProfilePic()}
                      alt="Profile"
                      className="object-cover w-full h-full"
                      onError={(e) => { 
                        e.target.src = `https://avatar.iran.liara.run/public/1.png`; 
                      }}
                    />
                  </div>
                </div>

                {authUser?.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-base-200 rounded-full"></span>
                )}
              </div>
            </Link>

            {/* Logout */}
            <button
              type="button"
              className="btn btn-ghost btn-sm text-error font-bold ml-1 hidden lg:flex"
              onClick={() => logout.logoutMutation()}
              title="Logout"
            >
              <LogOutIcon className="h-5 w-5 mr-1" />
              Logout
            </button>

            {/* Mobile menu button */}
            <button className="lg:hidden btn btn-ghost btn-circle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-base-300 bg-base-200">
            <div className="flex flex-col gap-2 px-2">
              <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-300" onClick={() => setMobileMenuOpen(false)}>
                <HomeIcon className="h-5 w-5 opacity-70" />
                <span className="font-bold">Home</span>
              </Link>

              <Link to="/chat/all" className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-300" onClick={() => setMobileMenuOpen(false)}>
                <MessageSquareIcon className="h-5 w-5 opacity-70" />
                <span className="font-bold">Messages</span>
                {messageCount > 0 && (
                  <span className="bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-black">{messageCount}</span>
                )}
              </Link>

              <Link to="/notifications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-300" onClick={() => setMobileMenuOpen(false)}>
                <BellIcon className="h-5 w-5 opacity-70" />
                <span className="font-bold">Notifications</span>
                {notificationCount > 0 && (
                  <span className="bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-black">{notificationCount}</span>
                )}
              </Link>

              <button type="button" className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-300 text-error font-bold" onClick={() => {
                logout.logoutMutation();
                setMobileMenuOpen(false);
              }}>
                <LogOutIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

