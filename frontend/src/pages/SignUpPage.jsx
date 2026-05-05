import { useState } from "react";
import { HeartIcon, MailIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import useSignUp from "../hooks/useSignUp";
import axios from "axios";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email/pass, 2: details
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    lookingFor: "",
    bio: "",
    location: "",
    interests: "",
  });

  const { isPending, error, signupMutation } = useSignUp();

  const [demoOTP, setDemoOTP] = useState('');
  const handleSendVerification = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-verification`, {
        email: signupData.email,
      });
      const data = response.data;
      if (data.demoOTP || data.demoMode) {
        setDemoOTP(data.demoOTP || data.devCode);
        toast.success(`Demo OTP: ${data.demoOTP || data.devCode}`);
      } else {
        toast.success("Verification code sent to your email!");
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send verification code");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        email: signupData.email,
        code: verificationCode,
      });
      toast.success("Email verified! Complete your profile.");
      signupMutation(signupData);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid verification code");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  // Step 1: Email & Password
  if (step === 1) {
    return (
  <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="valentine">

        <div className="border border-pink-200 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
          {/* SIGNUP FORM - LEFT SIDE */}
          <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
            {/* LOGO */}
            <div className="mb-4 flex items-center justify-start gap-2">
              <HeartIcon className="size-9 text-pink-500" />
<span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 tracking-wider">
                Matchgle
              </span>
            </div>

            {/* ERROR MESSAGE IF ANY */}
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error.response.data.message}</span>
              </div>
            )}

            <div className="w-full">
              <form onSubmit={handleSendVerification}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Create an Account</h2>
                    <p className="text-sm opacity-70">
Join Matchgle and find your perfect match!
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* FULLNAME */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input input-bordered w-full"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        required
                      />
                    </div>
{/* EMAIL */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="john@gmail.com"
                        className="input input-bordered w-full"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>
                    {/* PASSWORD with show/hide toggle */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          className="input input-bordered w-full pr-10"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
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
                      <p className="text-xs opacity-70 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input type="checkbox" className="checkbox checkbox-sm" required />
                        <span className="text-xs leading-tight">
                          I agree to the{" "}
                          <span className="text-pink-500 hover:underline">terms of service</span> and{" "}
                          <span className="text-pink-500 hover:underline">privacy policy</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <button className="btn btn-primary w-full" type="submit">
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Sending...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="text-pink-500 hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* SIGNUP FORM - RIGHT SIDE */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-pink-100 items-center justify-center">
            <div className="max-w-md p-8">
              {/* Illustration */}
              <div className="relative aspect-square max-w-sm mx-auto">
                <img src="/i.png" alt="Dating connection illustration" className="w-full h-full" />
              </div>

              <div className="text-center space-y-3 mt-6">
                <h2 className="text-xl font-semibold">Find Your Perfect Match</h2>
                <p className="opacity-70">
Join thousands of people finding love on Matchgle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Verify Code
  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="valentine"
    >
      <div className="border border-pink-200 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* VERIFY FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <HeartIcon className="size-9 text-pink-500" />
<span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 tracking-wider">
              Matchgle
            </span>
          </div>

          <div className="w-full">
            <form onSubmit={handleVerifyCode}>
              <div className="space-y-4">
<div>
                  <h2 className="text-xl font-semibold">Verify Your Email</h2>
                  <p className="text-sm opacity-70">
                    Enter the code sent to {signupData.email}
                  </p>
                  <div className="alert alert-info mb-4 p-3 text-sm">
                    <span>Demo Mode: OTP shown in toast/console. Production: email sent after domain verification.</span>
                  </div>
                  {demoOTP && (
                    <div className="alert alert-success mb-4">
                      <span>Demo OTP: <strong>{demoOTP}</strong></span>
                    </div>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Verification Code</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="input input-bordered w-full"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>

                <button className="btn btn-primary w-full" type="submit">
                  Verify & Continue
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-pink-500 hover:underline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-pink-100 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <HeartIcon className="w-full h-full text-pink-300" />
            </div>
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Almost There!</h2>
              <p className="opacity-70">
                Verify your email to complete registration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

