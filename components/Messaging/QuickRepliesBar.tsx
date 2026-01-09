"use client";

export interface QuickReply {
  id: string;
  text: string;
  category?: string;
}

export interface QuickRepliesBarProps {
  onSelectReply: (text: string) => void;
  userRole: "FAMILY" | "PROVIDER";
  disabled?: boolean;
}

// Pre-defined quick replies for families
const familyQuickReplies: QuickReply[] = [
  { id: "1", text: "What are your visiting hours?", category: "general" },
  { id: "2", text: "Do you accept Medicare/Medicaid?", category: "pricing" },
  { id: "3", text: "Can I schedule a tour?", category: "scheduling" },
  { id: "4", text: "What is included in the monthly cost?", category: "pricing" },
  { id: "5", text: "Tell me more", category: "general" },
  { id: "6", text: "Yes, I'm interested", category: "general" },
  { id: "7", text: "No thanks", category: "general" },
  { id: "8", text: "What is your staff-to-resident ratio?", category: "general" },
];

// Pre-defined quick replies for providers
const providerQuickReplies: QuickReply[] = [
  { id: "1", text: "Would you like to schedule a tour?", category: "scheduling" },
  { id: "2", text: "I'd be happy to answer any questions you have.", category: "general" },
  { id: "3", text: "Our visiting hours are flexible to accommodate families.", category: "general" },
  { id: "4", text: "Yes, we accept Medicare and Medicaid.", category: "pricing" },
  { id: "5", text: "I can provide detailed pricing information.", category: "pricing" },
  { id: "6", text: "We'd love to show you our facility!", category: "scheduling" },
  { id: "7", text: "Thank you for your interest!", category: "general" },
  { id: "8", text: "Let me know if you need any additional information.", category: "general" },
];

export default function QuickRepliesBar({
  onSelectReply,
  userRole,
  disabled = false,
}: QuickRepliesBarProps) {
  const quickReplies = userRole === "FAMILY" ? familyQuickReplies : providerQuickReplies;

  return (
    <div className="mb-3 pb-2 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span className="text-xs font-medium text-gray-600">Quick Replies</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickReplies.map((reply) => (
          <button
            key={reply.id}
            type="button"
            onClick={() => onSelectReply(reply.text)}
            disabled={disabled}
            className="
              px-3 py-1.5
              text-sm
              bg-white
              border border-gray-300
              rounded-full
              hover:bg-primary-50 hover:border-primary-300
              active:bg-primary-100
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              whitespace-nowrap
            "
          >
            {reply.text}
          </button>
        ))}
      </div>
    </div>
  );
}
