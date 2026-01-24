"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailRequests: true,
    emailUpdates: false,
    emailMarketing: false,
  });

  useEffect(() => {
    if (status === "loading") return;

    // Only redirect to login if session status is definitively unauthenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Session is authenticated but data might still be loading
    if (!session) return;

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Validate password change if attempted
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setMessage({
            type: "error",
            text: "Current password is required to set a new password",
          });
          setSaving(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({
            type: "error",
            text: "New passwords do not match",
          });
          setSaving(false);
          return;
        }
        if (formData.newPassword.length < 8) {
          setMessage({
            type: "error",
            text: "New password must be at least 8 characters",
          });
          setSaving(false);
          return;
        }
      }

      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
          notifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setMessage({
        type: "success",
        text: "Settings updated successfully!",
      });

      // Update session with new name
      if (formData.name !== session?.user.name) {
        await update({ name: formData.name });
      }

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: "account", label: "Account", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: "notifications", label: "Notifications", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )},
    { id: "security", label: "Security", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
    { id: "privacy", label: "Privacy", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )},
  ];

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        {/* Skeleton Hero */}
        <div className="bg-gradient-to-br from-gray-600 via-gray-700 to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded-lg w-1/3 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="animate-pulse">
              <div className="bg-white rounded-xl p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 animate-pulse">
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-gray-600 via-gray-700 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Account Settings</h1>
              <p className="text-gray-300 mt-1">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-24">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={activeSection === section.id ? "text-primary-600" : "text-gray-400"}>
                    {section.icon}
                  </span>
                  {section.label}
                </button>
              ))}

              <div className="border-t border-gray-100 my-2"></div>

              <Link
                href="/terms"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Terms of Service
              </Link>

              <Link
                href="/privacy"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information */}
          {activeSection === "account" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Account Information
                  </h2>
                  <p className="text-sm text-gray-500">Update your personal details</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed pr-24"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
                    Verified
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Contact support to change your email address
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* User Role Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                      session?.user.role === "FAMILY"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {session?.user.role === "FAMILY" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                    {session?.user.role === "FAMILY"
                      ? "Family Account"
                      : "Provider Account"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Notification Preferences */}
          {activeSection === "notifications" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Email Notifications
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose which emails you&apos;d like to receive
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-1">
              {/* Messages Notification */}
              <label htmlFor="emailMessages" className="flex items-start p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center h-6">
                  <input
                    id="emailMessages"
                    type="checkbox"
                    checked={notifications.emailMessages}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailMessages: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-4">
                  <span className="text-sm font-medium text-gray-900">
                    New Messages
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Get notified when you receive new messages from{" "}
                    {session?.user.role === "FAMILY" ? "providers" : "families"}
                  </p>
                </div>
              </label>

              {/* Requests Notification */}
              <label htmlFor="emailRequests" className="flex items-start p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center h-6">
                  <input
                    id="emailRequests"
                    type="checkbox"
                    checked={notifications.emailRequests}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailRequests: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-4">
                  <span className="text-sm font-medium text-gray-900">
                    Consultation Requests
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Get notified about new consultation requests and status updates
                  </p>
                </div>
              </label>

              {/* Platform Updates */}
              <label htmlFor="emailUpdates" className="flex items-start p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center h-6">
                  <input
                    id="emailUpdates"
                    type="checkbox"
                    checked={notifications.emailUpdates}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailUpdates: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-4">
                  <span className="text-sm font-medium text-gray-900">
                    Platform Updates
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Get notified about new features and improvements
                  </p>
                </div>
              </label>

              {/* Marketing */}
              <label htmlFor="emailMarketing" className="flex items-start p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center h-6">
                  <input
                    id="emailMarketing"
                    type="checkbox"
                    checked={notifications.emailMarketing}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        emailMarketing: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-4">
                  <span className="text-sm font-medium text-gray-900">
                    Tips and Resources
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Receive helpful caregiving tips and resources
                  </p>
                </div>
              </label>
            </div>
          </div>
          )}

          {/* Change Password (Security) */}
          {activeSection === "security" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-500">
                    Leave blank to keep your current password
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  autoComplete="current-password"
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  autoComplete="new-password"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Must be at least 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
          )}

          {/* Privacy & Data */}
          {activeSection === "privacy" && (
          <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Privacy & Data
                  </h2>
                  <p className="text-sm text-gray-500">Manage your data and privacy settings</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Download Your Data
                    </h3>
                    <p className="text-sm text-gray-500">
                      Request a copy of your personal information
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm bg-white text-primary-600 hover:text-primary-700 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  Request
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Privacy Policy
                    </h3>
                    <p className="text-sm text-gray-500">
                      Read our privacy policy
                    </p>
                  </div>
                </div>
                <Link
                  href="/privacy"
                  className="text-sm bg-white text-primary-600 hover:text-primary-700 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden">
            <div className="p-6 border-b border-red-200 bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-900">
                    Danger Zone
                  </h2>
                  <p className="text-sm text-red-600">Irreversible actions</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete your account? This action cannot be undone."
                      )
                    ) {
                      alert("Account deletion would be processed here");
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
          </>
          )}

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
