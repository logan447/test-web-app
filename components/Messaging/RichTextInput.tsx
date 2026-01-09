"use client";

import { useState, useRef, KeyboardEvent } from "react";
import EmojiPicker from "./EmojiPicker";

export interface RichTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichTextInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
}: RichTextInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert formatting at cursor position
  const insertFormatting = (before: string, after: string = before) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // Insert formatting around selection
    const newValue =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      if (selectedText) {
        // If text was selected, place cursor after the closing marker
        textarea.setSelectionRange(start + before.length + selectedText.length, start + before.length + selectedText.length);
      } else {
        // If no text was selected, place cursor between markers
        textarea.setSelectionRange(start + before.length, start + before.length);
      }
      textarea.focus();
    }, 0);
  };

  const handleBold = () => insertFormatting("**");
  const handleItalic = () => insertFormatting("*");
  const handleCode = () => insertFormatting("`");

  const handleEmojiSelect = (emoji: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newValue = value.substring(0, start) + emoji + value.substring(start);

    onChange(newValue);
    setShowEmojiPicker(false);

    // Restore cursor position after emoji
    setTimeout(() => {
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but allow Shift+Enter for new lines)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* Bold Button */}
        <button
          type="button"
          onClick={handleBold}
          disabled={disabled}
          className="
            p-1.5 rounded
            hover:bg-gray-200
            active:bg-gray-300
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h8a4 4 0 100-8H6v8zm0 0h9a4 4 0 110 8H6v-8z" />
          </svg>
        </button>

        {/* Italic Button */}
        <button
          type="button"
          onClick={handleItalic}
          disabled={disabled}
          className="
            p-1.5 rounded
            hover:bg-gray-200
            active:bg-gray-300
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m6 0H8m12 16H8" />
          </svg>
        </button>

        {/* Code Button */}
        <button
          type="button"
          onClick={handleCode}
          disabled={disabled}
          className="
            p-1.5 rounded
            hover:bg-gray-200
            active:bg-gray-300
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          title="Code"
          aria-label="Code"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>

        <div className="flex-1" />

        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={disabled}
          className="
            p-1.5 rounded
            hover:bg-gray-200
            active:bg-gray-300
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          title="Insert emoji"
          aria-label="Emoji"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Help Text */}
        <span className="text-xs text-gray-500 ml-2">
          **bold** *italic* `code`
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="
          w-full px-4 py-3
          border-0
          focus:outline-none
          resize-none max-h-32
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
        style={{
          minHeight: "48px",
          maxHeight: "128px",
        }}
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}
