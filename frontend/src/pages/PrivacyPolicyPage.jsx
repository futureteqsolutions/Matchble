import { HeartIcon, ShieldIcon, LockIcon, MailIcon, CookieIcon } from "lucide-react";
import { Link } from "react-router";

const PrivacyPolicyPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HeartIcon className="size-10 text-pink-500" />
<span className="text-3xl font-bold">Matchgle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
          <p className="opacity-70 mt-2">Last updated: May 2026</p>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <div className="prose prose-sm sm:prose max-w-none">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldIcon className="size-5 text-primary" />
                1. Introduction
              </h2>
              <p>
At Matchgle, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our dating and social networking
                platform. Please read this privacy policy carefully. If you do not agree with the terms 
                of this privacy policy, please do not access the application.
              </p>

              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <LockIcon className="size-5 text-primary" />
                2. Information We Collect
              </h2>
              <p>We collect several types of information from and about users of our Platform, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, gender, and profile pictures</li>
                <li><strong>Profile Information:</strong> Interests, bio, location, and preferences for dating/friendship</li>
                <li><strong> communications:</strong> Messages you send through our chat system</li>
                <li><strong>Usage Data:</strong> Information about how you use our Platform</li>
                <li><strong>Device Data:</strong> IP address, browser type, and device identifiers</li>
              </ul>

              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <CookieIcon className="size-5 text-primary" />
                3. How We Use Your Information
              </h2>
              <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide you with our dating and social networking services</li>
                <li>To help you connect with other users based on shared interests</li>
                <li>To display your profile to other users in your area</li>
                <li>To send you important notifications about your account</li>
                <li>To improve our Platform and user experience</li>
                <li>To comply with legal obligations</li>
              </ul>

              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <ShieldIcon className="size-5 text-primary" />
                4. Information Sharing
              </h2>
              <p>We may share information about you as follows:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With other users:</strong> Your profile information is visible to other users. This includes your name, photos, age, location, bio, and interests.</li>
                <li><strong>With service providers:</strong> Companies that help us operate our Platform</li>
                <li><strong>For legal reasons:</strong> When required by law or to protect our rights</li>
              </ul>

              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <LockIcon className="size-5 text-primary" />
                5. Data Security
              </h2>
              <p>
                We have implemented appropriate technical and organizational security measures designed 
                to protect your personal information. However, no method of transmission over the 
                Internet or electronic storage is 100% secure. While we strive to protect your personal 
                information, we cannot guarantee its absolute security.
              </p>

              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <CookieIcon className="size-5 text-primary" />
                6. Your Rights
              </h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> You can request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> You can request correction of inaccurate personal information</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and personal information</li>
                <li><strong>Opt-out:</strong> You can opt out of certain types of communications</li>
              </ul>

              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <MailIcon className="size-5 text-primary" />
                7. Children's Privacy
              </h2>
              <p>
                Our Platform is not intended for users under 18 years of age. We do not knowingly collect 
                personal information from children under 18. If you are under 18, please do not use 
                our Platform. If we learn that we have collected personal information from a child under 18, 
                we will delete that information immediately.
              </p>

              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <ShieldIcon className="size-5 text-primary" />
                8. Changes to This Policy
              </h2>
              <p>
                We may update our privacy policy from time to time. We will notify you of any changes by 
                posting the new privacy policy on this page and updating the "Last updated" date. You are 
                advised to review this privacy policy periodically for any changes.
              </p>

              <h2 className="text-xl font-bold flex items-center gap-2 mt-6">
                <MailIcon className="size-5 text-primary" />
                9. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
<strong>Email:</strong> privacy@Matchgle.com<br />
                <strong>Address:</strong> Matchgle Inc., [Address Line], [City, State, ZIP]
              </p>
            </div>

            <div className="card-actions justify-end mt-6">
              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>

<div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HeartIcon className="size-6 text-pink-500" />
            <span className="text-xl font-bold">Matchgle</span>
          </div>
          <p className="text-sm opacity-70">© 2026 Matchgle. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

