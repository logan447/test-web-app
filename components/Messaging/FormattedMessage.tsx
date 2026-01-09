"use client";

import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export interface FormattedMessageProps {
  content: string;
  className?: string;
}

// Configure marked for inline rendering
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
});

export default function FormattedMessage({
  content,
  className = "",
}: FormattedMessageProps) {
  const formattedContent = useMemo(() => {
    if (!content) return "";

    // Step 1: Auto-link URLs
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    let processedContent = content.replace(
      urlPattern,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`
    );

    // Step 2: Parse markdown (supports **bold**, *italic*, `code`)
    // Use parseInline to avoid wrapping in <p> tags
    try {
      processedContent = marked.parseInline(processedContent) as string;
    } catch (error) {
      console.error("Error parsing markdown:", error);
      processedContent = content;
    }

    // Step 3: Sanitize HTML to prevent XSS
    const sanitized = DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: ["b", "i", "strong", "em", "code", "pre", "a", "br"],
      ALLOWED_ATTR: ["href", "target", "rel", "class"],
      ALLOW_DATA_ATTR: false,
    });

    return sanitized;
  }, [content]);

  return (
    <div
      className={`formatted-message ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
      style={{
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
      }}
    />
  );
}
