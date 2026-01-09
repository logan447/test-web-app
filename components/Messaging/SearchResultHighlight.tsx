"use client";

import { useMemo } from "react";

export interface SearchResultHighlightProps {
  text: string;
  searchQuery: string;
  isCurrentResult?: boolean;
}

export default function SearchResultHighlight({
  text,
  searchQuery,
  isCurrentResult = false,
}: SearchResultHighlightProps) {
  const highlightedText = useMemo(() => {
    if (!searchQuery || !text) {
      return text;
    }

    // Escape special regex characters in search query
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Create regex to find all matches (case insensitive)
    const regex = new RegExp(`(${escapedQuery})`, "gi");

    // Split text by matches
    const parts = text.split(regex);

    return parts.map((part, index) => {
      // Check if this part matches the search query (case insensitive)
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark
            key={index}
            className={`
              ${isCurrentResult ? "bg-orange-300" : "bg-yellow-200"}
              px-0.5 rounded
              transition-colors
            `}
          >
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [text, searchQuery, isCurrentResult]);

  return <>{highlightedText}</>;
}
