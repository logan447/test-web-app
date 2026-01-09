"use client";

export interface MessageAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}

export default function MessageAvatar({
  name,
  imageUrl,
  size = "md",
  online,
}: MessageAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const onlineDotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const getInitials = (name: string): string => {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getGradientColors = (name: string): string => {
    // Generate consistent gradient based on name
    const colors = [
      "from-blue-400 to-blue-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-green-400 to-green-600",
      "from-yellow-400 to-yellow-600",
      "from-red-400 to-red-600",
      "from-indigo-400 to-indigo-600",
      "from-teal-400 to-teal-600",
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative inline-block flex-shrink-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover shadow-sm ring-2 ring-white`}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full
            bg-gradient-to-br ${getGradientColors(name)}
            flex items-center justify-center
            text-white font-semibold
            shadow-sm ring-2 ring-white
          `}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Online indicator */}
      {online !== undefined && (
        <div
          className={`
            absolute -bottom-0.5 -right-0.5
            ${onlineDotSize[size]}
            rounded-full
            ${online ? "bg-green-500" : "bg-gray-400"}
            ring-2 ring-white
          `}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
