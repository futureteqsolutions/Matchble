import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, sendFriendRequest, blockUser, getOutgoingFriendReqs, likePhoto } from "../lib/api";
import { 
  HeartIcon, MapPinIcon, CalendarIcon, MessageSquareIcon, 
  UserPlusIcon, ArrowLeftIcon, FlagIcon, ClockIcon, ThumbsUpIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

const UserProfilePage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [likedPhotos, setLikedPhotos] = useState(new Set());

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["userProfile", id],
    queryFn: () => getUserProfile(id),
  });

  // Fetch outgoing requests to check if one was already sent to this user
  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  // Fetch friends to check if already friends
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: () => import("../lib/api").then(api => api.getUserFriends()),
  });

  // Check if request is pending
  const isRequestPending = outgoingRequests.some(
    (req) => req.recipient?._id === id || req.recipient === id
  );

  // Check if already friends
  const isFriend = friends.some(f => f._id === id);

  const { mutate: sendRequestMutation, isPending: sendingRequest } = useMutation({
    mutationFn: () => sendFriendRequest(id),
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries(["outgoingFriendReqs"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    },
  });

  const { mutate: blockMutation, isPending: blocking } = useMutation({
    mutationFn: () => blockUser(id),
    onSuccess: () => {
      toast.success("User blocked");
      queryClient.invalidateQueries(["blockedUsers"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to block user");
    },
  });

  const { mutate: likePhotoMutation } = useMutation({
    mutationFn: ({ photoUrl }) => likePhoto(photoUrl, id),
    onSuccess: (data) => {
      toast.success(`You liked their photo! ${data.likedBy ? `(sent as ${data.likedBy})` : ''}`);
    },
    onError: () => {
      toast.error("Failed to like photo");
    },
  });

  const handleLikePhoto = (photoUrl) => {
    if (likedPhotos.has(photoUrl)) {
      toast("You already liked this photo!");
      return;
    }
    setLikedPhotos(new Set([...likedPhotos, photoUrl]));
    likePhotoMutation({ photoUrl });
  };

  // Get profile picture URL helper
  const getProfilePicUrl = (pic) => {
    if (!pic) return `https://avatar.iran.liara.run/public/1.png`;
    if (pic.startsWith("/uploads/")) {
      return `${import.meta.env.VITE_API_URL}${pic}`;
    }
    return pic;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center">
        <p className="text-error">Failed to load profile</p>
        <Link to="/" className="btn btn-ghost mt-4">
          <ArrowLeftIcon className="size-4 mr-2" />
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-2xl">
        <Link to="/" className="btn btn-ghost btn-sm mb-4">
          <ArrowLeftIcon className="size-4 mr-2" />
          Back
        </Link>

        <div className="card bg-base-200">
          {/* Profile Header with Cover */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-pink-500 to-rose-500 rounded-t-xl"></div>
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-base-200 overflow-hidden bg-base-100">
                  <img
                    src={getProfilePicUrl(user.profilePic)}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://avatar.iran.liara.run/public/1.png`;
                    }}
                  />
                </div>
                {user.isOnline && (
                  <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
            </div>
          </div>

          <div className="card-body pt-20">
            {/* Name and Status */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <div className="flex items-center justify-center gap-2 mt-1 text-sm opacity-70">
                {user.isOnline ? (
                  <span className="text-green-500 font-medium">Online</span>
                ) : (
                  <span>Offline</span>
                )}
              </div>
            </div>

            {/* Basic Info Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {user.age && (
                <span className="badge badge-lg">
                  <CalendarIcon className="size-4 mr-1" />
                  {user.age} years
                </span>
              )}
              {user.gender && (
                <span className="badge badge-secondary badge-lg capitalize">
                  {user.gender}
                </span>
              )}
              {user.relationshipStatus && (
                <span className="badge badge-outline badge-lg">
                  {user.relationshipStatus}
                </span>
              )}
            </div>

            {/* Location */}
            {(user.city || user.country || user.location) && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPinIcon className="size-5 text-pink-500" />
                <span>
                  {[user.city, user.country].filter(Boolean).join(", ") || user.location}
                </span>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm opacity-70">{user.bio}</p>
              </div>
            )}

            {/* Looking For */}
            {user.lookingFor && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Looking For</h3>
                <span className="badge badge-primary">{user.lookingFor}</span>
              </div>
            )}

            {/* Interests */}
            {user.interests && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.split(",").map((interest, idx) => (
                    <span key={idx} className="badge badge-outline">
                      {interest.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Photos with Like Feature */}
            {user.photos && user.photos.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Photos</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {user.photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-base-300">
                        <img
                          src={getProfilePicUrl(photo)}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://avatar.iran.liara.run/public/1.png`;
                          }}
                        />
                      </div>
                      {/* Like button overlay */}
                      <button
                        onClick={() => handleLikePhoto(photo)}
                        className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ${
                          likedPhotos.has(photo) ? "opacity-100" : ""
                        }`}
                        disabled={likedPhotos.has(photo)}
                      >
                        <ThumbsUpIcon className={`size-6 ${likedPhotos.has(photo) ? "text-pink-500 fill-pink-500" : "text-white"}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs opacity-50 mt-2">Click on a photo to like it!</p>
              </div>
            )}

            {/* Action Buttons - Message + Connect */}
            <div className="flex gap-2 mt-6">
              {isFriend ? (
                // Already friends - show Message button prominently
                <Link to={`/chat/${id}`} className="btn btn-secondary flex-1">
                  <MessageSquareIcon className="size-5 mr-2" />
                  Message
                </Link>
              ) : isRequestPending ? (
                // Request pending - show pending state
                <button className="btn btn-disabled bg-gray-400 text-white flex-1 cursor-default">
                  <ClockIcon className="size-5 mr-2" />
                  Pending Request
                </button>
              ) : (
                // Not friends yet - Connect button
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => sendRequestMutation()}
                  disabled={sendingRequest}
                >
                  <UserPlusIcon className="size-5 mr-2" />
                  {sendingRequest ? "Sending..." : "Send Friend Request"}
                </button>
              )}
            </div>

            {/* Block Button */}
            <div className="mt-4">
              <button
                className="btn btn-ghost btn-sm text-error"
                onClick={() => setShowBlockModal(true)}
              >
                <FlagIcon className="size-4 mr-2" />
                Report / Block
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Block User</h3>
            <p className="py-4">
              Are you sure you want to block {user.fullName}? They won't be able to message you or see your profile.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowBlockModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  blockMutation();
                  setShowBlockModal(false);
                }}
                disabled={blocking}
              >
                {blocking ? "Blocking..." : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
