"use client";

import { useState, useRef, useEffect } from "react";
import {
  type CalendarEvent,
  addToCalendarOptions,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  downloadICSFile,
} from "@/lib/calendarUtils";

interface AddToCalendarButtonProps {
  event: CalendarEvent;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AddToCalendarButton({
  event,
  variant = "secondary",
  size = "md",
  className = "",
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleOptionClick = (action: (event: CalendarEvent) => void) => {
    action(event);
    setIsOpen(false);
  };

  // Variant styles
  const variantStyles = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 border-primary-600",
    secondary:
      "bg-white text-gray-700 hover:bg-gray-50 border-gray-300",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 border-transparent",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
  };

  const iconSizeStyles = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  // Calendar service icons
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "google":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 4.5h-15A1.5 1.5 0 003 6v12a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V6a1.5 1.5 0 00-1.5-1.5zM19 18H5V9h14v9zm0-11H5V6h14v1z" />
            <path d="M7 11h2v2H7zM11 11h2v2h-2zM15 11h2v2h-2zM7 15h2v2H7zM11 15h2v2h-2z" />
          </svg>
        );
      case "apple":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        );
      case "outlook":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.5 4.5h-19A1.5 1.5 0 001 6v12a1.5 1.5 0 001.5 1.5h19A1.5 1.5 0 0023 18V6a1.5 1.5 0 00-1.5-1.5zM8.5 16a3.5 3.5 0 110-7 3.5 3.5 0 010 7zm0-5.5a2 2 0 100 4 2 2 0 000-4zM21 14h-6v-1h6v1zm0-3h-6v-1h6v1z" />
          </svg>
        );
      case "yahoo":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        );
      case "download":
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        );
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2
          border rounded-lg
          font-medium
          transition-colors
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
      >
        <svg
          className={iconSizeStyles[size]}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>Add to Calendar</span>
        <svg
          className={`${iconSizeStyles[size]} transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/5 z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Choose Calendar
              </p>
            </div>
            {addToCalendarOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.action)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400">{getIcon(option.icon)}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
