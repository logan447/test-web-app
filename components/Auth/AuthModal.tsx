"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Context for actions that triggered the signup (for contextual handoff)
export interface PendingAction {
  type: 'save' | 'review' | 'contact';
  providerId: string;
  providerName?: string;
  contactReason?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "login" | "signup";
  intent?: "provider" | "family"; // For provider-targeted signup flows
  providerSubtype?: "organization" | "individual"; // For provider intent: org vs individual caregiver
  pendingAction?: PendingAction; // Action that triggered signup (for contextual handoff)
}

// Social auth provider icons
const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

/**
 * AuthModal - Handles login and signup with social auth options.
 *
 * After signup, redirects to destination page with ?onboarding=true param.
 * GlobalOnboardingOverlay (in Providers) reads this param and shows the overlay.
 * This works on ANY page, independent of page-level state.
 */
export default function AuthModal({ isOpen, onClose, defaultView = "signup", intent, providerSubtype, pendingAction }: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState<"login" | "signup">(defaultView);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // All users default to FAMILY role on signup
  const role = "FAMILY";

  // Sync view state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(defaultView);
      setError("");
      setSocialLoading(null);
    }
  }, [isOpen, defaultView]);

  // Handle social auth sign in
  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider);
    setError("");

    try {
      // Build callback URL with intent for post-auth handling
      const params = new URLSearchParams();
      params.set('onboarding', 'true');
      if (intent) {
        params.set('intent', intent);
      }
      if (pendingAction) {
        params.set('action', pendingAction.type);
        params.set('actionProviderId', pendingAction.providerId);
        if (pendingAction.providerName) {
          params.set('actionProviderName', pendingAction.providerName);
        }
      }

      const callbackUrl = intent === "provider"
        ? `/provider/leads?${params.toString()}`
        : `/care-profile?${params.toString()}`;

      await signIn(provider, { callbackUrl });
    } catch (error) {
      setError(`Failed to sign in with ${provider}`);
      setSocialLoading(null);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Close modal and redirect based on intent
      // For login, don't show onboarding (they've already completed it or can do it later)
      onClose();

      // Use client-side navigation to avoid full page reload
      const destination = intent === "provider" ? "/provider/leads" : "/care-profile";
      setTimeout(() => {
        router.push(destination);
        router.refresh(); // Refresh server components to pick up new session
      }, 50);
    } catch (error) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role,
      intent: intent || undefined, // Pass intent for mode initialization
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but login failed. Please try logging in.");
        setLoading(false);
        return;
      }

      // Handle post-signup navigation based on intent
      onClose();

      // Build search params for GlobalOnboardingOverlay
      const params = new URLSearchParams();
      params.set('onboarding', 'true');

      // Set intent param for onboarding overlay
      if (intent === "provider") {
        params.set('intent', 'provider');
        if (providerSubtype) {
          params.set('providerSubtype', providerSubtype);
        }
      } else if (intent === "family") {
        params.set('intent', 'family');
      }
      // If intent is undefined (home page), omit param so wizard shows intent question

      // Include pending action context for contextual handoff after onboarding
      if (pendingAction) {
        params.set('action', pendingAction.type);
        params.set('actionProviderId', pendingAction.providerId);
        if (pendingAction.providerName) {
          params.set('actionProviderName', pendingAction.providerName);
        }
        if (pendingAction.contactReason) {
          params.set('actionContactReason', pendingAction.contactReason);
        }
      }

      // CRITICAL: Use window.location.href for synchronous navigation
      // This eliminates race conditions between session update and URL params.
      const newPath = `${window.location.pathname}?${params.toString()}`;
      window.location.href = newPath;

    } catch (error) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <Image
                    src="/olera-logo.jpg"
                    alt="Olera"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </div>

                <DialogTitle
                  as="h3"
                  className="text-2xl font-bold text-center text-gray-900 mb-2"
                >
                  {view === "login" ? "Welcome back" : "Welcome to Olera"}
                </DialogTitle>
                <p className="text-center text-gray-500 mb-6">
                  {view === "login"
                    ? "Sign in to access your account"
                    : "Find trusted care for your loved ones"}
                </p>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Social Auth Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleSocialSignIn("apple")}
                    disabled={socialLoading !== null || loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === "apple" ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <AppleIcon />
                    )}
                    Continue with Apple
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialSignIn("google")}
                    disabled={socialLoading !== null || loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === "google" ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <GoogleIcon />
                    )}
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialSignIn("facebook")}
                    disabled={socialLoading !== null || loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === "facebook" ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <FacebookIcon />
                    )}
                    Continue with Facebook
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or continue with email</span>
                  </div>
                </div>

                {view === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setView("signup");
                          setError("");
                        }}
                        className="font-semibold text-primary-600 hover:text-primary-500"
                      >
                        Sign up free
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                      </label>
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        id="signup-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="••••••••"
                      />
                      <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setView("login");
                          setError("");
                        }}
                        className="font-semibold text-primary-600 hover:text-primary-500"
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                )}

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    <svg className="w-3.5 h-3.5 text-primary-600 inline-block mr-1 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Your data is protected. We never share without consent.
                  </p>
                  <p className="text-xs text-gray-400">
                    By continuing, you agree to our{" "}
                    <a href="/terms" className="text-primary-600 hover:underline">Terms</a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
