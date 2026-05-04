import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import {
  changePassword,
  deleteAccount,
  updateSettings,
  getBlockedUsers,
  unblockUser,
} from "../lib/api";
import {
  ShieldIcon,
  TrashIcon,
  LockIcon,
  UserIcon,
  BellIcon,
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  Volume2,
  VolumeX,
  MessageSquare,
  UserMinus,
  UserPlus,
} from "lucide-react";

const SettingsPage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Change password state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  // Get user settings
  const settings = authUser?.settings || {};

  // Fetch blocked users
  const { data: blockedUsers = [] } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
  });

  // Change password mutation
  const { mutate: changePasswordMutation, isPending: changingPassword } = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });

  // Delete account mutation
  const { mutate: deleteAccountMutation, isPending: deletingAccount } = useMutation({
    mutationFn: (reason) => deleteAccount(reason),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      queryClient.clear();
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete account");
    },
  });

  // Update settings mutation
  const { mutate: updateSettingsMutation } = useMutation({
    mutationFn: (newSettings) => updateSettings(newSettings),
    onSuccess: (data) => {
      toast.success("Settings updated!");
      queryClient.invalidateQueries(["authUser"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  // Unblock user mutation
  const { mutate: unblockMutation } = useMutation({
    mutationFn: (userId) => unblockUser(userId),
    onSuccess: () => {
      toast.success("User unblocked");
      queryClient.invalidateQueries(["blockedUsers"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to unblock user");
    },
  });

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    changePasswordMutation({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleDeleteAccount = () => {
    if (!deleteReason.trim()) {
      toast.error("Please provide a reason for deleting your account");
      return;
    }
    deleteAccountMutation(deleteReason);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSettingChange = (key, value) => {
    updateSettingsMutation({ [key]: value });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <HeartIcon className="size-8 text-pink-500" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        {/* Profile Quick Link */}
        <section className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <UserIcon className="size-5" />
              Profile
            </h2>
            <p className="text-sm opacity-70 mb-4">
              View and edit your profile information
            </p>
            <Link to="/edit-profile" className="btn btn-primary btn-sm w-fit">
              <UserIcon className="size-4 mr-2" />
              Edit Profile
            </Link>
          </div>
        </section>

        {/* Sound & Notification Settings */}
        <section className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <BellIcon className="size-5" />
              Notifications & Sounds
            </h2>
            <p className="text-sm opacity-70 mb-4">
              Customize how you receive notifications
            </p>

            <div className="space-y-4">
              {/* Master Sound Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="size-5 text-pink-500" />
                  ) : (
                    <VolumeX className="size-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">Sound Effects</p>
                    <p className="text-xs opacity-70">Enable or disable all sounds</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.soundEnabled ?? true}
                  onChange={(e) => handleSettingChange("soundEnabled", e.target.checked)}
                />
              </div>

              {/* Message Sound */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-5 text-pink-500" />
                  <div>
                    <p className="font-medium">Message Notifications</p>
                    <p className="text-xs opacity-70">Sound when you receive a message</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.messageSound ?? true}
                  onChange={(e) => handleSettingChange("messageSound", e.target.checked)}
                  disabled={!settings.soundEnabled}
                />
              </div>

              {/* Notification Sound */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellIcon className="size-5 text-pink-500" />
                  <div>
                    <p className="font-medium">Friend Request Notifications</p>
                    <p className="text-xs opacity-70">Sound for new friend requests</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.notificationSound ?? true}
                  onChange={(e) => handleSettingChange("notificationSound", e.target.checked)}
                  disabled={!settings.soundEnabled}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Blocked Users */}
        <section className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <UserMinus className="size-5" />
              Blocked Users
            </h2>
            <p className="text-sm opacity-70 mb-4">
              Manage users you've blocked
            </p>

            {blockedUsers.length === 0 ? (
              <p className="text-sm opacity-70">No blocked users</p>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-2 bg-base-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={user.profilePic || `https://avatar.iran.liara.run/public/1.png`}
                            alt={user.fullName}
                          />
                        </div>
                      </div>
                      <span className="font-medium">{user.fullName}</span>
                    </div>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => unblockMutation(user._id)}
                    >
                      <UserPlus className="size-3 mr-1" />
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Change Password Section */}
        <section className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <LockIcon className="size-5" />
              Change Password
            </h2>
            <p className="text-sm opacity-70 mb-4">
              Update your password to keep your account secure
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter current password"
                    className="input input-bordered w-full pr-12"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password"
                    className="input input-bordered w-full pr-12"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt">At least 6 characters</span>
                </label>
              </div>

              {/* Confirm New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="input input-bordered w-full pr-12"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Changing...
                  </>
                ) : (
                  <>
                    <LockIcon className="size-4 mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Privacy & Terms */}
        <section className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <ShieldIcon className="size-5" />
              Privacy & Terms
            </h2>
            <p className="text-sm opacity-70 mb-4">
              Learn about how we protect your privacy
            </p>
            <Link to="/privacy-policy" className="btn btn-outline btn-sm w-fit">
              <ShieldIcon className="size-4 mr-2" />
              View Privacy Policy
            </Link>
          </div>
        </section>

        {/* Delete Account Section */}
        <section className="card bg-error/10 border border-error">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2 text-error">
              <TrashIcon className="size-5" />
              Delete Account
            </h2>
            <p className="text-sm opacity-70 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error btn-outline btn-sm w-fit"
            >
              <TrashIcon className="size-4 mr-2" />
              Delete My Account
            </button>
          </div>
        </section>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrashIcon className="size-5 text-error" />
                Delete Account
              </h3>
              <p className="py-4 text-sm opacity-70">
                Are you sure you want to delete your account? This action is permanent and cannot be undone.
                All your data, messages, and connections will be permanently removed.
              </p>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Why are you leaving? (Optional)</span>
                </label>
                <select
                  className="select select-bordered"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                >
                  <option value="">Select a reason</option>
                  <option value="Found a partner">Found a partner</option>
                  <option value="Not meeting people">Not meeting people</option>
                  <option value="Privacy concerns">Privacy concerns</option>
                  <option value="Too many fake profiles">Too many fake profiles</option>
                  <option value="Better alternative">Found a better alternative</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="modal-action">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-ghost"
                  disabled={deletingAccount}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-error"
                  disabled={deletingAccount}
                >
                  {deletingAccount ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete Permanently"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
