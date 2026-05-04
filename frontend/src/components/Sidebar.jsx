import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HeartIcon, UsersIcon, MessageSquareIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadCounts, setUnreadCounts] = useState({}); // { friendId: count }
  const [totalUnread, setTotalUnread] = useState(0);

  // Fetch friends for the sidebar list
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Set up Stream Chat event listeners for unread counts
  useEffect(() => {
    if (!authUser?._id) return;

    const client = StreamChat.getInstance(STREAM_API_KEY);

    const handleMessageNew = (event) => {
      const { cid, unread_messages } = event;
      if (!cid || unread_messages === undefined) return;

      // Parse channel ID to get participant IDs
      // Channel ID format: "messaging-{id1}-{id2}"
      const parts = cid.split(":");
      if (parts.length < 2) return;
      const channelId = parts[1];
      const participantIds = channelId.split("-").slice(1); // remove "messaging"
      const senderId = event.message?.user?.id;

      // Find which friend sent this message (not us)
      const friendId = participantIds.find(id => id !== authUser._id && senderId === id);
      if (friendId) {
        setUnreadCounts(prev => {
          const newCounts = { ...prev };
          newCounts[friendId] = (newCounts[friendId] || 0) + 1;

          // Update total
          let total = 0;
          Object.values(newCounts).forEach(c => total += c);
          setTotalUnread(total);

          return newCounts;
        });
      }
    };

    const listener = client.on('message.new', handleMessageNew);

    // Initial total count from client
    if (client.user?.unread_count !== undefined) {
      setTotalUnread(client.unread_count || 0);
    }

    return () => {
      listener.unsubscribe();
    };
  }, [authUser?._id]);

  // Listen for mark messages read event from ChatPage
  useEffect(() => {
    const handleMarkRead = (e) => {
      const { friendId } = e.detail;
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        if (newCounts[friendId]) {
          delete newCounts[friendId];
          let total = 0;
          Object.values(newCounts).forEach(c => total += c);
          setTotalUnread(total);
        }
        return newCounts;
      });
    };

    window.addEventListener("markMessagesRead", handleMarkRead);
    return () => window.removeEventListener("markMessagesRead", handleMarkRead);
  }, []);

  // Mark unread as read when navigating to a chat
  const markRead = useCallback((friendId) => {
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      if (newCounts[friendId]) {
        delete newCounts[friendId];
        let total = 0;
        Object.values(newCounts).forEach(c => total += c);
        setTotalUnread(total);
      }
      return newCounts;
    });
  }, []);

  // Get profile picture helper
  const getProfilePic = (pic) => {
    if (!pic) {
      if (authUser?.gender === "female") {
        return `https://avatar.iran.liara.run/public/10.png`;
      }
      return `https://avatar.iran.liara.run/public/1.png`;
    }
    if (pic.startsWith("http")) return pic;
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const cleanPath = pic.startsWith("/uploads") ? pic : `/uploads/${pic.replace(/^\//, "")}`;
    return `${baseURL}${cleanPath}`;
  };

  return (
    <aside className="w-[300px] flex-shrink-0 flex flex-col h-full bg-base-200 border-r border-base-300 hidden lg:flex">
      {/* Top Section (Logo, Chat, Notifications) - auto height */}
      <div className="flex flex-col p-5 border-b border-base-300">

        {/* Navigation Links */}
        <nav className="space-y-1">
          <Link
            to="/chat/all"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 py-2 normal-case text-base-content hover:bg-base-300/50 ${currentPath.startsWith("/chat") ? "bg-base-300 !text-base-content" : ""}`}
          >
            <div className="relative">
              <MessageSquareIcon className="size-5 text-base-content/70" />
              {totalUnread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <span>Chat</span>
          </Link>

          <Link
            to="/notifications"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 py-2 normal-case text-base-content hover:bg-base-300/50 ${currentPath === "/notifications" ? "bg-base-300 !text-base-content" : ""}`}
          >
            <BellIcon className="size-5 text-base-content/70" />
            <span>Notifications</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Section (Friends List) - scrolls */}
      <div className="flex-1 overflow-y-auto mt-4 pb-4">
        <div className="px-4 py-2 sticky top-0 bg-base-200 border-b border-base-300 z-10">
          <p className="text-base-content/60 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
            <UsersIcon className="size-4" />
            FRIENDS ({friends.length})
          </p>
        </div>

        <div className="space-y-1 px-2">
          {friends.length > 0 ? (
            friends.map((friend) => {
              const unreadCount = unreadCounts[friend._id] || 0;
              return (
                <Link
                  key={friend._id}
                  to={`/chat/${friend._id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl w-full text-left text-base-content hover:bg-base-300/50 transition-colors ${currentPath === `/chat/${friend._id}` ? "bg-base-300 !text-base-content" : ""}`}
                >
                  <div className="avatar relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={getProfilePic(friend.profilePic)}
                        alt={friend.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://avatar.iran.liara.run/public/1.png`;
                        }}
                      />
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 size-2.5 border-2 border-base-200 rounded-full ${friend.isOnline ? "bg-success" : "bg-base-content/20"}`}></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate text-sm">{friend.fullName}</p>
                      {unreadCount > 0 && (
                        <span className="bg-error text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <p className="text-xs text-error font-medium truncate">
                        {unreadCount} new message{unreadCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center text-base-content/50">
              <UsersIcon className="size-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No friends yet</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
