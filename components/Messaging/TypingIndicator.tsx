"use client";

export interface TypingIndicatorProps {
  userName: string;
  show: boolean;
}

export default function TypingIndicator({ userName, show }: TypingIndicatorProps) {
  if (!show) return null;

  return (
    <div className="flex items-end gap-2 mb-2 animate-fadeIn">
      {/* Avatar placeholder */}
      <div className="w-8 h-8 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Typing bubble */}
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {/* Animated dots */}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1.4s" }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "200ms", animationDuration: "1.4s" }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "400ms", animationDuration: "1.4s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
