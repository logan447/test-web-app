"use client";

import { useState } from "react";
import { format } from "date-fns";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName: string;
}

export interface ConversationExportProps {
  messages: Message[];
  conversationTitle: string;
  onClose: () => void;
}

export default function ConversationExport({
  messages,
  conversationTitle,
  onClose,
}: ConversationExportProps) {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"txt" | "json">("txt");

  const generateTextExport = () => {
    const lines = [
      `Conversation Export: ${conversationTitle}`,
      `Exported on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`,
      `Total Messages: ${messages.length}`,
      "",
      "=" .repeat(60),
      "",
    ];

    messages.forEach((message, index) => {
      const date = format(new Date(message.createdAt), "MMM d, yyyy h:mm a");
      lines.push(`[${date}] ${message.senderName}:`);
      lines.push(message.content);
      lines.push(""); // Empty line between messages
    });

    return lines.join("\n");
  };

  const generateJSONExport = () => {
    const exportData = {
      conversationTitle,
      exportedAt: new Date().toISOString(),
      totalMessages: messages.length,
      messages: messages.map((msg) => ({
        timestamp: msg.createdAt,
        sender: msg.senderName,
        content: msg.content,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  };

  const handleExport = () => {
    setExporting(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === "txt") {
        content = generateTextExport();
        filename = `conversation-${Date.now()}.txt`;
        mimeType = "text/plain";
      } else {
        content = generateJSONExport();
        filename = `conversation-${Date.now()}.json`;
        mimeType = "application/json";
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error exporting conversation:", error);
      alert("Failed to export conversation. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const messageStats = {
    total: messages.length,
    dateRange: messages.length > 0 ? {
      first: format(new Date(messages[0].createdAt), "MMM d, yyyy"),
      last: format(new Date(messages[messages.length - 1].createdAt), "MMM d, yyyy"),
    } : null,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Export Conversation
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Conversation Stats */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total messages:</span>
              <span className="font-medium text-gray-900">{messageStats.total}</span>
            </div>
            {messageStats.dateRange && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date range:</span>
                <span className="font-medium text-gray-900">
                  {messageStats.dateRange.first} - {messageStats.dateRange.last}
                </span>
              </div>
            )}
          </div>

          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export format
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="txt"
                  checked={exportFormat === "txt"}
                  onChange={(e) => setExportFormat("txt")}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Text File (.txt)</div>
                  <div className="text-xs text-gray-500">
                    Plain text format, easy to read
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={(e) => setExportFormat("json")}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">JSON File (.json)</div>
                  <div className="text-xs text-gray-500">
                    Structured data format
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-800">
              The exported file will contain all messages from this conversation.
              Attachments are not included in the export.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1 px-4 py-2
              border border-gray-300 rounded-lg
              text-gray-700 font-medium
              hover:bg-gray-50
              transition-colors
            "
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="
              flex-1 px-4 py-2
              bg-primary-600 text-white rounded-lg
              font-medium
              hover:bg-primary-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              flex items-center justify-center gap-2
            "
          >
            {exporting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
