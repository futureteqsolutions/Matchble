import { useState, useRef } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding, uploadProfilePhoto, uploadPhotos, deletePhoto } from "../lib/api";
import {
  LoaderIcon,
  MapPinIcon,
  HeartIcon,
  ImageIcon,
  XIcon,
  Upload,
  Trash2,
  Plus,
} from "lucide-react";

const EditProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const profilePicInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    age: authUser?.age || "",
    gender: authUser?.gender || "",
    lookingFor: authUser?.lookingFor || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
    interests: authUser?.interests || "",
    city: authUser?.city || "",
    country: authUser?.country || "",
    relationshipStatus: authUser?.relationshipStatus || "",
  });

  const [photos, setPhotos] = useState(authUser?.photos || []);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  // Upload profile photo
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadProfilePhoto(file);
      setFormState({ ...formState, profilePic: result.profilePic });
      toast.success("Profile photo updated!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  // Upload multiple photos (2-6 allowed)
  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photos.length + files.length > 6) {
      toast.error("Maximum 6 additional photos allowed");
      return;
    }

    if (photos.length + files.length < 2) {
      toast.error("At least 2 additional photos required");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadPhotos(files);
      setPhotos(result.photos);
      toast.success("Photos uploaded!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (error) {
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoUrl) => {
    try {
      await deletePhoto(photoUrl);
      setPhotos(photos.filter((p) => p !== photoUrl));
      toast.success("Photo deleted!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (error) {
      toast.error("Failed to delete photo");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (photos.length < 2) {
      toast.error("Please upload at least 2 additional photos");
      return;
    }
    onboardingMutation({ ...formState, photos });
  };

  // Get profile picture URL helper - gender-based placeholder
  const getProfilePicUrl = (pic) => {
    if (!pic) {
      // Return gender-specific placeholder
      if (formState.gender === "female") {
        return `https://avatar.iran.liara.run/public/10.png`;
      }
      return `https://avatar.iran.liara.run/public/1.png`;
    }
    if (pic.startsWith("/uploads/")) {
      return `${import.meta.env.VITE_API_URL}${pic}`;
    }
    return pic;
  };

  const GENDER_OPTIONS = ["Male", "Female", "Other"];
  const LOOKING_FOR_OPTIONS = [
    "Relationship",
    "Friendship",
    "Casual Dating",
    "Long-term Relationship",
    "Just chatting",
  ];
  const RELATIONSHIP_STATUS = ["Single", "In a relationship", "Engaged", "Married", "Divorced"];
  
  // Expanded interests list (50+ options)
  const INTERESTS_OPTIONS = [
    // Outdoor & Adventure
    "Hiking", "Camping", "Rock Climbing", "Fishing", " Hunting", "Kayaking", "Surfing", "Skiing", "Snowboarding", "Cycling",
    // Sports
    "Football", "Basketball", "Tennis", "Golf", "Swimming", "Volleyball", "Baseball", "Boxing", "MMA", "Running", "Yoga",
    // Music & Arts
    "Music", "Playing Guitar", "Piano", "Singing", "Painting", "Drawing", "Photography", "Writing", "Poetry", "Dancing", "Acting",
    // Entertainment
    "Movies", "TV Shows", "Gaming", "Anime", "Comics", "Reading", "Podcasts", "Cooking", "Cooking Shows",
    // Creative
    "Art", "Design", "Fashion", " crafts", "DIY", "Gardening", "Cooking", "Baking",
    // Technology & Science
    "Technology", "Coding", "Science", "Astronomy", "Gadgets", " Cars", "Investing",
    // Social & Lifestyle
    "Travel", "Food", "Wine", "Coffee", "Fitness", "Meditation", "Spirituality", "Politics", "News",
    // Hobbies
    "Bird Watching", "Astronomy", "Chess", "Card Games", "Board Games", "Woodworking", "Pottery", "Knitting"
  ];

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            <HeartIcon className="inline-block text-pink-500 mr-2" />
            Edit Profile
          </h1>
          <p className="text-center opacity-70 mb-6">Update your profile information</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER - NO RANDOM PHOTO */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="relative">
                <div className="size-32 rounded-full bg-base-300 overflow-hidden ring-4 ring-pink-500 ring-offset-4 ring-offset-base-200">
                  {formState.profilePic ? (
                    <img
                      src={getProfilePicUrl(formState.profilePic)}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://avatar.iran.liara.run/public/1.png`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <HeartIcon className="size-12 text-base-content opacity-40" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => profilePicInputRef.current?.click()}
                  className="absolute bottom-0 right-0 btn btn-circle btn-primary btn-sm"
                  title="Upload profile photo"
                >
                  <Upload className="size-4" />
                </button>
                <input
                  ref={profilePicInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicUpload}
                />
              </div>

              {/* Upload Button Only - NO Random Photo */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => profilePicInputRef.current?.click()}
                  className="btn btn-outline btn-sm"
                  disabled={uploading}
                >
                  <Upload className="size-4 mr-2" />
                  Upload Photo
                </button>
              </div>
            </div>

            {/* ADDITIONAL PHOTOS (2-6) */}
            <div className="space-y-3">
              <label className="label">
                <span className="label-text font-semibold">Additional Photos ({photos.length}/6)</span>
                <button
                  type="button"
                  onClick={() => photosInputRef.current?.click()}
                  className="btn btn-xs btn-primary"
                  disabled={photos.length >= 6 || uploading}
                >
                  <Plus className="size-3 mr-1" />
                  Add Photo
                </button>
              </label>
              <input
                ref={photosInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotosUpload}
              />

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-base-300">
                      <img
                        src={getProfilePicUrl(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://avatar.iran.liara.run/public/1.png`;
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      className="absolute top-1 right-1 btn btn-circle btn-error btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, index) => (
                  <button
                    key={`empty-${index}`}
                    type="button"
                    onClick={() => photosInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-base-300 flex items-center justify-center hover:border-pink-500 transition-colors"
                    disabled={uploading}
                  >
                    <Plus className="size-6 text-base-content opacity-40" />
                  </button>
                ))}
              </div>
              <p className="text-xs opacity-50">Upload 2-6 additional photos</p>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
                required
              />
            </div>

            {/* AGE & GENDER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Age</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formState.age}
                  onChange={(e) => setFormState({ ...formState, age: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Your age"
                  min="18"
                  max="99"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Gender</span>
                </label>
                <select
                  name="gender"
                  value={formState.gender}
                  onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((gender) => (
                    <option key={gender} value={gender.toLowerCase()}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOOKING FOR & RELATIONSHIP STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Looking For</span>
                </label>
                <select
                  name="lookingFor"
                  value={formState.lookingFor}
                  onChange={(e) => setFormState({ ...formState, lookingFor: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">What are you looking for?</option>
                  {LOOKING_FOR_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Relationship Status</span>
                </label>
                <select
                  name="relationshipStatus"
                  value={formState.relationshipStatus}
                  onChange={(e) => setFormState({ ...formState, relationshipStatus: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select status</option>
                  {RELATIONSHIP_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">City</span>
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                  <input
                    type="text"
                    name="city"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="input input-bordered w-full pl-10"
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Country</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formState.country}
                  onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Country"
                />
              </div>
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">About Me</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself..."
              />
            </div>

            {/* INTERESTS - EXPANDED LIST */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Interests (select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={`btn btn-sm ${
                      formState.interests?.includes(interest)
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                    onClick={() => {
                      const currentInterests = formState.interests?.split(",").filter(Boolean) || [];
                      const newInterests = currentInterests.includes(interest)
                        ? currentInterests.filter((i) => i !== interest)
                        : [...currentInterests, interest];
                      setFormState({ ...formState, interests: newInterests.join(",") });
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button className="btn btn-primary w-full" disabled={isPending || uploading} type="submit">
              {!isPending ? (
                <>
                  <HeartIcon className="size-5 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Saving...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
