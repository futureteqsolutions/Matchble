import { useState, useRef } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import axios from "axios";
import { 
  LoaderIcon, MapPinIcon, HeartIcon, CameraIcon, 
  CalendarIcon, UserIcon, SparklesIcon, XIcon
} from "lucide-react";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const profileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    dob: "", 
    gender: authUser?.gender || "",
    lookingFor: authUser?.lookingFor || "",
    location: authUser?.location || "",
    interests: authUser?.interests || "",
  });

  const [images, setImages] = useState({
    profilePic: authUser?.profilePic || null,
    additionalPhotos: authUser?.photos || [], 
  });

  const [uploading, setUploading] = useState(false);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Welcome to Matchgle!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save profile");
    },
  });

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        return toast.error("File size too large (Max 5MB)");
    }

    const formData = new FormData();
    formData.append(type === "profile" ? "photo" : "photos", file);

    try {
      setUploading(true);
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const endpoint = type === "profile" ? "/api/upload/profile-pic" : "/api/upload/photos";
      
      const { data } = await axios.post(`${baseURL}${endpoint}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (type === "profile") {
        setImages((prev) => ({ ...prev, profilePic: data.profilePic }));
      } else {
        setImages((prev) => ({ 
          ...prev, 
          additionalPhotos: data.photos 
        }));
      }
      toast.success("Photo uploaded!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed. Try a different image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!images.profilePic) return toast.error("Please upload a profile picture");
    if (images.additionalPhotos.length < 2) return toast.error("Please upload at least 2 more photos");
    if (images.additionalPhotos.length > 6) return toast.error("Maximum 6 additional photos allowed");
    
    const birthDate = new Date(formState.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) return toast.error("You must be at least 18 years old");

    onboardingMutation({ ...formState, profilePic: images.profilePic });
  };

  const renderImage = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;

    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const cleanPath = imagePath.startsWith("/uploads") 
      ? imagePath 
      : `/uploads/${imagePath.replace(/^\//, "")}`;

    return `${baseURL}${cleanPath}`;
  };

  const GENDER_OPTIONS = ["Male", "Female", "Non-binary"];
  const LOOKING_FOR_OPTIONS = ["Long-term", "Short-term", "New Friends", "Casual"];
  
  // Expanded interests (50+)
  const INTERESTS_OPTIONS = [
    // Outdoor & Adventure
    "Hiking", "Camping", "Rock Climbing", "Fishing", "Kayaking", "Surfing", "Skiing", "Snowboarding", "Cycling",
    // Sports
    "Football", "Basketball", "Tennis", "Golf", "Swimming", "Volleyball", "Baseball", "Boxing", "Running", "Yoga",
    // Music & Arts
    "Music", "Playing Guitar", "Piano", "Singing", "Painting", "Drawing", "Photography", "Writing", "Dancing",
    // Entertainment
    "Movies", "TV Shows", "Gaming", "Anime", "Reading", "Podcasts", "Cooking",
    // Creative
    "Art", "Design", "Fashion", "Crafts", "DIY", "Gardening", "Baking",
    // Technology
    "Technology", "Coding", "Science", "Astronomy", "Cars",
    // Social
    "Travel", "Food", "Wine", "Coffee", "Fitness", "Meditation", "Spirituality"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4 py-12">
      <div className="card bg-base-100 w-full max-w-4xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-base-200 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-base-300">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CameraIcon className="size-5 text-pink-500" /> Photos
            </h2>

            {/* Profile Pic Upload */}
            <div 
              className="relative size-40 rounded-2xl border-4 border-white shadow-lg cursor-pointer group mb-4"
              onClick={() => !uploading && profileInputRef.current.click()}
            >
              {images.profilePic ? (
                <img src={renderImage(images.profilePic)} className="w-full h-full object-cover rounded-xl" alt="Profile" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-base-300 rounded-xl">
                  <UserIcon className="size-10 opacity-20" />
                  <span className="text-xs mt-2 font-semibold opacity-50">Profile Pic</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white text-xs">
                Change
              </div>
            </div>

            {/* Additional Photos (2-6) */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div 
                  key={idx}
                  className="aspect-square bg-base-300 rounded-lg cursor-pointer overflow-hidden border-2 border-dashed border-base-content/20 flex items-center justify-center relative"
                  onClick={() => !uploading && photoInputRef.current.click()}
                >
                  {images.additionalPhotos[idx] ? (
                    <>
                      <img src={renderImage(images.additionalPhotos[idx])} className="w-full h-full object-cover" alt="Extra" />
                      <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">
                        {idx + 1}
                      </span>
                    </>
                  ) : (
                    <CameraIcon className="size-6 opacity-30" />
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-[10px] uppercase tracking-widest mt-4 opacity-50 text-center font-bold">
              {uploading ? "Uploading..." : "2-6 Photos Required"}
            </p>

            <input type="file" hidden ref={profileInputRef} onChange={(e) => handleImageUpload(e, "profile")} accept="image/*" />
            <input type="file" hidden ref={photoInputRef} onChange={(e) => handleImageUpload(e, "extra")} accept="image/*" multiple />
          </div>

          <div className="w-full md:w-2/3 p-8">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-rose-600 mb-1">
                <HeartIcon className="inline-block text-pink-500 mr-2" />
                Create Your Matchgle Profile
              </h1>
              <p className="text-sm opacity-60">Complete these steps to start matching.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label-text font-bold mb-2">Full Name</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formState.fullName}
                    onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-2">Birthday</label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formState.dob}
                    onChange={(e) => setFormState({ ...formState, dob: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label-text font-bold mb-2">Gender</label>
                  <select
                    className="select select-bordered"
                    value={formState.gender}
                    onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    {GENDER_OPTIONS.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-2">Looking for</label>
                  <select
                    className="select select-bordered"
                    value={formState.lookingFor}
                    onChange={(e) => setFormState({ ...formState, lookingFor: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    {LOOKING_FOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label-text font-bold mb-2">Location</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  placeholder="City, Country"
                  required
                />
              </div>

              {/* EXPANDED INTERESTS */}
              <div className="form-control">
                <label className="label-text font-bold mb-2">Interests (select all that apply)</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {INTERESTS_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      className={`btn btn-xs rounded-full ${
                        formState.interests?.includes(interest) ? "btn-primary" : "btn-ghost bg-base-200"
                      }`}
                      onClick={() => {
                        const current = formState.interests?.split(",").filter(Boolean) || [];
                        const next = current.includes(interest) ? current.filter(i => i !== interest) : [...current, interest];
                        setFormState({ ...formState, interests: next.join(",") });
                      }}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-xs opacity-50 mt-1">Select your interests</p>
              </div>

              <button className="btn btn-primary w-full" disabled={isPending || uploading} type="submit">
                {isPending ? <LoaderIcon className="animate-spin" /> : <><HeartIcon className="mr-2" /> Start Matching</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
