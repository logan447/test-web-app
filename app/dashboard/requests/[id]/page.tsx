"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type ConsultRequest = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    city: string;
    state: string;
    email: string;
    phone: string;
  };
  familyProfile: {
    user: {
      name: string;
      email: string;
      phone: string | null;
    };
    city: string;
    state: string;
  };
  sender: {
    id: string;
    name: string;
  };
  messages: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }[];
};

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [request, setRequest] = useState<ConsultRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRequest();
    }
  }, [status]);

  useEffect(() => {
    scrollToBottom();
  }, [request?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        router.push("/dashboard/requests");
      }
    } catch (err) {
      console.error("Error fetching request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchRequest();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchRequest();
      }
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const isFamily = session?.user?.role === "FAMILY";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Olera
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/requests" className="text-primary-600 hover:text-primary-700">
            ← Back to Requests
          </Link>
        </div>

        {/* Request Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isFamily ? request.provider.name : request.familyProfile.user.name}
              </h1>
              <p className="text-gray-600">
                {isFamily
                  ? `${request.provider.providerType.split('_').join(' ')} • ${request.provider.city}, ${request.provider.state}`
                  : `${request.familyProfile.city}, ${request.familyProfile.state}`}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="text-gray-900">
                  {isFamily ? request.provider.email : request.familyProfile.user.email}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="text-gray-900">
                  {isFamily ? request.provider.phone : request.familyProfile.user.phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {request.status === "PENDING" && (
            <div className="border-t pt-4 mt-4 flex gap-2">
              <button
                onClick={() => handleStatusUpdate("ACCEPTED")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Accept Request
              </button>
              <button
                onClick={() => handleStatusUpdate("DECLINED")}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Decline Request
              </button>
            </div>
          )}

          {request.status === "ACCEPTED" && (
            <div className="border-t pt-4 mt-4">
              <button
                onClick={() => handleStatusUpdate("COMPLETED")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow flex flex-col" style={{ height: "500px" }}>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>

          {/* Message List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {/* Initial Request Message */}
            <div className="flex">
              <div className="max-w-[70%]">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {request.sender.name}
                  </p>
                  <p className="text-gray-700">{request.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Subsequent Messages */}
            {request.messages.map((message) => {
              const isOwnMessage = message.senderId === session?.user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? "bg-primary-600" : "bg-gray-100"} rounded-lg p-3`}>
                    <p className={`text-sm ${isOwnMessage ? "text-white" : "text-gray-700"}`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-100" : "text-gray-500"}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                disabled={request.status === "DECLINED" || request.status === "COMPLETED"}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim() || request.status === "DECLINED" || request.status === "COMPLETED"}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
            {(request.status === "DECLINED" || request.status === "COMPLETED") && (
              <p className="text-sm text-gray-500 mt-2">
                This conversation is {request.status.toLowerCase()}.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
