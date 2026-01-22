"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  pendingAction?: PendingAction; // Action that triggered signup (for contextual handoff)
}

/**
 * AuthModal - Handles login and signup.
 *
 * After signup, redirects to destination page with ?onboarding=true param.
 * GlobalOnboardingOverlay (in Providers) reads this param and shows the overlay.
 * This works on ANY page, independent of page-level state.
 */
export default function AuthModal({ isOpen, onClose, defaultView = "signup", intent, pendingAction }: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState<"login" | "signup">(defaultView);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // All users default to FAMILY role on signup
  const role = "FAMILY";

  // Sync view state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(defaultView);
      setError("");
    }
  }, [isOpen, defaultView]);

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
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
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

      // Provider intent: redirect to edit page (Quick Start modal will show)
      if (intent === "provider") {
        window.location.href = '/provider/profile/edit';
        return;
      }

      // Family intent (or undefined): trigger family onboarding wizard
      // Build search params for GlobalOnboardingOverlay
      const params = new URLSearchParams();
      params.set('onboarding', 'true');

      if (intent === "family") {
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-center text-gray-900 mb-6"
                >
                  {view === "login" ? "Sign in to Olera" : "Create your account"}
                </Dialog.Title>

                {error && (
                  <div className="rounded-md bg-red-50 p-4 mb-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {view === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-600">
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setView("signup");
                          setError("");
                        }}
                        className="font-medium text-primary-600 hover:text-primary-500"
                      >
                        Sign up
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number (optional)
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        id="signup-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {loading ? "Creating account..." : "Create account"}
                    </button>

                    <p className="mt-4 text-center text-sm text-gray-600">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setView("login");
                          setError("");
                        }}
                        className="font-medium text-primary-600 hover:text-primary-500"
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
