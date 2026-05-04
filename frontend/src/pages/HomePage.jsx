import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getFriendRequests,
  searchUsers
} from "../lib/api";
import { Link } from "react-router";
import { 
  CheckCircleIcon, 
  MapPinIcon, 
  UserPlusIcon, 
  UsersIcon, 
  FilterIcon,
  SearchIcon,
  XIcon
} from "lucide-react";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [genderFilter, setGenderFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users", genderFilter],
    queryFn: () => getRecommendedUsers(genderFilter),
    enabled: !isSearching, // Don't fetch recommended when searching
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const incomingRequestCount = incomingRequests?.incomingReqs?.length || 0;

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data, userId) => {
      toast.success("Friend request sent!");
      // Immediately add to outgoingRequestsIds so UI updates right away
      setOutgoingRequestsIds(prev => new Set([...prev, userId]));
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  });

  // Handle search
  const { mutate: searchMutation, isPending: searching } = useMutation({
    mutationFn: searchUsers,
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: () => {
      setSearchResults([]);
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 1) {
      setIsSearching(true);
      searchMutation(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Debounced autocomplete search
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery.trim());
        setSuggestions(results.slice(0, 5));
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-wrapper')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  // Filter out friends from discovery users
  const filteredDiscoveryUsers = useMemo(() => {
    const friendIds = new Set(friends.map(f => f._id));
    return recommendedUsers.filter(user => !friendIds.has(user._id));
  }, [recommendedUsers, friends]);

  // Display users based on search or discovery
  const displayUsers = isSearching ? searchResults : filteredDiscoveryUsers;

  // HELPER: To render images correctly from the backend
  const renderImage = (imagePath) => {
    if (!imagePath) return `https://avatar.iran.liara.run/public/1`;
    if (imagePath.startsWith("http")) return imagePath;
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    return `${baseURL}${imagePath.startsWith("/") ? imagePath : "/uploads/" + imagePath}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-base-300 pb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Discover Friends</h2>
            <p className="opacity-70">Find friends and start talking</p>
          </div>

          {/* Friend Requests Button with Count */}
          <Link to="/notifications" className="btn btn-outline gap-2 relative">
            <UsersIcon className="size-4" />
            Friend Requests
            {incomingRequestCount > 0 && (
              <span className="badge badge-error badge-sm absolute -top-2 -right-2 text-white">
                {incomingRequestCount}
              </span>
            )}
          </Link>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 search-wrapper">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content opacity-50" />
            <input
              type="text"
              placeholder="Search users by name..."
              className="input input-bordered w-full pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === "") {
                  setIsSearching(false);
                  setSearchResults([]);
                }
              }}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <XIcon className="size-5 text-base-content opacity-50" />
              </button>
            )}

            {/* AUTOCOMPLETE DROPDOWN */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                {suggestions.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user._id}`}
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors border-b border-base-300 last:border-b-0"
                  >
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={renderImage(user.profilePic)}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${user.fullName.replace(/ /g, '+')}&background=random&color=fff&size=40`;
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.fullName}</p>
                      <p className="text-xs opacity-60">
                        {user.age && `${user.age} yrs`}
                        {user.location && ` • ${user.location}`}
                      </p>
                    </div>
                    <UserPlusIcon className="size-4 opacity-40" />
                  </Link>
                ))}
              </div>
            )}
            {showDropdown && suggestions.length === 0 && searchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 p-4 text-center text-sm opacity-60">
                No users found
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={searching || searchQuery.trim().length < 1}
          >
            {searching ? <span className="loading loading-spinner loading-sm"></span> : "Search"}
          </button>
        </form>

        {/* FILTERS - Only show when not searching */}
        {!isSearching && (
          <div className="flex items-center justify-end gap-2">
            <FilterIcon className="size-4 mr-1 opacity-50" />
            <div className="join">
              <button
                className={`join-item btn btn-xs sm:btn-sm ${genderFilter === "all" ? "btn-primary" : "btn-ghost bg-base-200"}`}
                onClick={() => setGenderFilter("all")}
              >
                All
              </button>
              <button
                className={`join-item btn btn-xs sm:btn-sm ${genderFilter === "female" ? "btn-secondary" : "btn-ghost bg-base-200"}`}
                onClick={() => setGenderFilter("female")}
              >
                Women
              </button>
              <button
                className={`join-item btn btn-xs sm:btn-sm ${genderFilter === "male" ? "btn-accent" : "btn-ghost bg-base-200"}`}
                onClick={() => setGenderFilter("male")}
              >
                Men
              </button>
            </div>
          </div>
        )}

        {/* SEARCH RESULTS INDICATOR */}
        {isSearching && (
          <div className="text-sm opacity-70">
            Showing results for "{searchQuery}" ({searchResults.length} found)
          </div>
        )}

        {/* DISCOVERY GRID */}
        {loadingUsers || searching ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="card bg-base-200 p-10 text-center border border-dashed border-base-300">
            <h3 className="font-semibold text-lg mb-2">
              {isSearching ? "No users found" : "No new users found"}
            </h3>
            <p className="opacity-60">
              {isSearching ? "Try a different search term" : "You've seen everyone! Check back later."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayUsers.map((user) => {
              const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
              const isFriend = friends.some(f => f._id === user._id);

              return (
                <div
                  key={user._id}
                  className="card bg-base-200 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20"
                >
                  <div className="card-body p-5 space-y-4">
                    {/* User Info - Clickable to Profile */}
                    <Link to={`/profile/${user._id}`} className="flex items-center gap-4 group">
                      <div className="avatar relative">
                        {/* ONLINE STATUS INDICATOR */}
                        <div className={`absolute bottom-0 right-0 size-4 border-2 border-base-200 rounded-full z-10 ${user.isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
                        
                        <div className="size-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 group-hover:ring-secondary transition-all overflow-hidden">
                          <img 
                            src={renderImage(user.profilePic)} 
                            alt={user.fullName}
                            onError={(e) => {
                              e.target.src = `https://avatar.iran.liara.run/public/1`;
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors text-balance">
                          {user.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {user.age && <span className="badge badge-sm badge-outline font-medium">{user.age} yrs</span>}
                          {user.location && (
                            <div className="flex items-center text-[10px] uppercase tracking-wider font-bold opacity-50">
                              <MapPinIcon className="size-3 mr-0.5" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge badge-sm badge-ghost capitalize">{user.gender}</span>
                      <span className="badge badge-sm badge-secondary badge-outline">{user.lookingFor || "Friendship"}</span>
                    </div>

                    {user.bio && (
                      <p className="text-sm opacity-70 line-clamp-2 italic">
                        "{user.bio}"
                      </p>
                    )}

                    {/* ACTION BUTTONS - Connect or Message */}
                    <div className="flex gap-2 mt-2">
                      {isFriend ? (
                        // If already friends, show Message button
                        <Link
                          to={`/chat/${user._id}`}
                          className="btn btn-secondary flex-1"
                        >
                          Message
                        </Link>
                      ) : hasRequestBeenSent ? (
                        // If request pending
                        <button
                          className="btn btn-disabled flex-1"
                          disabled
                        >
                          <CheckCircleIcon className="size-4 mr-2" />
                          Pending
                        </button>
                      ) : (
                        // Send friend request
                        <button
                          className="btn btn-primary flex-1"
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={isPending}
                        >
                          <UserPlusIcon className="size-4 mr-2" />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
