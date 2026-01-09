"use client";

import { formatDistanceToNow } from "date-fns";

export interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  senderName?: string;
  timestamp: Date;
  showAvatar?: boolean;
  showName?: boolean;
  attachments?: {
    url: string;
    type: string;
    name: string;
    size?: number;
  }[];
  status?: "SENT" | "DELIVERED" | "READ";
}

export default function ModernMessageBubble({
  content,
  isOwn,
  senderName,
  timestamp,
  showAvatar = true,
  showName = false,
  attachments = [],
  status,
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} items-end mb-1 group`}>
      {/* Avatar placeholder (for alignment when hidden) */}
      <div className={`w-8 h-8 flex-shrink-0 ${!showAvatar && "opacity-0"}`}>
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {senderName ? senderName.charAt(0).toUpperCase() : "?"}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%] md:max-w-[65%]`}>
        {/* Sender Name (for received messages in group context) */}
        {showName && !isOwn && senderName && (
          <span className="text-xs font-medium text-gray-600 ml-3 mb-1">
            {senderName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`
            relative rounded-2xl px-4 py-2.5 shadow-sm
            ${isOwn
              ? "bg-primary-600 text-white rounded-br-md"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
            }
            transition-all duration-200 ease-out
            group-hover:shadow-md
          `}
        >
          {/* Message Text */}
          <p className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words ${isOwn ? "text-white" : "text-gray-900"}`}>
            {content}
          </p>

          {/* Attachments (if any) */}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg
                    ${isOwn ? "bg-primary-700" : "bg-gray-50"}
                  `}
                >
                  {attachment.type.startsWith("image/") ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-w-full rounded-lg"
                    />
                  ) : (
                    <>
                      <div className={`p-2 rounded ${isOwn ? "bg-primary-800" : "bg-gray-200"}`}>
                        📎
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isOwn ? "text-white" : "text-gray-900"}`}>
                          {attachment.name}
                        </p>
                        {attachment.size && (
                          <p className={`text-xs ${isOwn ? "text-primary-200" : "text-gray-500"}`}>
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Timestamp and Status */}
          <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <span className={`text-xs ${isOwn ? "text-primary-100" : "text-gray-500"}`}>
              {formatTime(timestamp)}
            </span>

            {/* Status Indicators (for own messages) */}
            {isOwn && status && (
              <div className="flex items-center">
                {status === "SENT" && (
                  <svg className="w-4 h-4 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {status === "DELIVERED" && (
                  <div className="flex -space-x-1">
                    <svg className="w-4 h-4 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-4 h-4 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {status === "READ" && (
                  <div className="flex -space-x-1">
                    <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tail/Pointer for speech bubble effect */}
        <svg
          className={`
            w-3 h-3 absolute
            ${isOwn
              ? "fill-primary-600 -right-1.5 bottom-0"
              : "fill-white -left-1.5 bottom-0"
            }
          `}
          style={{
            filter: isOwn ? "none" : "drop-shadow(0 1px 1px rgba(0,0,0,0.05))",
          }}
          viewBox="0 0 8 13"
        >
          {isOwn ? (
            <path d="M0,0 L8,0 L8,13 C4,11 0,9 0,0 Z" />
          ) : (
            <path d="M8,0 L0,0 L0,13 C4,11 8,9 8,0 Z" />
          )}
        </svg>
      </div>
    </div>
  );
}
