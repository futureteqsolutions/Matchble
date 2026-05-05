import { Link } from "react-router";
import { UserIcon, MessageSquareIcon, UserCircleIcon } from "lucide-react";

const FriendCard = ({ friend }) => {
  // HELPER: Get profile picture URL from backend or return null
  const getProfilePicUrl = (pic) => {
    if (!pic) return null;
    if (pic.startsWith("http")) return pic;
    
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    // Ensure the path is clean
    const cleanPath = pic.startsWith("/uploads") ? pic : `/uploads/${pic.replace(/^\//, "")}`;
    return `${baseURL}${cleanPath}`;
  };

  const profileImg = getProfilePicUrl(friend.profilePic);

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-200 group rounded-3xl overflow-hidden">
      <div className="card-body p-5">
        {/* USER INFO SECTION */}
        <Link to={`/profile/${friend?._id || ''}`} className="flex items-center gap-4 mb-4 group/info">
          <div className="avatar relative">
            <div className={`w-14 h-14 rounded-2xl ring-2 ${friend.isOnline ? "ring-green-400" : "ring-base-300"} ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-200`}>
              {profileImg ? (
                <img
                  src={profileImg}
                  alt={friend.fullName}
                  className="w-full h-full object-cover transition-transform group-hover/info:scale-110"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-base-300">
                  <UserIcon className="size-6 text-base-content/20" />
                </div>
              )}
            </div>
            {/* ONLINE STATUS DOT */}
            <div className={`absolute -bottom-1 -right-1 size-4 border-2 border-base-100 rounded-full z-10 ${friend.isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate group-hover/info:text-primary transition-colors">
              {friend.fullName}
            </h3>
            <p className={`text-[10px] font-black uppercase tracking-widest ${friend.isOnline ? "text-green-500" : "text-base-content/40"}`}>
              {friend.isOnline ? "Active Now" : "Offline"}
            </p>
          </div>
        </Link>

        {/* DETAILS BADGES */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {friend.age && (
            <span className="badge badge-sm font-bold bg-base-200 border-none">{friend.age} yrs</span>
          )}
          {friend.gender && (
            <span className="badge badge-secondary badge-sm border-none font-bold capitalize px-2">
              {friend.gender}
            </span>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-auto">
          <Link 
            to={`/chat/${friend?._id || ''}`} 
            className="btn btn-primary btn-sm flex-1 rounded-xl shadow-md shadow-primary/20 gap-2"
          >
            <MessageSquareIcon className="size-4" />
            Chat
          </Link>
          <Link 
            to={`/profile/${friend?._id || ''}`} 
            className="btn btn-ghost btn-sm rounded-xl border border-base-300 hover:bg-base-200"
          >
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;