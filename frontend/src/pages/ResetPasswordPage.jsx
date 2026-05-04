import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { HeartIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react";

const ResetPasswordPage = () => {
  // MODIFIED: Changed 'token' to 'resetToken'
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // MODIFIED: Passing resetToken in the URL
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${resetToken}`,
        { password }
      );
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="h-screen flex items-center justify-center p-4" data-theme="valentine">

      <div className="border border-pink-200 flex flex-col lg:flex-row w-full max-w-lg mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <div className="w-full p-8">
          <div className="mb-6 flex items-center justify-start gap-2">
            <HeartIcon className="size-9 text-pink-500" />
<span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 tracking-wider">
              Matchgle
            </span>
          </div>

          <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
          <p className="text-sm opacity-70 mb-6">Enter your new password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="input input-bordered w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-circle btn-sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="input input-bordered w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <LockIcon className="size-4 mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;