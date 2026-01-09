"use client";

import { useEffect, useRef, useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({
  onEmojiSelect,
  onClose,
}: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Handle clicks outside the picker
  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add a small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleEmojiSelect = (emoji: any) => {
    onEmojiSelect(emoji.native);
  };

  // Don't render on server to avoid hydration issues
  if (!mounted) {
    return (
      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-4">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full right-0 mb-2 z-50"
      style={{
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Picker
        data={data}
        onEmojiSelect={handleEmojiSelect}
        theme="light"
        previewPosition="none"
        skinTonePosition="none"
        maxFrequentRows={2}
        perLine={8}
      />
    </div>
  );
}
