"use client";

interface PerformanceRingProps {
  value: number;
  maxValue?: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "green" | "blue" | "yellow" | "red";
  showPercentage?: boolean;
}

export default function PerformanceRing({
  value,
  maxValue = 100,
  label,
  sublabel,
  size = "md",
  color = "primary",
  showPercentage = true,
}: PerformanceRingProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const sizeConfig = {
    sm: { size: 80, stroke: 6, fontSize: "text-lg", labelSize: "text-xs" },
    md: { size: 120, stroke: 8, fontSize: "text-2xl", labelSize: "text-sm" },
    lg: { size: 160, stroke: 10, fontSize: "text-3xl", labelSize: "text-base" },
  };

  const colorConfig = {
    primary: "stroke-primary-500",
    green: "stroke-green-500",
    blue: "stroke-blue-500",
    yellow: "stroke-amber-500",
    red: "stroke-red-500",
  };

  const bgColorConfig = {
    primary: "stroke-primary-100",
    green: "stroke-green-100",
    blue: "stroke-blue-100",
    yellow: "stroke-amber-100",
    red: "stroke-red-100",
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            className={bgColorConfig[color]}
          />
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            className={`${colorConfig[color]} transition-all duration-500 ease-out`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-bold text-gray-900`}>
            {Math.round(value)}{showPercentage && "%"}
          </span>
        </div>
      </div>
      {/* Labels */}
      <div className="mt-3 text-center">
        <p className={`${config.labelSize} font-medium text-gray-900`}>{label}</p>
        {sublabel && (
          <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
