import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getUserFriends } from "../lib/api";

import {
  Channel,
  Chat,
  MessageInput,
  VirtualizedMessageList,
  Window,
} from "stream-chat-react";

import CustomMessage from "../components/CustomMessage";

import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import {
  Volume2, VolumeX, Phone, Video, ArrowLeft,
  UserIcon, MessageCircle
} from "lucide-react";

import ChatLoader from "../components/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: urlUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendsMap, setFriendsMap] = useState({});

  const { authUser } = useAuthUser();

  // Fetch friends for sidebar
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Build friends map for quick lookup
  useEffect(() => {
    const map = {};
    friends.forEach(friend => {
      map[friend._id] = friend;
    });
    setFriendsMap(map);
  }, [friends]);

  // Set selected friend from URL if present
  useEffect(() => {
    if (urlUserId && urlUserId !== "all" && friendsMap[urlUserId]) {
      setSelectedFriendId(urlUserId);
    }
  }, [urlUserId, friendsMap]);

  // Initialize Stream Chat client
  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        setChatClient(client);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser]);

  const handleNewMessage = useCallback(() => {
    // Handle new message
  }, []);

  const handleTyping = useCallback((event) => {
    // Ignore if it's our own typing
    if (event?.user?.id === authUser?._id) return;
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 3000);
  }, [authUser]);

  // Create channel when friend is selected
  const selectFriend = useCallback(async (friendId) => {
    if (!chatClient || !authUser) return;
    if (selectedFriendId === friendId && channel) return;

    setSelectedFriendId(friendId);

    try {
      // Clean up previous channel events
      if (channel) {
        channel.off("message.new", handleNewMessage);
        channel.off("typing.start", handleTyping);
        await channel.stopWatching();
      }

      const channelId = [authUser._id, friendId].sort().join("-");
      const currChannel = chatClient.channel("messaging", channelId, {
        members: [authUser._id, friendId],
      });

      await currChannel.watch();

      // Mark unread messages as read
      await currChannel.markRead();

      // Dispatch event so sidebar updates unread count
      window.dispatchEvent(new CustomEvent("markMessagesRead", { detail: { friendId } }));

      currChannel.on("message.new", handleNewMessage);
      currChannel.on("typing.start", handleTyping);

      setChannel(currChannel);
      setOtherUser(friendsMap[friendId] || null);
    } catch (error) {
      console.error("Error creating channel:", error);
      toast.error("Could not open chat. Please try again.");
    }
  }, [chatClient, authUser, friendsMap, handleNewMessage, handleTyping, channel, selectedFriendId]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.success(!soundEnabled ? "Sounds enabled" : "Sounds disabled");
  };

  const navigate = useNavigate();

  // Loading state
  if (loading || !chatClient) return <ChatLoader />;

  return (
    <div className="flex h-full flex-1 w-full overflow-hidden bg-base-100">
      {/* Left Sidebar */}
      <div className="w-[350px] flex-shrink-0 flex flex-col border-r border-base-300 bg-base-200">
        <div className="p-4 border-b border-base-300">
          <h2 className="text-xl font-bold flex items-center gap-2 text-base-content">
            <MessageCircle className="text-pink-500" />
            Messages
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <button
                key={friend._id}
                onClick={() => selectFriend(friend._id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-base-300 transition-colors border-b border-base-300 text-base-content ${selectedFriendId === friend._id ? "bg-base-300" : ""}`}
              >
                <div className="avatar relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${friend.fullName.replace(/ /g, '+')}&background=6b7280&color=fff&size=48&rounded=true&bold=true&font-size=0.6`} alt={friend.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 size-3 border-2 border-base-200 rounded-full ${friend.isOnline ? "bg-success" : "bg-base-content/20"}`}></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-semibold truncate text-base-content">{friend.fullName}</h3>
                  <p className={`text-xs ${friend.isOnline ? "text-success" : "text-base-content/60"}`}>
                    {friend.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center opacity-50 text-base-content/60">
              <MessageCircle className="size-12 mx-auto mb-4 text-base-content/40" />
              <p>No friends yet</p>
              <p className="text-sm">Connect with people to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full bg-[#efeae2]">
        {selectedFriendId && channel ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300 text-base-content">
              <div className="flex items-center gap-3">
                <Link to="/chat/all" className="btn btn-ghost btn-circle btn-sm hover:bg-base-300">
                  <ArrowLeft className="size-5" />
                </Link>

                <div className="relative">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${(otherUser?.fullName || 'User').replace(/ /g, '+')}&background=6b7280&color=fff&size=40&rounded=true&bold=true&font-size=0.6`} alt={otherUser?.fullName || "User"} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  {otherUser?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-base-200 rounded-full"></span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">
                    {otherUser?.fullName || "Loading..."}
                  </h3>
                  <p className="text-xs text-success">
                    {otherUser?.isOnline ? "Online" : "Offline"}
                    {isTyping && " • typing..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/profile/${selectedFriendId}`} className="btn btn-ghost btn-circle btn-sm hover:bg-base-300" title="View Profile">
                  <UserIcon className="size-5" />
                </Link>
                <button
                  className="btn btn-ghost btn-circle btn-sm text-pink-500 hover:bg-base-300"
                  title="Video call"
                  onClick={() => navigate(`/call/${selectedFriendId}`)}
                >
                  <Video className="size-5" />
                </button>
                <button
                  className="btn btn-ghost btn-circle btn-sm text-pink-500 hover:bg-base-300"
                  title="Voice call"
                  onClick={() => navigate(`/call/${selectedFriendId}`)}
                >
                  <Phone className="size-5" />
                </button>
                <button
                  className="btn btn-ghost btn-circle btn-sm hover:bg-base-300"
                  onClick={toggleSound}
                  title={soundEnabled ? "Mute" : "Unmute"}
                >
                  {soundEnabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" /> }
                </button>
              </div>
            </div>

            {/* StreamChat - full height */}
            <div className="flex-1 flex flex-col min-h-0">
              <Chat client={chatClient} theme="team light">
                <Channel channel={channel}>
                  <Window>
                    <VirtualizedMessageList
                      Message={CustomMessage}
                      additionalVirtuosoProps={{
                        components: {
                          EmptyPlaceholder: () => null,
                          Footer: () => null,
                          Header: () => null,
                        },
                      }}
                    />

                    <MessageInput 
                      inputClassName="input input-bordered flex-1 rounded-full h-12 text-base-content placeholder:text-base-content/60 bg-transparent"
                      sendButtonClassName="btn btn-circle h-12 w-12 bg-pink-500 hover:bg-pink-600 border-none ml-2"
                      overrideClassNames={{
                        messageInputContainer: "p-4 border-t border-base-300 bg-base-100 flex items-center gap-2",
                        messageInput: "h-12 bg-transparent pr-0",
                      }}
                    />
                  </Window>
                </Channel>
              </Chat>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-base-content/60">
            <div className="text-center">
              <MessageCircle className="size-24 mx-auto mb-4 text-base-content/40" />
              <p className="text-xl font-semibold mb-2 text-base-content/80">Select a conversation</p>
              <p className="text-sm">Choose a friend from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;